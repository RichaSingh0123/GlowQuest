import type { VisualStyle } from '@/data/profile';

/**
 * Reusable style tokens for GlowQuest's two visual experiences.
 *
 * These tokens let any future screen (world maps, quest sessions,
 * celebrations, analytics) render with the player's chosen aesthetic
 * without hardcoding colors per screen.
 *
 * FAIRYTALE — feminine, whimsical fantasy: soft magical colors.
 * ADVENTURE — bright, magical questing: brave but warm and fun
 * (intentionally NOT dark or aggressive).
 */

export type VisualStyleColors = {
  /** Screen background. */
  background: string;
  /** Alternate background for wells/sections. */
  backgroundAlt: string;
  /** Card surface. */
  card: string;
  /** Card border. */
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  /** Primary action / selection color. */
  accent: string;
  /** Soft tint of the accent (chips, bubbles, selected rings). */
  accentSoft: string;
  /** Text/icons placed on top of `accent`. */
  onAccent: string;
  /** Golden highlight (XP, rewards, sparkles). */
  highlight: string;
  highlightSoft: string;
  /** Large hero/panel surface. */
  heroPanel: string;
  heroPanelText: string;
  heroPanelSubtext: string;
  shadow: string;
};

export type VisualStyleTokens = {
  key: VisualStyle;
  label: string;
  emoji: string;
  tagline: string;
  colors: VisualStyleColors;
};

export const VISUAL_STYLE_REGISTRY: Record<VisualStyle, VisualStyleTokens> = {
  fairytale: {
    key: 'fairytale',
    label: 'Fairytale',
    emoji: '✨',
    tagline: 'Soft, dreamy & magical',
    colors: {
      background: '#FFF7F2',
      backgroundAlt: '#FFE9F3',
      card: '#FFFDFC',
      cardBorder: '#F1DDE9',
      textPrimary: '#3D2A51',
      textSecondary: '#776B80',
      accent: '#E9748D',
      accentSoft: '#FFE0ED',
      onAccent: '#FFFFFF',
      highlight: '#FFD889',
      highlightSoft: '#FFF4C9',
      heroPanel: '#7861C9',
      heroPanelText: '#FFFDFC',
      heroPanelSubtext: '#F2E9FF',
      shadow: '#6B4AA0',
    },
  },
  adventure: {
    key: 'adventure',
    label: 'Adventure',
    emoji: '🧭',
    tagline: 'Brave, bright & legendary',
    colors: {
      background: '#F4F1E6',
      backgroundAlt: '#E7F2EC',
      card: '#FFFDF6',
      cardBorder: '#E3DCC6',
      textPrimary: '#2E4038',
      textSecondary: '#66786E',
      accent: '#2F8F7B',
      accentSoft: '#D9F0E8',
      onAccent: '#FFFFFF',
      highlight: '#F0A93C',
      highlightSoft: '#FCEFD4',
      heroPanel: '#1F6E5E',
      heroPanelText: '#F2FBF7',
      heroPanelSubtext: '#CFEBE0',
      shadow: '#1F5A4C',
    },
  },
};

export function getVisualStyleTokens(style: VisualStyle): VisualStyleTokens {
  return VISUAL_STYLE_REGISTRY[style];
}