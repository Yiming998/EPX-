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
  maskGradientColors: [string, string]; // For gradient
  maskGradientAngle: number; // 0-360
  maskOpacity: number; // 0-100
  maskBlendMode: string; // e.g., 'normal', 'multiply', 'screen', 'overlay'
}
