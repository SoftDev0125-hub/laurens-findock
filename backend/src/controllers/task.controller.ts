import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { In, FindOptionsWhere } from 'typeorm';
import { AuthTokenPayload } from '../utils/auth';

export class TaskController {
  private taskRepository = AppDataSource.getRepository(Task);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Permission helpers
   * - Regular users: can edit/delete only tasks they own
   * - Managers: can edit any task, delete only tasks they own
   * - Admins: can edit/delete any task
   */
  private hasRole(user: AuthTokenPayload, role: string): boolean {
    return user.roles.includes(role);
  }

  private isOwner(user: AuthTokenPayload, task: Task): boolean {
    return task.owner.id === user.userId;
  }

  private canEditTask(user: AuthTokenPayload, task: Task): boolean {
    if (this.hasRole(user, 'admin') || this.hasRole(user, 'manager')) {
      return true;
    }

    return this.isOwner(user, task);
  }

  private canDeleteTask(user: AuthTokenPayload, task: Task): boolean {
    if (this.hasRole(user, 'admin')) {
      return true;
    }

    // Managers and regular users can delete only their own tasks
    if (this.hasRole(user, 'manager') || this.hasRole(user, 'user')) {
      return this.isOwner(user, task);
    }

    return false;
  }

  list = async (req: Request, res: Response) => {
    try {
      const {
        search = '',
        status,
        assigneeId,
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions
      const where: FindOptionsWhere<Task> = {};

      // Search filter (title and description)
      if (search) {
        const searchTerm = `%${search}%`;
        const queryBuilder = this.taskRepository
          .createQueryBuilder('task')
          .leftJoinAndSelect('task.owner', 'owner')
          .leftJoinAndSelect('task.assignees', 'assignees')
          .leftJoinAndSelect('task.attachments', 'attachments')
          .where('task.title LIKE :search OR task.description LIKE :search', {
            search: searchTerm,
          });

        // Status filter
        if (status) {
          const statusArray = Array.isArray(status) ? status : [status];
          queryBuilder.andWhere('task.status IN (:...statuses)', {
            statuses: statusArray,
          });
        }

        // Assignee filter
        if (assigneeId) {
          queryBuilder.andWhere('assignees.id = :assigneeId', {
            assigneeId: assigneeId as string,
          });
        }

        // Sorting
        const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
        const sortField = sortBy === 'title' ? 'task.title' : 'task.createdAt';
        queryBuilder.orderBy(sortField, order);

        // Pagination
        queryBuilder.skip(offset).take(limitNum);

        const [tasks, total] = await queryBuilder.getManyAndCount();

        return res.json({
          tasks,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        });
      } else {
        // No search, use simpler query
        if (status) {
          const statusArray = Array.isArray(status) ? status : [status];
          where.status = In(statusArray as string[]);
        }

        const queryBuilder = this.taskRepository
          .createQueryBuilder('task')
          .leftJoinAndSelect('task.owner', 'owner')
          .leftJoinAndSelect('task.assignees', 'assignees')
          .leftJoinAndSelect('task.attachments', 'attachments');

        if (Object.keys(where).length > 0) {
          queryBuilder.where(where);
        }

        // Assignee filter
        if (assigneeId) {
          queryBuilder.andWhere('assignees.id = :assigneeId', {
            assigneeId: assigneeId as string,
          });
        }

        // Sorting
        const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
        const sortField = sortBy === 'title' ? 'task.title' : 'task.createdAt';
        queryBuilder.orderBy(sortField, order);

        // Pagination
        queryBuilder.skip(offset).take(limitNum);

        const [tasks, total] = await queryBuilder.getManyAndCount();

        return res.json({
          tasks,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  };

  create = async (req: Request, res: Response) => {
    const { title, description, status = 'todo', assigneeIds = [] } = req.body;
    const ownerId = req.user?.userId;

    try {
      if (!ownerId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const owner = await this.userRepository.findOne({ where: { id: ownerId } });
      if (!owner) {
        return res.status(404).json({ message: 'Owner not found' });
      }

      const assignees = assigneeIds.length
        ? await this.userRepository.findBy({ id: In(assigneeIds) })
        : [];

      const task = this.taskRepository.create({
        title,
        description,
        status,
        owner,
        assignees,
      });

      const saved = await this.taskRepository.save(task);
      return res.status(201).json(saved);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create task' });
    }
  };

  update = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const { title, description, status, assigneeIds = [] } = req.body;

    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!taskId) {
        return res.status(400).json({ message: 'Task id is required' });
      }

      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      if (!this.canEditTask(req.user as AuthTokenPayload, task)) {
        return res
          .status(403)
          .json({ message: 'You do not have permission to edit this task' });
      }

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (assigneeIds) {
        task.assignees =
          assigneeIds && assigneeIds.length
            ? await this.userRepository.findBy({ id: In(assigneeIds) })
            : [];
      }

      const updated = await this.taskRepository.save(task);
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update task' });
    }
  };

  remove = async (req: Request, res: Response) => {
    const taskId = req.params.id;

    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!taskId) {
        return res.status(400).json({ message: 'Task id is required' });
      }

      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      if (!this.canDeleteTask(req.user as AuthTokenPayload, task)) {
        return res
          .status(403)
          .json({ message: 'You do not have permission to delete this task' });
      }

      await this.taskRepository.remove(task);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete task' });
    }
  };
}

