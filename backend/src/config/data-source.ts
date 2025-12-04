import 'reflect-metadata';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Task } from '../entities/Task';
import { TaskAttachment } from '../entities/TaskAttachment';
import { TaskComment } from '../entities/TaskComment';
import { InitSchema1700000000000 } from '../migrations/1700000000000-InitSchema';

const entities = [User, Role, Task, TaskAttachment, TaskComment];
const migrations = [InitSchema1700000000000];

const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
const synchronize = (process.env.DB_SYNCHRONIZE || 'false').toLowerCase() === 'true';

let dataSourceOptions: DataSourceOptions;

if (dbType === 'sqlite') {
  const databasePath =
    process.env.DB_PATH || path.join(process.cwd(), 'data', 'task_app.sqlite');

  dataSourceOptions = {
    type: 'sqlite',
    database: databasePath,
    synchronize,
    logging: false,
    entities,
    migrations,
  };
} else {
  const port = Number(process.env.DB_PORT || 5432);

  dataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'task_app',
    synchronize,
    logging: false,
    entities,
    migrations,
  };
}

export const AppDataSource = new DataSource(dataSourceOptions);