// ─── Clipart Style ────────────────────────────────────────────────────────────

export type ClipArtStyle = 'cartoon' | 'flat' | 'anime' | 'pixel' | 'sketch';

export type GenerationStatus =
  | 'idle'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'cancelled';

// ─── Generation Request / Response ───────────────────────────────────────────

export interface GenerationRequest {
  imageBase64: string;
  style: ClipArtStyle;
  /** Style intensity 1–10. Default: 6 */
  intensity?: number;
  customPrompt?: string;
}

export interface GenerationResponse {
  styleType: ClipArtStyle;
  imageUrl: string;
  imageBase64?: string;
  generatedAt: string;
  promptUsed: string;
}

export interface BatchGenerationRequest {
  imageBase64: string;
  styles: ClipArtStyle[];
  intensity?: number;
  customPrompt?: string;
}

export interface BatchGenerationResponse {
  results: GenerationResponse[];
  totalGenerationTime: number;
  successCount: number;
  failureCount: number;
  failedStyles?: Array<{ style: ClipArtStyle; error: string }>;
}

// ─── Backend Job Contract ─────────────────────────────────────────────────────

export interface CreateGenerationJobRequest {
  imageBase64: string;
  styles: ClipArtStyle[];
  intensity?: number;
  customPrompt?: string;
  /** Pre-built prompts keyed by style, sent to backend for forwarding to AI */
  prompts?: Partial<Record<ClipArtStyle, string>>;
}

export interface CreateGenerationJobResponse {
  jobId: string;
  status: Exclude<GenerationStatus, 'idle'>;
  createdAt: string;
}

export interface GenerationJobStatusResponse {
  jobId: string;
  status: GenerationStatus;
  /** 0–100 */
  progress: number;
  results: GenerationResponse[];
  failedStyles?: Array<{ style: ClipArtStyle; error: string }>;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface AIServiceConfig {
  apiBaseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelayMs: number;
  pollIntervalMs: number;
  maxPollDurationMs: number;
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

export interface UploadedImage {
  uri: string;
  base64: string;
  width: number;
  height: number;
  mimeType: string;
  fileSizeBytes: number;
  fileName?: string;
}

export interface ProcessedImage {
  uri: string;
  base64: string;
  width: number;
  height: number;
  fileSizeBytes: number;
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  originalImage: UploadedImage | null;
  processedImage: ProcessedImage | null;
  generatedImages: Partial<Record<ClipArtStyle, GenerationResponse>>;
  isGenerating: boolean;
  selectedStyles: ClipArtStyle[];
  generationProgress: number;
  generationStatus: GenerationStatus;
  currentJobId: string | null;
  error: string | null;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AppError {
  code: string;
  message: string;
  retryable?: boolean;
}

export type {
  ImageDimensions,
  ImageValidationResult,
  ImageData,
  CompressionOptions,
} from '@services/imageService';
