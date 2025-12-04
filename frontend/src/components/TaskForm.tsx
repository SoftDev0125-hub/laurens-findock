import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TaskInput, TaskStatus } from '../types/task';
import { fetchUsers, User } from '../api/users';

type TaskFormProps = {
  initialValue?: TaskInput;
  onSubmit: (payload: TaskInput) => void;
  submitLabel?: string;
  errors?: string[];
};

const defaultTask: TaskInput = {
  title: '',
  description: '',
  status: 'todo',
  assigneeIds: [],
};

const statusOptions: TaskStatus[] = ['todo', 'in_progress', 'done'];

export const TaskForm = ({ initialValue, onSubmit, submitLabel = 'Create Task', errors = [] }: TaskFormProps) => {
  const computedInitialValue = useMemo<TaskInput>(
    () => initialValue ?? { ...defaultTask },
    [initialValue],
  );

  const [form, setForm] = useState<TaskInput>(computedInitialValue);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  useEffect(() => {
    setForm(computedInitialValue);
  }, [computedInitialValue]);

  const handleChange = (key: keyof TaskInput, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (formErrors[key as string]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key as string];
        return newErrors;
      });
    }
  };

  const handleAssigneeToggle = (userId: string) => {
    const currentIds = form.assigneeIds || [];
    const newIds = currentIds.includes(userId)
      ? currentIds.filter((id) => id !== userId)
      : [...currentIds, userId];
    handleChange('assigneeIds', newIds);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.title || form.title.trim().length === 0) {
      errors.title = 'Title is required';
    } else if (form.title.length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }

    if (form.description && form.description.length > 2000) {
      errors.description = 'Description must be less than 2000 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateForm()) {
      onSubmit(form);
      if (!initialValue) {
        setForm({ ...defaultTask });
      }
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  const selectedUsers = useMemo(() => {
    return users.filter((user) => form.assigneeIds?.includes(user.id));
  }, [users, form.assigneeIds]);

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              {error}
            </div>
          ))}
        </div>
      )}
      <div className="form-group">
        <label htmlFor="task-title">Title *</label>
        <input
          id="task-title"
          type="text"
          required
          maxLength={200}
          value={form.title}
          onChange={(event) => handleChange('title', event.target.value)}
          className={formErrors.title ? 'error' : ''}
        />
        {formErrors.title && <span className="field-error">{formErrors.title}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          maxLength={2000}
          value={form.description || ''}
          onChange={(event) => handleChange('description', event.target.value)}
          className={formErrors.description ? 'error' : ''}
        />
        {formErrors.description && <span className="field-error">{formErrors.description}</span>}
        <small>{form.description?.length || 0}/2000 characters</small>
      </div>
      <div className="form-group">
        <label htmlFor="task-status">Status</label>
        <select
          id="task-status"
          value={form.status || 'todo'}
          onChange={(event) => handleChange('status', event.target.value)}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="task-assignees">Assignees</label>
        <div className="assignee-selector">
          <div className="selected-assignees">
            {selectedUsers.map((user) => (
              <span key={user.id} className="assignee-tag">
                {user.firstName} {user.lastName}
                <button
                  type="button"
                  onClick={() => handleAssigneeToggle(user.id)}
                  className="remove-assignee"
                  aria-label={`Remove ${user.firstName} ${user.lastName}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="assignee-dropdown-container">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowAssigneeDropdown(true)}
              className="assignee-search"
            />
            {showAssigneeDropdown && (
              <>
                <div
                  className="dropdown-overlay"
                  onClick={() => setShowAssigneeDropdown(false)}
                />
                <div className="assignee-dropdown">
                  {usersLoading ? (
                    <div className="dropdown-item">Loading users...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="dropdown-item">No users found</div>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelected = form.assigneeIds?.includes(user.id);
                      return (
                        <div
                          key={user.id}
                          className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            handleAssigneeToggle(user.id);
                            setSearchTerm('');
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            readOnly
                          />
                          <span className="user-name">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="user-email">{user.email}</span>
                          <span className="user-roles">
                            {user.roles.map((role) => role.name).join(', ')}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <button type="submit">{submitLabel}</button>
    </form>
  );
};

