import { Template } from './types';
import { TEMPLATES_CONFIG } from './config/templates';

const STORAGE_KEY = 'epx_templates_v1';

const getStoredTemplates = (): Template[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored templates', e);
    }
  }
  return TEMPLATES_CONFIG;
};

const saveStoredTemplates = (templates: Template[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

export const getTemplates = async (): Promise<Template[]> => {
  return getStoredTemplates().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const getTemplateById = async (id: string): Promise<Template | undefined> => {
  return getStoredTemplates().find(t => t.id === id);
};

export const saveTemplate = async (template: Template) => {
  const templates = getStoredTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  
  const templateData = {
    ...template,
    updatedAt: new Date().toISOString()
  };

  if (index >= 0) {
    templates[index] = templateData;
  } else {
    templates.push({
      ...templateData,
      order: templates.length
    });
  }
  
  saveStoredTemplates(templates);
};

export const deleteTemplate = async (id: string) => {
  const templates = getStoredTemplates().filter(t => t.id !== id);
  saveStoredTemplates(templates);
};

export const saveAllTemplates = async (templates: Template[]) => {
  saveStoredTemplates(templates.map((t, i) => ({ ...t, order: i })));
};

export const resetTemplates = async () => {
  localStorage.removeItem(STORAGE_KEY);
  return TEMPLATES_CONFIG;
};
