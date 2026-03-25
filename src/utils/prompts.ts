import type { ClipArtStyle } from '@appTypes/index';

// ─── Style Metadata ───────────────────────────────────────────────────────────

export const STYLES: ClipArtStyle[] = ['cartoon', 'flat', 'anime', 'pixel', 'sketch'];

export const STYLE_LABELS: Record<ClipArtStyle, string> = {
  cartoon: 'Cartoon',
  flat: 'Flat Illustration',
  anime: 'Anime',
  pixel: 'Pixel Art',
  sketch: 'Sketch',
};

export const STYLE_DESCRIPTIONS: Record<ClipArtStyle, string> = {
  cartoon: 'Bold, playful illustrated look',
  flat: 'Clean geometric editorial style',
  anime: 'Expressive Japanese animation style',
  pixel: 'Retro game-inspired pixel rendering',
  sketch: 'Refined monochrome line-art treatment',
};

export const STYLE_EMOJIS: Record<ClipArtStyle, string> = {
  cartoon: '🎨',
  flat: '📐',
  anime: '🎌',
  pixel: '🕹️',
  sketch: '✏️',
};

// ─── Style Prompts ────────────────────────────────────────────────────────────
// These are client-visible prompt templates — not secrets.
// The backend may further enrich or override these before forwarding to AI.

export const CLIPART_PROMPTS: Record<ClipArtStyle, string> = {
  cartoon: `Transform the subject into a polished cartoon clipart portrait. Preserve facial identity, hairstyle, skin tone, and key expression. Use bold clean outlines, simplified shapes, bright controlled colors, and a professional character-illustration aesthetic. Keep the subject centered, clearly separated from a clean background, and suitable for sticker or profile-picture use. Avoid distorted hands, warped facial symmetry, background clutter, embedded text, watermarks, and extra people in the frame.`,

  flat: `Convert the subject into a modern flat illustration clipart. Preserve recognizability while simplifying forms into clean geometric shapes and a limited color palette of no more than 5 to 6 colors. Use crisp edges, zero gradients, no drop shadows, no textures, and a premium editorial illustration feel. Keep the composition centered and uncluttered. Avoid photorealistic detail, noisy surfaces, embedded text, watermarks, and unnecessary background elements.`,

  anime: `Create an anime-inspired clipart portrait of the subject while preserving recognizable identity. Use expressive yet balanced anime features, clean line art, vibrant but controlled colors, and polished cel-shading. Maintain the subject's hairstyle, face shape, and overall likeness as faithfully as possible. Style reference: high-quality modern anime key visual. Avoid excessive exaggeration, random accessories not present in the original, embedded text, watermarks, and distracting backgrounds.`,

  pixel: `Transform the subject into high-quality retro pixel art clipart. Preserve silhouette, hairstyle, and defining facial cues using a limited palette of 8 to 16 colors and a clean sprite-like structure. Use crisp visible square pixels, strong shape readability, and a premium handheld-game aesthetic. Avoid blurry upscaling artifacts, cluttered or noisy backgrounds, embedded text, watermarks, and loss of subject identity.`,

  sketch: `Convert the subject into a refined sketch-style clipart portrait. Preserve proportions and likeness using confident line work and contour emphasis on key facial features. Add tasteful hatching or tonal shading in grayscale. Keep the output clean, centered, and suitable as a professional monochrome clipart asset. Avoid messy scribbles, broken anatomy, extraneous marks, embedded text, watermarks, and distracting background elements.`,
};

// ─── Intensity Modifiers ──────────────────────────────────────────────────────

const INTENSITY_MODIFIER_LOW =
  'Apply a subtle stylization. Retain most original details, textures, and proportions. The transformation should feel light and tasteful.';

const INTENSITY_MODIFIER_MEDIUM =
  'Apply a balanced stylization. Transform the subject meaningfully while keeping core identity and recognizable features intact.';

const INTENSITY_MODIFIER_HIGH =
  'Apply a strong, committed stylization. Fully lean into the chosen art style while preserving subject silhouette and key identifying features.';

export function getIntensityModifier(intensity: number): string {
  const clamped = Math.min(Math.max(intensity, 1), 10);
  if (clamped <= 3) return INTENSITY_MODIFIER_LOW;
  if (clamped <= 7) return INTENSITY_MODIFIER_MEDIUM;
  return INTENSITY_MODIFIER_HIGH;
}

/**
 * Builds the final prompt to send to the backend.
 * If the user provided a custom prompt, that takes full precedence.
 */
export function buildFinalPrompt(
  style: ClipArtStyle,
  intensity: number,
  customPrompt?: string,
): string {
  if (customPrompt && customPrompt.trim().length > 0) {
    return customPrompt.trim();
  }
  const base = CLIPART_PROMPTS[style];
  const modifier = getIntensityModifier(intensity);
  return `${base}\n\nIntensity guidance: ${modifier}`;
}
