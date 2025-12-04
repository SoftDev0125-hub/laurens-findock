import { apiClient } from './client';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<{ id: string; name: string }>;
};

export const fetchUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get<User[]>('/users');
  return data;
};

