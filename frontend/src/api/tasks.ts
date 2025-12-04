import { apiClient } from './client';
import { Task, TaskInput } from '../types/task';

export type TaskFilters = {
  search?: string;
  status?: string | string[];
  assigneeId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
};

export type TasksResponse = {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const fetchTasks = async (filters?: TaskFilters): Promise<TasksResponse> => {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach((s) => params.append('status', s));
    } else {
      params.append('status', filters.status);
    }
  }
  if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const { data } = await apiClient.get<TasksResponse>(`/tasks?${params.toString()}`);
  return data;
};

export const createTask = async (payload: TaskInput): Promise<Task> => {
  const { data } = await apiClient.post<Task>('/tasks', payload);
  return data;
};

export const updateTask = async (id: string, payload: TaskInput): Promise<Task> => {
  const { data } = await apiClient.put<Task>(`/tasks/${id}`, payload);
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};

