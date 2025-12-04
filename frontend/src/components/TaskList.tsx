import { Task } from '../types/task';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';

type TaskListProps = {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getAvatarColor = (id: string): string => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const hasRole = (roles: UserRole[] | undefined, role: UserRole): boolean => {
  return !!roles && roles.includes(role);
};

export const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  const { user } = useAuth();

  if (!tasks.length) {
    return <p className="empty-state">No tasks yet.</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const isAssignedToCurrentUser = task.assignees.some((assignee) => assignee.id === user?.id);
        const isOwnedByCurrentUser = task.owner.id === user?.id;

        const isAdmin = hasRole(user?.roles, 'admin');
        const isManager = hasRole(user?.roles, 'manager');

        // Frontend mirrors backend permissions:
        // - Regular users: can edit/delete only their own tasks
        // - Managers: can edit any task, delete only their own tasks
        // - Admins: can edit/delete any task
        const canEdit =
          !!user && (isAdmin || isManager || isOwnedByCurrentUser);
        const canDelete =
          !!user &&
          (isAdmin || (isOwnedByCurrentUser && (isManager || !isManager)));

        return (
          <article
            key={task.id}
            className={`task-card ${isAssignedToCurrentUser ? 'assigned-to-me' : ''} ${isOwnedByCurrentUser ? 'owned-by-me' : ''}`}
          >
            <header className="task-card__header">
              <h3>{task.title}</h3>
              <span className={`status status-${task.status}`}>{task.status.replace('_', ' ')}</span>
            </header>
            <p>{task.description}</p>
            <dl>
              <div>
                <dt>Owner</dt>
                <dd className="user-info">
                  <span
                    className="avatar"
                    style={{ backgroundColor: getAvatarColor(task.owner.id) }}
                    title={`${task.owner.firstName} ${task.owner.lastName}`}
                  >
                    {getInitials(task.owner.firstName, task.owner.lastName)}
                  </span>
                  <span>
                    {task.owner.firstName} {task.owner.lastName}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Assignees</dt>
                <dd>
                  {task.assignees.length > 0 ? (
                    <div className="assignees-list">
                      {task.assignees.map((assignee) => (
                        <span key={assignee.id} className="assignee-item">
                          <span
                            className="avatar small"
                            style={{ backgroundColor: getAvatarColor(assignee.id) }}
                            title={`${assignee.firstName} ${assignee.lastName}`}
                          >
                            {getInitials(assignee.firstName, assignee.lastName)}
                          </span>
                          <span className="assignee-name">
                            {assignee.firstName} {assignee.lastName}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>
            {(onEdit || onDelete) && (
              <footer className="task-card__actions">
                {onEdit && canEdit && (
                  <button type="button" onClick={() => onEdit(task)}>
                    Edit
                  </button>
                )}
                {onDelete && canDelete && (
                  <button type="button" onClick={() => onDelete(task)} className="danger">
                    Delete
                  </button>
                )}
              </footer>
            )}
          </article>
        );
      })}
    </div>
  );
};

