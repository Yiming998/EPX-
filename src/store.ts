import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Template } from './types';

const COLLECTION_NAME = 'templates';

export const getTemplates = async (): Promise<Template[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data() } as Template));
};

export const saveTemplate = async (template: Template) => {
  const templates = await getTemplates();
  const existing = templates.find(t => t.id === template.id);
  
  const templateData = {
    ...template,
    order: existing?.order ?? templates.length,
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, COLLECTION_NAME, template.id), templateData);
};

export const deleteTemplate = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const saveAllTemplates = async (templates: Template[]) => {
  const batch = writeBatch(db);
  templates.forEach((template, index) => {
    const ref = doc(db, COLLECTION_NAME, template.id);
    batch.set(ref, { ...template, order: index }, { merge: true });
  });
  await batch.commit();
};

export const getTemplateById = async (id: string): Promise<Template | undefined> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Template) : undefined;
};
