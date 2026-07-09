import type { Todo } from '@shared/types';
import { api } from '@client/lib/api';
import { queryOptions } from '@tanstack/react-query';

export const todosQueryOptions = queryOptions({
  queryKey: ['todos'],
  queryFn: async (): Promise<Todo[]> => {
    const response = await api.todo.$get();
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    return response.json();
  },
});

export async function createTodo(title: string): Promise<Todo> {
  const response = await api.todo.$post({ json: { title } });
  if (!response.ok) {
    throw new Error('Failed to create todo');
  }
  return response.json();
}

export async function toggleTodo(id: number, completed: boolean): Promise<Todo> {
  const response = await api.todo[':id'].$patch({
    param: { id: String(id) },
    json: { completed },
  });
  if (!response.ok) {
    throw new Error('Failed to update todo');
  }
  return response.json();
}

export async function deleteTodo(id: number): Promise<Todo> {
  const response = await api.todo[':id'].$delete({
    param: { id: String(id) },
  });
  if (!response.ok) {
    throw new Error('Failed to delete todo');
  }
  return response.json();
}
