import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './Role';
import { Task } from './Task';
import { TaskComment } from './TaskComment';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable()
  roles!: Role[];

  @OneToMany(() => Task, (task) => task.owner)
  ownedTasks!: Task[];

  @ManyToMany(() => Task, (task) => task.assignees)
  assignedTasks!: Task[];

  @OneToMany(() => TaskComment, (comment) => comment.author)
  comments!: TaskComment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

