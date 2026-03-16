export interface Template {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  backgroundColor: string;
  imageOpacity: number; // 0-100
  maskEnabled: boolean;
  maskType: 'solid' | 'gradient';
  maskColor: string; // For solid
  maskGradientColors: [string, string]; // For gradient (legacy/fallback)
  maskGradientAngle: number; // 0-360 (legacy/fallback)
  maskGradientCSS?: string; // Exact CSS string from color picker
  maskOpacity: number; // 0-100
  maskBlendMode: string; // e.g., 'normal', 'multiply', 'screen', 'overlay'
  order?: number;
  updatedAt?: string;
}
