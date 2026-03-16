import React, { useState, useEffect } from 'react';
import { getTemplates, deleteTemplate, saveAllTemplates, resetTemplates } from '../store';
import { Template } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, GripVertical, RotateCcw, Download } from 'lucide-react';

export const AdminMode: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadTemplates = async () => {
    setLoading(true);
    const data = await getTemplates();
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个模板吗？')) {
      await deleteTemplate(id);
      loadTemplates();
    }
  };

  const handleReset = async () => {
    if (window.confirm('确定要重置所有模板到默认配置吗？这将清除您所有的本地修改。')) {
      await resetTemplates();
      loadTemplates();
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templates, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "templates_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">模板管理</h1>
          <p className="text-slate-500 mt-2">添加、编辑或删除图片处理模板。</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
            title="导出为 JSON 配置文件"
          >
            <Download size={18} />
            导出配置
          </button>
          <button
            onClick={handleReset}
            className="bg-white border border-slate-200 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={18} />
            重置默认
          </button>
          <button
            onClick={() => navigate('/admin/template/new')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            新建模板
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-12 text-center">排序</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">模板名称</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">尺寸 (px)</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">遮罩状态</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {templates.map((template, index) => (
              <tr key={template.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-400 text-center">
                  <GripVertical size={16} className="mx-auto cursor-move" />
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{template.name}</div>
                  <div className="text-xs text-slate-400 truncate max-w-xs">{template.description || '无描述'}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                  {template.width} &times; {template.height}
                </td>
                <td className="px-6 py-4">
                  {template.maskEnabled ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      已启用 ({template.maskType === 'gradient' ? '渐变' : '纯色'})
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      未启用
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/admin/template/${template.id}`}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="编辑"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                  暂无模板，点击上方按钮创建一个吧
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-700 text-sm">
        <strong>提示：</strong> 这是一个纯前端应用。您在此处所做的更改保存在浏览器的本地存储（LocalStorage）中。
        如果您希望永久保存这些更改到代码中，请点击“导出配置”并将生成的 JSON 内容更新到 <code>src/config/templates.ts</code> 文件。
      </div>
    </div>
  );
};
