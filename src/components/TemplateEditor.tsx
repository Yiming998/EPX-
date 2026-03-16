import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Template } from '../types';
import { getTemplateById, saveTemplate } from '../store';
import { ArrowLeft, Save, Settings, Layers, Image as ImageIcon } from 'lucide-react';
import { ColorPicker } from './ColorPicker';

const DEFAULT_TEMPLATE: Template = {
  id: '',
  name: '新模板',
  description: '',
  width: 1920,
  height: 1080,
  backgroundColor: '#ffffff',
  imageOpacity: 100,
  maskEnabled: false,
  maskType: 'solid',
  maskColor: 'rgba(0, 0, 0, 1)',
  maskGradientColors: ['rgba(0, 0, 0, 1)', 'rgba(255, 255, 255, 1)'],
  maskGradientAngle: 90,
  maskOpacity: 50,
  maskBlendMode: 'normal',
};

export const TemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template>(DEFAULT_TEMPLATE);

  useEffect(() => {
    if (id && id !== 'new') {
      const existing = getTemplateById(id);
      if (existing) {
        setTemplate(existing);
      }
    } else {
      setTemplate({ ...DEFAULT_TEMPLATE, id: uuidv4() });
    }
  }, [id]);

  const handleChange = (field: keyof Template, value: any) => {
    setTemplate((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveTemplate(template);
    navigate('/admin');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800">
            {id === 'new' ? '创建模板' : '编辑模板'}
          </h1>
        </div>
        <button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Save size={18} />
          保存模板
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto shrink-0 flex flex-col">
          <div className="p-6 space-y-8">
            {/* Basic Settings */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-medium">
                <Settings size={18} />
                <h2>基础设置</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">模板名称</label>
                  <input
                    type="text"
                    value={template.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">备注信息</label>
                  <textarea
                    value={template.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={2}
                    placeholder="请输入模板用途或备注..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">宽度 (px)</label>
                    <input
                      type="number"
                      value={template.width}
                      onChange={(e) => handleChange('width', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">高度 (px)</label>
                    <input
                      type="number"
                      value={template.height}
                      onChange={(e) => handleChange('height', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <ColorPicker
                    label="背景颜色"
                    color={template.backgroundColor}
                    onChange={(val) => handleChange('backgroundColor', val)}
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Image Layer Settings */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-medium">
                <ImageIcon size={18} />
                <h2>用户图片层</h2>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">不透明度</label>
                  <span className="text-sm text-slate-500">{template.imageOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={template.imageOpacity}
                  onChange={(e) => handleChange('imageOpacity', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Mask Layer Settings */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Layers size={18} />
                  <h2>遮罩层</h2>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={template.maskEnabled}
                    onChange={(e) => handleChange('maskEnabled', e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {template.maskEnabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">遮罩类型</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${template.maskType === 'solid' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => handleChange('maskType', 'solid')}
                      >
                        纯色
                      </button>
                      <button
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${template.maskType === 'gradient' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => handleChange('maskType', 'gradient')}
                      >
                        渐变
                      </button>
                    </div>
                  </div>

                  {template.maskType === 'solid' ? (
                    <ColorPicker
                      label="颜色"
                      color={template.maskColor}
                      onChange={(val) => handleChange('maskColor', val)}
                    />
                  ) : (
                    <div className="space-y-3">
                      <ColorPicker
                        label="颜色 1"
                        color={template.maskGradientColors[0]}
                        onChange={(val) => handleChange('maskGradientColors', [val, template.maskGradientColors[1]])}
                      />
                      <ColorPicker
                        label="颜色 2"
                        color={template.maskGradientColors[1]}
                        onChange={(val) => handleChange('maskGradientColors', [template.maskGradientColors[0], val])}
                      />
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="block text-sm font-medium text-slate-700">角度</label>
                          <span className="text-sm text-slate-500">{template.maskGradientAngle}&deg;</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={template.maskGradientAngle}
                          onChange={(e) => handleChange('maskGradientAngle', Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-slate-700">不透明度</label>
                      <span className="text-sm text-slate-500">{template.maskOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={template.maskOpacity}
                      onChange={(e) => handleChange('maskOpacity', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">混合模式</label>
                    <select
                      value={template.maskBlendMode}
                      onChange={(e) => handleChange('maskBlendMode', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="normal">正常 (Normal)</option>
                      <option value="multiply">正片叠底 (Multiply)</option>
                      <option value="screen">滤色 (Screen)</option>
                      <option value="overlay">叠加 (Overlay)</option>
                      <option value="darken">变暗 (Darken)</option>
                      <option value="lighten">变亮 (Lighten)</option>
                      <option value="color-dodge">颜色减淡 (Color Dodge)</option>
                      <option value="color-burn">颜色加深 (Color Burn)</option>
                    </select>
                  </div>
                </div>
              )}
            </section>
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 bg-slate-200 p-8 overflow-auto flex items-center justify-center relative">
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            opacity: 0.2
          }}></div>
          
          <div className="relative shadow-2xl bg-white transition-all duration-300 ease-in-out" style={{
            width: '100%',
            maxWidth: '800px',
            aspectRatio: `${template.width} / ${template.height}`,
            backgroundColor: template.backgroundColor
          }}>
            {/* Mock Image Layer */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ opacity: template.imageOpacity / 100 }}>
              <img 
                src="https://images.unsplash.com/photo-1506744626753-eba7bc3613ee?q=80&w=2000&auto=format&fit=crop" 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Mask Layer */}
            {template.maskEnabled && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: template.maskOpacity / 100,
                  mixBlendMode: template.maskBlendMode as any,
                  background: template.maskType === 'solid' 
                    ? template.maskColor 
                    : `linear-gradient(${template.maskGradientAngle}deg, ${template.maskGradientColors[0]}, ${template.maskGradientColors[1]})`
                }}
              />
            )}
            
            {/* Dimensions Badge */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-mono shadow-md">
              {template.width} &times; {template.height} px
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
