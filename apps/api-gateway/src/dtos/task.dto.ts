import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  MinLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '@repo/types';
import { IsValidDateFormat } from '../validators/date.validator';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Implement user authentication',
    description: 'Task title',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @ApiPropertyOptional({
    example: 'Implement JWT authentication with refresh tokens',
    description: 'Detailed task description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Task due date (YYYY-MM-DD or ISO 8601 format)',
  })
  @IsValidDateFormat({ message: 'Date must be in format YYYY-MM-DD or ISO 8601' })
  @IsOptional()
  dueDate?: Date | string;

  @ApiProperty({
    example: 'HIGH',
    enum: TaskPriority,
    description: 'Task priority level',
  })
  @IsEnum(TaskPriority, { message: 'Invalid priority value' })
  @IsNotEmpty({ message: 'Priority is required' })
  priority: TaskPriority;

  @ApiProperty({
    example: 'TODO',
    enum: TaskStatus,
    description: 'Task status',
  })
  @IsEnum(TaskStatus, { message: 'Invalid status value' })
  @IsNotEmpty({ message: 'Status is required' })
  status: TaskStatus;

  @ApiPropertyOptional({
    example: ['uuid-1', 'uuid-2'],
    description: 'Array of user IDs to assign',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each assignee ID must be a valid UUID' })
  @IsOptional()
  assigneeIds?: string[];
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Implement user authentication',
    description: 'Task title',
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title?: string;

  @ApiPropertyOptional({
    example: 'Implement JWT authentication with refresh tokens',
    description: 'Detailed task description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Task due date (YYYY-MM-DD or ISO 8601 format)',
  })
  @IsValidDateFormat({ message: 'Date must be in format YYYY-MM-DD or ISO 8601' })
  @IsOptional()
  dueDate?: Date | string;

  @ApiPropertyOptional({
    example: 'HIGH',
    enum: TaskPriority,
    description: 'Task priority level',
  })
  @IsEnum(TaskPriority, { message: 'Invalid priority value' })
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: 'IN_PROGRESS',
    enum: TaskStatus,
    description: 'Task status',
  })
  @IsEnum(TaskStatus, { message: 'Invalid status value' })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    example: ['uuid-1', 'uuid-2'],
    description: 'Array of user IDs to assign',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each assignee ID must be a valid UUID' })
  @IsOptional()
  assigneeIds?: string[];
}

export class CreateCommentDto {
  @ApiProperty({
    example: 'This task needs to be reviewed before deployment',
    description: 'Comment content',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  @MinLength(1, { message: 'Content cannot be empty' })
  content: string;
}
