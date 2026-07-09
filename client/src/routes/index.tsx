import { Button } from '@client/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@client/components/ui/card';
import { Checkbox } from '@client/components/ui/checkbox';
import { Input } from '@client/components/ui/input';
import { Label } from '@client/components/ui/label';
import { createTodo, deleteTodo, todosQueryOptions, toggleTodo } from '@client/lib/todos';
import { cn } from '@client/lib/utils';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(todosQueryOptions),
  component: TodosPage,
});

function TodosPage() {
  const queryClient = useQueryClient();
  const { data: todos } = useSuspenseQuery(todosQueryOptions);
  const [title, setTitle] = useState('');

  const invalidateTodos = () => queryClient.invalidateQueries({ queryKey: ['todos'] });

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      setTitle('');
      invalidateTodos();
      toast.success('Todo created');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => toggleTodo(id, completed),
    onSuccess: () => {
      invalidateTodos();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      invalidateTodos();
      toast.success('Todo deleted');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }
    createMutation.mutate(trimmedTitle);
  }

  return (
    <main className='flex min-h-svh items-center justify-center p-6'>
      <Card className='w-full max-w-lg'>
        <CardHeader>
          <CardTitle>Todos</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <form className='flex gap-2' onSubmit={handleCreate}>
            <div className='flex flex-1 flex-col gap-2'>
              <Label htmlFor='todo-title' className='sr-only'>
                New todo
              </Label>
              <Input
                id='todo-title'
                placeholder='What needs to be done?'
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={createMutation.isPending}
              />
            </div>
            <Button type='submit' disabled={createMutation.isPending || !title.trim()}>
              Add
            </Button>
          </form>

          {todos.length === 0 ? (
            <p className='text-center text-sm text-muted-foreground'>No todos yet. Add one above.</p>
          ) : (
            <ul className='flex flex-col gap-2'>
              {todos.map((todo) => (
                <li key={todo.id} className='flex items-center gap-3 rounded-3xl bg-muted/40 px-3 py-2'>
                  <Checkbox
                    checked={todo.completed}
                    disabled={toggleMutation.isPending}
                    onCheckedChange={(checked) => {
                      toggleMutation.mutate({ id: todo.id, completed: checked === true });
                    }}
                  />
                  <span className={cn('flex-1 text-sm', todo.completed && 'text-muted-foreground line-through')}>
                    {todo.title}
                  </span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    className='text-muted-foreground hover:text-destructive'
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(todo.id)}
                  >
                    <Trash2Icon />
                    <span className='sr-only'>Delete todo</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
