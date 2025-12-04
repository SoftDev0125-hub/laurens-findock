import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, deleteTask, fetchTasks, updateTask, TaskFilters } from '../api/tasks';
import { Task, TaskInput } from '../types/task';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { useAuth } from '../hooks/useAuth';
import { fetchUsers } from '../api/users';

export const TasksPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Get filters from URL
  const filters: TaskFilters = useMemo(() => {
    const search = searchParams.get('search') || '';
    const status = searchParams.getAll('status');
    const assigneeId = searchParams.get('assigneeId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'title' | 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'DESC') as 'ASC' | 'DESC';

    return {
      search: search || undefined,
      status: status.length > 0 ? status : undefined,
      assigneeId,
      page,
      limit,
      sortBy,
      sortOrder,
    };
  }, [searchParams]);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const tasks = tasksData?.tasks || [];
  const pagination = tasksData?.pagination;

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<TaskFilters>) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.status) {
      params.delete('status');
      const statusArray = Array.isArray(newFilters.status) ? newFilters.status : [newFilters.status];
      statusArray.forEach((s) => params.append('status', s));
    }
    if (newFilters.assigneeId) params.set('assigneeId', newFilters.assigneeId);
    if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page.toString());
    if (newFilters.limit && newFilters.limit !== 10) params.set('limit', newFilters.limit.toString());
    if (newFilters.sortBy && newFilters.sortBy !== 'createdAt') params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder && newFilters.sortOrder !== 'DESC') params.set('sortOrder', newFilters.sortOrder);

    setSearchParams(params, { replace: true });
  };

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskInput }) => updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const getErrorMessage = (error: any): string => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
  };

  const handleCreate = (payload: TaskInput) => {
    setFormErrors([]);
    createMutation.mutate(payload, {
      onError: (error: any) => {
        if (error.response?.data?.errors) {
          setFormErrors(error.response.data.errors);
        } else {
          setFormErrors([getErrorMessage(error) || 'Failed to create task']);
        }
      },
      onSuccess: () => {
        setFormErrors([]);
      },
    });
  };

  const handleUpdate = (payload: TaskInput) => {
    if (!editingTask) return;
    setFormErrors([]);
    updateMutation.mutate(
      { id: editingTask.id, payload },
      {
        onError: (error: any) => {
          if (error.response?.data?.errors) {
            setFormErrors(error.response.data.errors);
          } else {
            setFormErrors([getErrorMessage(error) || 'Failed to update task']);
          }
        },
        onSuccess: () => {
          setFormErrors([]);
        },
      },
    );
  };

  const canManage = user?.roles.some((role) => role === 'admin' || role === 'manager');

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(filters.status || []);
  const [selectedAssignee, setSelectedAssignee] = useState<string>(filters.assigneeId || '');

  // Sync local state with URL params
  useEffect(() => {
    setSearchInput(filters.search || '');
    setSelectedStatuses(filters.status || []);
    setSelectedAssignee(filters.assigneeId || '');
  }, [filters.search, filters.status, filters.assigneeId]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        updateFilters({ ...filters, search: searchInput || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update status filter
  const handleStatusToggle = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
    updateFilters({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined, page: 1 });
  };

  // Update assignee filter
  const handleAssigneeChange = (assigneeId: string) => {
    setSelectedAssignee(assigneeId);
    updateFilters({ ...filters, assigneeId: assigneeId || undefined, page: 1 });
  };

  return (
    <div className="tasks-page">
      <section className="tasks-section">
        <h2>Tasks</h2>
        
        {/* Search and Filters */}
        <div className="tasks-filters">
          <div className="filter-group">
            <label htmlFor="task-search">Search</label>
            <input
              id="task-search"
              type="text"
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <div className="status-filters">
              {['todo', 'in_progress', 'done'].map((status) => (
                <label key={status} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                  />
                  <span>{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="assignee-filter">Assignee</label>
            <select
              id="assignee-filter"
              value={selectedAssignee}
              onChange={(e) => handleAssigneeChange(e.target.value)}
            >
              <option value="">All assignees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Sort by</label>
            <select
              id="sort-by"
              value={filters.sortBy}
              onChange={(e) => updateFilters({ ...filters, sortBy: e.target.value as 'title' | 'createdAt', page: 1 })}
            >
              <option value="createdAt">Date Created</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-order">Order</label>
            <select
              id="sort-order"
              value={filters.sortOrder}
              onChange={(e) => updateFilters({ ...filters, sortOrder: e.target.value as 'ASC' | 'DESC', page: 1 })}
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </select>
          </div>
        </div>

        {/* Pagination Info */}
        {pagination && (
          <div className="pagination-info">
            Showing {tasks.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tasks
          </div>
        )}

        {isLoading ? (
          <p>Loading tasks…</p>
        ) : (
          <>
            <TaskList
              tasks={tasks}
              onEdit={user ? (task) => setEditingTask(task) : undefined}
              onDelete={
                user
                  ? (task) =>
                      deleteMutation.mutate(task.id, {
                        onError: (error: any) => {
                          // Show a clear, user-friendly error for permission issues
                          const message = getErrorMessage(error);
                          // Simple UX: alert – could be replaced with a toast system
                          // eslint-disable-next-line no-alert
                          window.alert(message);
                        },
                      })
                  : undefined
              }
            />
            
            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  type="button"
                  onClick={() => updateFilters({ ...filters, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => updateFilters({ ...filters, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
      {canManage && (
        <section className="tasks-section">
          <h2>{editingTask ? 'Edit Task' : 'Create Task'}</h2>
          <TaskForm
            initialValue={
              editingTask
                ? {
                    title: editingTask.title,
                    description: editingTask.description,
                    status: editingTask.status,
                    assigneeIds: editingTask.assignees.map((assignee) => assignee.id),
                  }
                : undefined
            }
            onSubmit={editingTask ? handleUpdate : handleCreate}
            submitLabel={editingTask ? 'Update Task' : 'Create Task'}
            errors={formErrors}
          />
        </section>
      )}
    </div>
  );
};

