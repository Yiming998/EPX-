import React, { useState, useEffect } from 'react';
import { getTemplates, deleteTemplate, saveAllTemplates } from '../store';
import { Template } from '../types';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTemplateCardProps {
  template: Template;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableTemplateCard: React.FC<SortableTemplateCardProps> = ({ template, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col h-48 relative ${isDragging ? 'ring-2 ring-indigo-500' : ''}`}
    >
      <div className="mb-2">
        <div className="flex items-center gap-2 overflow-hidden mb-1">
          <button 
            className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing shrink-0"
            {...attributes} 
            {...listeners}
          >
            <GripVertical size={18} />
          </button>
          <h3 className="font-semibold text-slate-800 text-lg truncate" title={template.name}>{template.name}</h3>
        </div>
        <div className="pl-7">
          <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-mono">
            {template.width} &times; {template.height}
          </span>
        </div>
      </div>
      <p className="text-slate-500 text-sm mb-4 flex-1 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
        {template.description || '暂无备注信息'}
      </p>
      <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-slate-100">
        <button
          onClick={() => onEdit(template.id)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          title="编辑"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(template.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="删除"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export const AdminMode: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteTemplate(deleteId);
      setTemplates(getTemplates());
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTemplates((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newTemplates = arrayMove(items, oldIndex, newIndex) as Template[];
        saveAllTemplates(newTemplates);
        return newTemplates;
      });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">模板管理</h1>
          <p className="text-slate-500 mt-2">创建和管理您的图片模板，拖拽可调整排序。</p>
        </div>
        <button
          onClick={() => navigate('/admin/template/new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          新建模板
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">暂无模板</h3>
          <p className="text-slate-500 mb-4">开始创建您的第一个模板吧。</p>
          <button
            onClick={() => navigate('/admin/template/new')}
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            创建模板 &rarr;
          </button>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={templates.map(t => t.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <SortableTemplateCard 
                  key={template.id} 
                  template={template} 
                  onEdit={(id) => navigate(`/admin/template/${id}`)}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2">确认删除</h3>
            <p className="text-slate-600 mb-6">您确定要删除这个模板吗？此操作无法撤销。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
