import React, { useState, useRef, useEffect } from 'react';
import { RgbaColorPicker, RgbaColor } from 'react-colorful';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

// Helper to parse rgba string to object
const parseRgba = (colorStr: string): RgbaColor => {
  if (colorStr.startsWith('rgb')) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: match[4] ? parseFloat(match[4]) : 1,
      };
    }
  } else if (colorStr.startsWith('#')) {
    const hex = colorStr.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    let a = 1;
    if (hex.length === 8) {
      a = parseInt(hex.substring(6, 8), 16) / 255;
    }
    return { r: isNaN(r) ? 0 : r, g: isNaN(g) ? 0 : g, b: isNaN(b) ? 0 : b, a };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
};

// Helper to stringify rgba object
const stringifyRgba = (color: RgbaColor): string => {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const rgbaColor = parseRgba(color);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleChange = (newColor: RgbaColor) => {
    onChange(stringifyRgba(newColor));
  };

  return (
    <div className="relative">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded cursor-pointer border border-slate-300 shadow-sm"
          style={{ 
            backgroundColor: color,
            backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgGwEg9+J1RoIB5IGVgIGXQhOJRMCg0hpsW8A8jYwN1Q4M2mFCEAQBg0w/x/l7vTAAAAABJRU5ErkJggg==")',
            backgroundPosition: '0 0, 8px 8px',
            backgroundSize: '16px 16px',
            backgroundRepeat: 'repeat',
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-full h-full rounded" style={{ backgroundColor: color }}></div>
        </div>
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm font-mono"
        />
      </div>

      {isOpen && (
        <div 
          ref={popoverRef}
          className="absolute z-50 mt-2 p-3 bg-white rounded-xl shadow-xl border border-slate-200"
        >
          <RgbaColorPicker color={rgbaColor} onChange={handleChange} />
        </div>
      )}
    </div>
  );
};
