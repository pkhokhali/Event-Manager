import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { LocalEvent, LocalGuest, LocalExpense, LocalTask } from '@event-manager/shared';
import { getJson, setJson } from '../lib/storage';

const EVENTS_KEY = 'events';
const GUESTS_KEY = 'guests';
const EXPENSES_KEY = 'expenses';
const TASKS_KEY = 'tasks';

type EventsState = {
  events: LocalEvent[];
  guests: LocalGuest[];
  expenses: LocalExpense[];
  tasks: LocalTask[];
  hydrate: () => void;
  addEvent: (partial: Omit<LocalEvent, 'id' | 'createdAt' | 'updatedAt'>) => LocalEvent;
  updateEvent: (id: string, data: Partial<LocalEvent>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => LocalEvent | null;
  addGuest: (guest: Omit<LocalGuest, 'id'>) => void;
  updateGuest: (id: string, data: Partial<LocalGuest>) => void;
  deleteGuest: (id: string) => void;
  addExpense: (expense: Omit<LocalExpense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  addTask: (task: Omit<LocalTask, 'id'>) => void;
  toggleTask: (id: string) => void;
  getGuestsByEvent: (eventId: string) => LocalGuest[];
  getExpensesByEvent: (eventId: string) => LocalExpense[];
  getTasksByEvent: (eventId: string) => LocalTask[];
};

function persist(state: Pick<EventsState, 'events' | 'guests' | 'expenses' | 'tasks'>) {
  setJson(EVENTS_KEY, state.events);
  setJson(GUESTS_KEY, state.guests);
  setJson(EXPENSES_KEY, state.expenses);
  setJson(TASKS_KEY, state.tasks);
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  guests: [],
  expenses: [],
  tasks: [],
  hydrate: () =>
    set({
      events: getJson<LocalEvent[]>(EVENTS_KEY, []),
      guests: getJson<LocalGuest[]>(GUESTS_KEY, []),
      expenses: getJson<LocalExpense[]>(EXPENSES_KEY, []),
      tasks: getJson<LocalTask[]>(TASKS_KEY, []),
    }),
  addEvent: (partial) => {
    const now = new Date().toISOString();
    const event: LocalEvent = {
      ...partial,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    const events = [...get().events, event];
    set({ events });
    persist({ ...get(), events });
    return event;
  },
  updateEvent: (id, data) => {
    const events = get().events.map((e) =>
      e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
    );
    set({ events });
    persist({ ...get(), events });
  },
  deleteEvent: (id) => {
    const events = get().events.filter((e) => e.id !== id);
    const guests = get().guests.filter((g) => g.eventId !== id);
    const expenses = get().expenses.filter((e) => e.eventId !== id);
    const tasks = get().tasks.filter((t) => t.eventId !== id);
    set({ events, guests, expenses, tasks });
    persist({ events, guests, expenses, tasks });
  },
  duplicateEvent: (id) => {
    const src = get().events.find((e) => e.id === id);
    if (!src) return null;
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = src;
    const copy = get().addEvent({
      ...rest,
      title: `${src.title} (Copy)`,
    });
    return copy;
  },
  addGuest: (guest) => {
    const g: LocalGuest = { ...guest, id: uuid() };
    const guests = [...get().guests, g];
    set({ guests });
    persist({ ...get(), guests });
  },
  updateGuest: (id, data) => {
    const guests = get().guests.map((g) => (g.id === id ? { ...g, ...data } : g));
    set({ guests });
    persist({ ...get(), guests });
  },
  deleteGuest: (id) => {
    const guests = get().guests.filter((g) => g.id !== id);
    set({ guests });
    persist({ ...get(), guests });
  },
  addExpense: (expense) => {
    const e: LocalExpense = { ...expense, id: uuid() };
    const expenses = [...get().expenses, e];
    set({ expenses });
    persist({ ...get(), expenses });
  },
  deleteExpense: (id) => {
    const expenses = get().expenses.filter((e) => e.id !== id);
    set({ expenses });
    persist({ ...get(), expenses });
  },
  addTask: (task) => {
    const t: LocalTask = { ...task, id: uuid() };
    const tasks = [...get().tasks, t];
    set({ tasks });
    persist({ ...get(), tasks });
  },
  toggleTask: (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    set({ tasks });
    persist({ ...get(), tasks });
  },
  getGuestsByEvent: (eventId) => get().guests.filter((g) => g.eventId === eventId),
  getExpensesByEvent: (eventId) => get().expenses.filter((e) => e.eventId === eventId),
  getTasksByEvent: (eventId) =>
    get()
      .tasks.filter((t) => t.eventId === eventId)
      .sort((a, b) => a.sortOrder - b.sortOrder),
}));
