import React, { useState, useEffect } from 'react';
import { getTemplates } from '../store';
import { Template } from '../types';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';

export const UserMode: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">选择模板</h1>
        <p className="text-slate-500 mt-2">选择一个模板开始编辑图片。</p>
      </div>

      {templates.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">暂无可用模板</h3>
          <p className="text-slate-500 mb-4">请联系管理员先创建模板。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div 
              key={template.id} 
              onClick={() => navigate(`/editor/${template.id}`)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col h-40"
            >
              <div className="mb-2">
                <h3 className="font-semibold text-slate-800 text-lg truncate group-hover:text-indigo-600 transition-colors mb-1" title={template.name}>{template.name}</h3>
                <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-mono">
                  {template.width} &times; {template.height}
                </span>
              </div>
              <p className="text-slate-500 text-sm flex-1 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {template.description || '暂无备注信息'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
