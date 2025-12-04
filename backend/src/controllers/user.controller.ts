import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  list = async (_req: Request, res: Response) => {
    try {
      const users = await this.userRepository.find({
        relations: ['roles'],
        select: ['id', 'email', 'firstName', 'lastName', 'roles'],
      });
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
  };
}

