import { splitProps, type ComponentProps } from 'solid-js';
import Input from './Input';
import type { Note as NoteType } from '../lib/types';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import Textarea from './Textarea';
type NoteProps = ComponentProps<'div'> & {
  data: NoteType;
};

function Note(props: NoteProps) {
  const [_, actions] = useApp();
  const [classProps, _childProps, restProps] = splitProps(props, ['class'], ['children']);

  return (
    <div
      class={cn('flex flex-col bg-card rounded-lg gap-2 p-4 h-full', classProps.class)}
      {...restProps}
    >
      {props.data ? (
        <>
          <span class='text-sm text-muted-foreground'>#{props.data.id}</span>
          <Input
            class='!text-4xl font-bold w-full px-0 h-12 shadow-none border-0'
            value={props.data.title}
            onChange={(e) =>
              actions.updateNote(props.data.id, {
                title: e.target.value || 'Untitled',
                saved: false
              })
            }
          />
          <hr class='my-2' />
          <Textarea
            class='flex-1 px-0 h-12 shadow-none border-0'
            value={props.data.content}
            onInput={(e) =>
              actions.updateNote(props.data.id, { content: e.target.value, saved: false })
            }
          />
        </>
      ) : null}
    </div>
  );
}

export default Note;
