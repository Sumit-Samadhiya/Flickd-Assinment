/**
 * aiService.ts
 *
 * Client-side AI generation service.
 *
 * SECURITY CONTRACT:
 *   - This file never holds or reads AI provider API keys (OpenAI, Replicate, etc.)
 *   - All generation requests go to our own backend proxy
 *   - The backend owns secret management, provider calls, and abuse prevention
 *   - This service handles: request building, job polling, retries, cancellation
 */

import axios, { type AxiosInstance, isAxiosError } from 'axios';
import Constants from 'expo-constants';
import { API_CONFIG, STYLE_CONFIG } from '@utils/constants';
import { buildFinalPrompt } from '@utils/prompts';
import { deduplicateArray, delay, getBackoffDelay, devLog, clamp } from '@utils/helpers';
import { isValidStyle, isValidBase64Image, isValidCustomPrompt } from '@utils/validators';
import type {
  ClipArtStyle,
  GenerationStatus,
  GenerationRequest,
  GenerationResponse,
  BatchGenerationRequest,
  BatchGenerationResponse,
  CreateGenerationJobRequest,
  CreateGenerationJobResponse,
  GenerationJobStatusResponse,
  AIServiceConfig,
} from '@appTypes/index';

// ─── Normalized Service Error ─────────────────────────────────────────────────

export class AIServiceError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly statusCode?: number;

  constructor(message: string, code: string, retryable = false, statusCode?: number) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.retryable = retryable;
    this.statusCode = statusCode;
    // Restore prototype chain (needed when extending built-ins in TS)
    Object.setPrototypeOf(this, AIServiceError.prototype);
  }
}

// ─── Terminal job statuses ────────────────────────────────────────────────────

const TERMINAL_STATUSES = new Set<GenerationStatus>([
  'completed',
  'partial',
  'failed',
  'cancelled',
]);

// ─── Config reader ────────────────────────────────────────────────────────────

function readBackendUrl(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extra: Record<string, any> | undefined = (Constants as any).expoConfig?.extra;
  if (typeof extra?.backendUrl === 'string' && extra.backendUrl.length > 0) {
    return extra.backendUrl as string;
  }
  // Fallback for Expo Go / local dev without app.config.ts extra
  return 'http://localhost:3000';
}

function readApiTimeout(): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extra: Record<string, any> | undefined = (Constants as any).expoConfig?.extra;
  return typeof extra?.apiTimeout === 'number' ? extra.apiTimeout as number : API_CONFIG.REQUEST_TIMEOUT;
}

// ─── AIService Class ──────────────────────────────────────────────────────────

export class AIService {
  private readonly client: AxiosInstance;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly pollIntervalMs: number;
  private readonly maxPollDurationMs: number;

  constructor(config: AIServiceConfig) {
    if (!config.apiBaseUrl) {
      throw new AIServiceError(
        'Backend URL is not configured. Set BACKEND_URL in your .env file.',
        'ERR_CONFIG',
        false,
      );
    }

    this.maxRetries = config.maxRetries;
    this.retryDelayMs = config.retryDelayMs;
    this.pollIntervalMs = config.pollIntervalMs;
    this.maxPollDurationMs = config.maxPollDurationMs;

    this.client = axios.create({
      baseURL: config.apiBaseUrl.replace(/\/$/, ''),
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'clipartai-android/1.0',
      },
    });
  }

  // ─── Public: Single Style Generation ───────────────────────────────────────

  async generateClipArt(
    request: GenerationRequest,
    signal?: AbortSignal,
  ): Promise<GenerationResponse> {
    const { imageBase64, style, intensity = STYLE_CONFIG.DEFAULT_INTENSITY, customPrompt } =
      request;

    this.validateSingleRequest(imageBase64, style, intensity, customPrompt);

    const jobResponse = await this.createGenerationJob(
      { imageBase64, styles: [style], intensity, customPrompt },
      signal,
    );

    const finalStatus = await this.waitForGenerationCompletion(jobResponse.jobId, signal);

    const result = finalStatus.results.find(r => r.styleType === style);

    if (!result) {
      const failed = finalStatus.failedStyles?.find(f => f.style === style);
      throw new AIServiceError(
        failed?.error ?? `Generation failed for style: ${style}`,
        'ERR_GENERATION_FAILED',
        false,
      );
    }

    return result;
  }

  // ─── Public: Batch Generation (all styles in one job) ─────────────────────

  async generateAllStyles(
    request: BatchGenerationRequest,
    signal?: AbortSignal,
    onProgress?: (progress: number, partial: GenerationResponse[]) => void,
  ): Promise<BatchGenerationResponse> {
    const {
      imageBase64,
      styles,
      intensity = STYLE_CONFIG.DEFAULT_INTENSITY,
      customPrompt,
    } = request;

    if (!isValidBase64Image(imageBase64)) {
      throw new AIServiceError('Valid image data is required.', 'ERR_INVALID_IMAGE', false);
    }

    const validStyles = deduplicateArray(styles.filter(isValidStyle));

    if (validStyles.length === 0) {
      throw new AIServiceError(
        'At least one valid style must be selected.',
        'ERR_INVALID_STYLES',
        false,
      );
    }

    const clampedIntensity = clamp(intensity, 1, 10);
    const startTime = Date.now();

    const jobResponse = await this.createGenerationJob(
      { imageBase64, styles: validStyles, intensity: clampedIntensity, customPrompt },
      signal,
    );

    devLog('Batch job created', { jobId: jobResponse.jobId, styles: validStyles });

    const finalStatus = await this.waitForGenerationCompletion(
      jobResponse.jobId,
      signal,
      statusUpdate => {
        onProgress?.(statusUpdate.progress, statusUpdate.results);
      },
    );

    // Sort results to match requested style order
    const sortedResults = [...finalStatus.results].sort(
      (a, b) => validStyles.indexOf(a.styleType) - validStyles.indexOf(b.styleType),
    );

    return {
      results: sortedResults,
      totalGenerationTime: Date.now() - startTime,
      successCount: sortedResults.length,
      failureCount: finalStatus.failedStyles?.length ?? 0,
      failedStyles: finalStatus.failedStyles,
    };
  }

  // ─── Public: Create Generation Job ────────────────────────────────────────

  async createGenerationJob(
    request: CreateGenerationJobRequest,
    signal?: AbortSignal,
  ): Promise<CreateGenerationJobResponse> {
    if (!isValidBase64Image(request.imageBase64)) {
      throw new AIServiceError('Valid image data is required.', 'ERR_INVALID_IMAGE', false);
    }
    if (!request.styles || request.styles.length === 0) {
      throw new AIServiceError('At least one style is required.', 'ERR_INVALID_STYLES', false);
    }

    const clampedIntensity = clamp(request.intensity ?? STYLE_CONFIG.DEFAULT_INTENSITY, 1, 10);

    // Build prompts client-side and send to backend
    // Backend may override or enrich but has a starting point
    const prompts: Partial<Record<ClipArtStyle, string>> = {};
    for (const style of request.styles) {
      prompts[style] = buildFinalPrompt(style, clampedIntensity, request.customPrompt);
    }

    return this.withRetry(async () => {
      const response = await this.client.post<CreateGenerationJobResponse>(
        '/v1/generations',
        {
          imageBase64: request.imageBase64,
          styles: request.styles,
          intensity: clampedIntensity,
          ...(request.customPrompt ? { customPrompt: request.customPrompt } : {}),
          prompts,
        },
        { signal },
      );
      return response.data;
    });
  }

  // ─── Public: Get Job Status ────────────────────────────────────────────────

  async getGenerationJobStatus(
    jobId: string,
    signal?: AbortSignal,
  ): Promise<GenerationJobStatusResponse> {
    if (!jobId || jobId.trim().length === 0) {
      throw new AIServiceError('Job ID is required.', 'ERR_INVALID_JOB_ID', false);
    }

    const response = await this.client.get<GenerationJobStatusResponse>(
      `/v1/generations/${encodeURIComponent(jobId)}`,
      { signal },
    );
    return response.data;
  }

  // ─── Public: Poll Until Terminal Status ───────────────────────────────────

  async waitForGenerationCompletion(
    jobId: string,
    signal?: AbortSignal,
    onStatusUpdate?: (status: GenerationJobStatusResponse) => void,
  ): Promise<GenerationJobStatusResponse> {
    const deadline = Date.now() + this.maxPollDurationMs;

    while (Date.now() < deadline) {
      if (signal?.aborted) {
        throw new AIServiceError('Generation was cancelled.', 'ERR_CANCELLED', false);
      }

      const status = await this.getGenerationJobStatus(jobId, signal);

      devLog('Poll status', { jobId, status: status.status, progress: status.progress });
      onStatusUpdate?.(status);

      if (TERMINAL_STATUSES.has(status.status)) {
        if (status.status === 'failed') {
          throw new AIServiceError(
            status.error ?? 'Generation failed on the server.',
            'ERR_GENERATION_FAILED',
            false,
          );
        }
        if (status.status === 'cancelled') {
          throw new AIServiceError('Generation was cancelled.', 'ERR_CANCELLED', false);
        }
        // 'completed' or 'partial' — return with whatever results exist
        return status;
      }

      await delay(this.pollIntervalMs);
    }

    throw new AIServiceError(
      `Generation timed out after ${Math.round(this.maxPollDurationMs / 1000)}s. Please try again.`,
      'ERR_TIMEOUT',
      false,
    );
  }

  // ─── Public: Cancel Job ────────────────────────────────────────────────────

  async cancelGeneration(jobId: string): Promise<void> {
    /**
     * Sends DELETE /v1/generations/:jobId to the backend.
     * Fails gracefully if the backend has not implemented this endpoint yet.
     */
    try {
      await this.client.delete(`/v1/generations/${encodeURIComponent(jobId)}`);
      devLog('Generation cancelled', { jobId });
    } catch (err) {
      // Non-fatal — the job will eventually expire on the server
      devLog('Cancel request failed (endpoint may not be available yet)', {
        jobId,
        error: err instanceof Error ? err.message : err,
      });
    }
  }

  // ─── Private: Retry Wrapper ────────────────────────────────────────────────

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;

        if (!this.isRetryable(err)) {
          throw this.normalizeError(err);
        }

        devLog(`Retrying attempt ${attempt}/${this.maxRetries}`);

        if (attempt < this.maxRetries) {
          await delay(getBackoffDelay(attempt, this.retryDelayMs));
        }
      }
    }

    throw this.normalizeError(lastError);
  }

  // ─── Private: Error Classification ────────────────────────────────────────

  private isRetryable(error: unknown): boolean {
    if (!isAxiosError(error)) return false;

    // No response = network error = retryable
    if (!error.response) return true;

    const status = error.response.status;

    // Explicit non-retryable codes
    if (API_CONFIG.NON_RETRYABLE_STATUS_CODES.has(status)) return false;

    // Rate limit = retryable
    if (status === 429) return true;

    // Server errors = retryable
    if (status >= 500) return true;

    return false;
  }

  private normalizeError(error: unknown): AIServiceError {
    if (error instanceof AIServiceError) return error;

    if (isAxiosError(error)) {
      const status = error.response?.status;
      const serverMessage = (error.response?.data as { message?: string })?.message;
      const fallbackMessage = error.message;

      if (!error.response) {
        return new AIServiceError(
          'Network error. Please check your connection and try again.',
          'ERR_NETWORK',
          true,
        );
      }

      if (error.code === 'ECONNABORTED') {
        return new AIServiceError(
          'Request timed out. The server is taking longer than expected.',
          'ERR_TIMEOUT',
          true,
          status,
        );
      }

      if (status === 429) {
        return new AIServiceError(
          'Too many requests. Please wait a moment before trying again.',
          'ERR_RATE_LIMITED',
          true,
          status,
        );
      }

      if (status === 401 || status === 403) {
        return new AIServiceError(
          'Unauthorized. Please check your app configuration.',
          'ERR_AUTH',
          false,
          status,
        );
      }

      if (status === 400 || status === 422) {
        return new AIServiceError(
          serverMessage ?? 'Invalid request. Please check your input.',
          'ERR_INVALID_REQUEST',
          false,
          status,
        );
      }

      if (status !== undefined && status >= 500) {
        return new AIServiceError(
          'Server error. Please try again in a moment.',
          'ERR_BACKEND',
          true,
          status,
        );
      }

      return new AIServiceError(
        serverMessage ?? fallbackMessage,
        'ERR_UNKNOWN',
        false,
        status,
      );
    }

    return new AIServiceError(
      error instanceof Error ? error.message : 'An unexpected error occurred.',
      'ERR_UNKNOWN',
      false,
    );
  }

  // ─── Private: Validation ──────────────────────────────────────────────────

  private validateSingleRequest(
    imageBase64: string,
    style: ClipArtStyle,
    intensity: number,
    customPrompt?: string,
  ): void {
    if (!isValidBase64Image(imageBase64)) {
      throw new AIServiceError('Valid image data is required.', 'ERR_INVALID_IMAGE', false);
    }
    if (!isValidStyle(style)) {
      throw new AIServiceError(`Invalid style: "${style}"`, 'ERR_INVALID_STYLE', false);
    }
    if (intensity < 1 || intensity > 10) {
      throw new AIServiceError(
        'Intensity must be between 1 and 10.',
        'ERR_INVALID_INPUT',
        false,
      );
    }
    if (customPrompt !== undefined && !isValidCustomPrompt(customPrompt)) {
      throw new AIServiceError(
        'Custom prompt must be 300 characters or fewer.',
        'ERR_INVALID_INPUT',
        false,
      );
    }
  }
}

// ─── Lazy Singleton Factory ───────────────────────────────────────────────────

let _instance: AIService | null = null;

export function getAIService(): AIService {
  if (!_instance) {
    _instance = new AIService({
      apiBaseUrl: readBackendUrl(),
      timeout: readApiTimeout(),
      maxRetries: API_CONFIG.MAX_RETRIES,
      retryDelayMs: API_CONFIG.RETRY_DELAY_MS,
      pollIntervalMs: API_CONFIG.POLL_INTERVAL_MS,
      maxPollDurationMs: API_CONFIG.MAX_POLL_DURATION_MS,
    });
  }
  return _instance;
}

export const aiService = getAIService();
