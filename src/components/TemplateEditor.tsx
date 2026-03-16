import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTemplateById, saveTemplate } from '../store';
import { Template } from '../types';
import { ArrowLeft, Save } from 'lucide-react';
import ColorPicker from 'react-best-gradient-color-picker';

export const TemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [template, setTemplate] = useState<Template>({
    id: isNew ? Math.random().toString(36).substr(2, 9) : '',
    name: '',
    description: '',
    width: 1080,
    height: 1080,
    backgroundColor: '#ffffff',
    imageOpacity: 100,
    maskEnabled: true,
    maskType: 'solid',
    maskColor: 'rgba(0, 0, 0, 0.5)',
    maskGradientColors: ['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0)'],
    maskGradientAngle: 180,
    maskOpacity: 50,
    maskBlendMode: 'normal',
    order: 0
  });

  const [loading, setLoading] = useState(!isNew);
  const [pickerColor, setPickerColor] = useState('');

  useEffect(() => {
    if (!isNew && id) {
      const loadTemplate = async () => {
        const t = await getTemplateById(id);
        if (t) {
          setTemplate(t);
          // Initialize picker color
          if (t.maskType === 'solid') {
            setPickerColor(t.maskColor);
          } else {
            setPickerColor(t.maskGradientCSS || `linear-gradient(${t.maskGradientAngle}deg, ${t.maskGradientColors[0]} 0%, ${t.maskGradientColors[1]} 100%)`);
          }
        } else {
          navigate('/admin');
        }
        setLoading(false);
      };
      loadTemplate();
    } else {
      // Initialize picker for new template
      setPickerColor('rgba(0, 0, 0, 0.5)');
    }
  }, [id, isNew, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveTemplate(template);
    navigate('/admin');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    
    if (type === 'number') val = parseInt(value, 10);
    if (type === 'checkbox') val = (e.target as HTMLInputElement).checked;
    
    setTemplate(prev => ({ ...prev, [name]: val }));
  };

  const parseGradient = (gradientStr: string) => {
    // Basic parser for linear-gradient(deg, color1 stop, color2 stop)
    const angleMatch = gradientStr.match(/(-?\d+)deg/);
    const colorsMatch = gradientStr.match(/(?:rgba?|hsla?)\([^)]+\)|#[a-fA-F0-9]{3,8}/gi);
    
    return {
      angle: angleMatch ? parseInt(angleMatch[1]) : 180,
      colors: colorsMatch || ['rgba(0,0,0,1)', 'rgba(0,0,0,0)']
    };
  };

  const handlePickerChange = (color: string) => {
    setPickerColor(color);
    
    if (color.includes('gradient')) {
      const parsed = parseGradient(color);
      setTemplate(prev => ({
        ...prev,
        maskType: 'gradient',
        maskGradientCSS: color,
        maskGradientAngle: parsed.angle,
        maskGradientColors: [parsed.colors[0], parsed.colors[parsed.colors.length - 1]] as [string, string]
      }));
    } else {
      setTemplate(prev => ({
        ...prev,
        maskType: 'solid',
        maskColor: color
      }));
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">
          {isNew ? '新建模板' : '编辑模板'}
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">基本信息</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">模板名称</label>
                <input
                  type="text"
                  name="name"
                  value={template.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="例如：小红书配图 (3:4)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">描述/备注</label>
                <textarea
                  name="description"
                  value={template.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="简要说明模板用途..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">宽度 (px)</label>
                <input
                  type="number"
                  name="width"
                  value={template.width}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">高度 (px)</label>
                <input
                  type="number"
                  name="height"
                  value={template.height}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">视觉配置</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">背景颜色</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="backgroundColor"
                    value={template.backgroundColor}
                    onChange={handleChange}
                    className="h-10 w-12 border border-slate-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    name="backgroundColor"
                    value={template.backgroundColor}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">图片默认不透明度 (%)</label>
                <input
                  type="number"
                  name="imageOpacity"
                  value={template.imageOpacity}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="maskEnabled"
                name="maskEnabled"
                checked={template.maskEnabled}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="maskEnabled" className="text-sm font-medium text-slate-700">启用遮罩层 (Mask Layer)</label>
            </div>

            {template.maskEnabled && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">混合模式 (Blend Mode)</label>
                    <select
                      name="maskBlendMode"
                      value={template.maskBlendMode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                    >
                      <option value="normal">Normal (正常)</option>
                      <option value="multiply">Multiply (正片叠底)</option>
                      <option value="screen">Screen (滤色)</option>
                      <option value="overlay">Overlay (叠加)</option>
                      <option value="darken">Darken (变暗)</option>
                      <option value="lighten">Lighten (变亮)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">遮罩不透明度 (%)</label>
                    <input
                      type="number"
                      name="maskOpacity"
                      value={template.maskOpacity}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-slate-700 mb-3 self-start">遮罩颜色与渐变编辑器</label>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <ColorPicker 
                      value={pickerColor} 
                      onChange={handlePickerChange}
                      hideControls={false}
                      hideInputs={false}
                      hidePresets={false}
                      hideOpacity={false}
                    />
                  </div>
                  <div className="mt-4 w-full grid grid-cols-2 gap-4 text-xs font-mono text-slate-500">
                    <div className="bg-white p-2 rounded border border-slate-200 overflow-hidden text-ellipsis">
                      类型: {template.maskType === 'gradient' ? '渐变' : '纯色'}
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200 overflow-hidden text-ellipsis">
                      {template.maskType === 'gradient' ? `角度: ${template.maskGradientAngle}°` : `颜色: ${template.maskColor}`}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            保存模板
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
};
