import { Template } from './types';

const STORAGE_KEY = 'epx_image_helper_templates';

export const getTemplates = (): Template[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTemplate = (template: Template) => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

export const deleteTemplate = (id: string) => {
  const templates = getTemplates();
  const filtered = templates.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const saveAllTemplates = (templates: Template[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

export const getTemplateById = (id: string): Template | undefined => {
  return getTemplates().find(t => t.id === id);
};
