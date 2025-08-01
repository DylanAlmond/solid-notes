import { Plus } from 'lucide-solid';
import { useApp } from '../context/AppContext';
import Button from './Button';
import Note from './Note';
import Tabs from './Tabs';

function Editor() {
  const [state, actions] = useApp();

  if (!state.activeNote) return null;

  return (
    <div class='w-full h-full flex flex-col gap-4 p-4'>
      <div class='shrink-0 flex flex-col justify-center sm:flex-row w-full gap-2 sm:gap-4 sm:justify-start overflow-hidden'>
        {/* <img src='logo.svg' alt='Notes Logo' class='h-13 hidden sm:inline-block' /> */}

        <Tabs />

        <div class='bg-muted sm:ml-auto text-muted-foreground inline-flex gap-2 items-center justify-center rounded-lg p-2'>
          <Button class='' onClick={() => state.activeNote && actions.saveNote(state.activeNote)}>
            Save
          </Button>
          <Button onClick={() => state.activeNote && actions.saveAllNotes}>Save All</Button>
        </div>
      </div>

      {state.activeNote && state.notes.has(state.activeNote) ? (
        <Note data={state.notes.get(state.activeNote)!} />
      ) : (
        <div class='m-auto flex flex-col gap-4 items-center'>
          <p>No notes!</p>
          <Button onClick={actions.addNote}>
            Add Note <Plus />
          </Button>
        </div>
      )}
    </div>
  );
}

export default Editor;
