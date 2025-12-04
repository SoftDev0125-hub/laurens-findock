import { IsString, IsOptional, IsEnum, IsArray, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(200, { message: 'Title must be less than 200 characters' })
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must be less than 2000 characters' })
  description?: string;

  @IsOptional()
  @IsEnum(['todo', 'in_progress', 'done'], { message: 'Status must be one of: todo, in_progress, done' })
  status?: 'todo' | 'in_progress' | 'done';

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each assignee ID must be a valid UUID' })
  assigneeIds?: string[];
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(200, { message: 'Title must be less than 200 characters' })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must be less than 2000 characters' })
  description?: string;

  @IsOptional()
  @IsEnum(['todo', 'in_progress', 'done'], { message: 'Status must be one of: todo, in_progress, done' })
  status?: 'todo' | 'in_progress' | 'done';

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each assignee ID must be a valid UUID' })
  assigneeIds?: string[];
}

