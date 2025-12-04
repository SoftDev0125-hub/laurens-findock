import 'reflect-metadata';
import dotenv from 'dotenv';

// Load environment variables BEFORE importing modules that depend on them
dotenv.config();

import { AppDataSource } from './config/data-source';

const run = async () => {
  try {
    const dataSource = await AppDataSource.initialize();
    await dataSource.runMigrations();
    await dataSource.destroy();
    // eslint-disable-next-line no-console
    console.log('Migrations ran successfully');
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Migration failed', error);
    process.exit(1);
  }
};

run();

