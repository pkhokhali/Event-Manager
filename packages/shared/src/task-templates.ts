export type TaskTemplate = { title: string; titleNe: string; sortOrder: number };

export const TASK_TEMPLATES_BY_SUBCATEGORY: Record<string, TaskTemplate[]> = {
  wedding: [
    { title: 'Book venue', titleNe: 'स्थान बुक गर्नुहोस्', sortOrder: 1 },
    { title: 'Hire photographer', titleNe: 'फोटोग्राफर', sortOrder: 2 },
    { title: 'Send invitations', titleNe: 'निमन्त्रणा पठाउनुहोस्', sortOrder: 3 },
    { title: 'Finalize menu', titleNe: 'मेनु तयार', sortOrder: 4 },
    { title: 'Wedding rehearsal', titleNe: 'रिहर्सल', sortOrder: 5 },
  ],
  dashain: [
    { title: 'Buy tika materials', titleNe: 'टीका सामग्री', sortOrder: 1 },
    { title: 'Prepare jamara', titleNe: 'जमरा', sortOrder: 2 },
    { title: 'Family gathering plan', titleNe: 'पारिवारिक योजना', sortOrder: 3 },
  ],
  tihar: [
    { title: 'Buy diyos and lights', titleNe: 'दियो र बत्ती', sortOrder: 1 },
    { title: 'Rangoli materials', titleNe: 'रंगोली', sortOrder: 2 },
    { title: 'Bhai tika preparation', titleNe: 'भाई टीका', sortOrder: 3 },
  ],
};

export function getTaskTemplatesForSubcategory(slug: string): TaskTemplate[] {
  return TASK_TEMPLATES_BY_SUBCATEGORY[slug] ?? [
    { title: 'Create guest list', titleNe: 'अतिथि सूची', sortOrder: 1 },
    { title: 'Set budget', titleNe: 'बजेट', sortOrder: 2 },
    { title: 'Book vendors', titleNe: 'विक्रेता', sortOrder: 3 },
  ];
}
