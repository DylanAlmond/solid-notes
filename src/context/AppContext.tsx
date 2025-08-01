import {
  createContext,
  createEffect,
  onCleanup,
  onMount,
  useContext,
  type ParentComponent
} from 'solid-js';
import { createStore } from 'solid-js/store';
import type { Note } from '../lib/types';
import { nanoid } from 'nanoid';

export type AppContextProps = {
  activeNote: string | undefined;
  notes: Map<string, Note>;
};

export type AppProviderProps = [
  state: AppContextProps,
  actions: {
    addNote: () => void;
    updateNote: (id: string, data: Partial<Omit<Note, 'id'>>) => void;
    removeNote: (id: string) => void;
    setActiveNote: (id: string) => void;
    saveNote: (id: string) => void;
    saveAllNotes: () => void;
  }
];

const defaultState = (): AppContextProps => {
  const id = nanoid();
  const notes = new Map<string, Note>();
  notes.set(id, { id: id, title: 'New Note', content: '', saved: false });
  return {
    activeNote: id,
    notes
  };
};

const AppContext = createContext<AppProviderProps>([
  defaultState(),
  {
    addNote: () => undefined,
    updateNote: () => undefined,
    removeNote: () => undefined,
    setActiveNote: () => undefined,
    saveAllNotes: () => undefined,
    saveNote: () => undefined
  }
]);

const LOCAL_STORAGE_KEY = 'solid-notes-app';

function serializeState(state: AppContextProps) {
  return JSON.stringify({
    ...state,
    notes: Array.from(state.notes.entries())
  });
}

function deserializeState(raw: string): AppContextProps {
  const parsed = JSON.parse(raw);
  return {
    activeNote: parsed.activeNote,
    notes: new Map<string, Note>(parsed.notes)
  };
}

function loadState(): AppContextProps {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = deserializeState(raw);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        typeof parsed.activeNote === 'string' &&
        parsed.notes instanceof Map
      ) {
        return parsed;
      }
    } catch {
      // ignore parse errors, fallback to default
    }
  }
  return defaultState();
}

export const AppProvider: ParentComponent = (props) => {
  const [state, setState] = createStore<AppContextProps>(loadState());

  const addNote = () => {
    const newId = nanoid();
    setState('notes', (notes) => {
      const newNotes = new Map(notes);
      newNotes.set(newId, { id: newId, title: 'New Note', content: '', saved: false });
      return newNotes;
    });
    setState('activeNote', newId);
  };

  const updateNote = (id: string, data: Partial<Omit<Note, 'id'>>) =>
    setState('notes', (notes) => {
      const newNotes = new Map(notes);
      const note = newNotes.get(id);
      if (note) newNotes.set(id, { ...note, ...data });
      return newNotes;
    });

  const removeNote = (id: string) => {
    setState('notes', (notes) => {
      const newNotes = new Map(notes);
      newNotes.delete(id);
      return newNotes;
    });

    if (state.activeNote === id) {
      const remainingNoteIds = Array.from(state.notes.keys()).filter((noteId) => noteId !== id);
      if (remainingNoteIds.length > 0) {
        setState('activeNote', remainingNoteIds[0]);
      } else {
        setState('activeNote', undefined);
      }
    }
  };

  const setActiveNote = (id: string) => state.notes.has(id) && setState('activeNote', id);

  const saveAllNotes = () => {
    setState('notes', (notes) => {
      const newNotes = new Map(notes);
      newNotes.forEach((note, id) => {
        newNotes.set(id, { ...note, saved: true });
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, serializeState({ ...state, notes: newNotes }));
      return newNotes;
    });
  };

  const saveNote = (id: string) => {
    setState('notes', (notes) => {
      const newNotes = new Map(notes);
      const note = newNotes.get(id);
      if (note) newNotes.set(id, { ...note, saved: true });
      localStorage.setItem(LOCAL_STORAGE_KEY, serializeState({ ...state, notes: newNotes }));
      return newNotes;
    });
  };

  // Keyboard shortcuts for saving notes
  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !e.shiftKey) {
        e.preventDefault();
        if (state.activeNote) saveNote(state.activeNote);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveAllNotes();
      }
    };
    window.addEventListener('keydown', handler);
    onCleanup(() => window.removeEventListener('keydown', handler));
  });

  // Warn if not all notes are saved when closing the tab/window
  createEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const hasUnsaved = Array.from(state.notes.values()).some((note) => !note.saved);
      if (hasUnsaved) {
        e.preventDefault();
        return '';
      }
    };
    window.addEventListener('beforeunload', handler);
    onCleanup(() => window.removeEventListener('beforeunload', handler));
  });

  return (
    <AppContext.Provider
      value={[state, { addNote, updateNote, removeNote, setActiveNote, saveAllNotes, saveNote }]}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within a AppProvider');
  return context;
};

export default AppContext;
