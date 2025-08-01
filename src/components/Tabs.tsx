import { createEffect, For, splitProps, type ComponentProps } from 'solid-js';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import Button from './Button';
import { Asterisk, Plus, X } from 'lucide-solid';

type TabsProps = ComponentProps<'div'>;

function Tabs(props: TabsProps) {
  const [state, actions] = useApp();
  const [classProps, _childProps, restProps] = splitProps(props, ['class'], ['children']);

  // Scroll to active tab when it changes
  createEffect(() => {
    if (state.activeNote) {
      const el = document.getElementById(`tab-btn-${state.activeNote}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  });

  return (
    <div
      class={cn(
        'bg-muted text-muted-foreground sm:w-fit w-full gap-2 inline-flex items-center justify-center rounded-lg p-2',
        classProps.class
      )}
      {...restProps}
    >
      <nav class='flex overflow-x-auto w-full sm:max-w-[50vw] gap-2 no-scrollbar rounded-sm'>
        <For each={Array.from(state.notes.values())}>
          {(note) => {
            return (
              <Button
                id={`tab-btn-${note.id}`}
                class='group gap-0'
                variant={note.id === state.activeNote ? 'outline' : 'ghost'}
                onClick={() => actions.setActiveNote(note.id)}
              >
                <span class='max-w-40 text-ellipsis overflow-hidden'>{note.title}</span>

                {!note.saved ? <Asterisk class='text-destructive ml-1' /> : null}

                <Button
                  class='w-6 h-6 hidden group-hover:flex'
                  variant={'link'}
                  aria-label={`Remove ${note.title} (${note.id})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.removeNote(note.id);
                  }}
                >
                  <X />
                </Button>
              </Button>
            );
          }}
        </For>
      </nav>

      <Button variant={'ghost'} onClick={actions.addNote} size={'icon'}>
        <Plus />
      </Button>
    </div>
  );
}

export default Tabs;
