import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { TaskPriority, TaskStatus } from '@repo/types';
import { Comment } from './comment.entity';
import { TaskHistory } from './task-history.entity';
import { TaskAssignee } from './task-assignee.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @Index()
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @Index()
  status: TaskStatus;

  @Column({ type: 'uuid' })
  @Index()
  creatorId: string;

  @OneToMany(() => Comment, (comment) => comment.task, { cascade: true })
  comments: Comment[];

  @OneToMany(() => TaskHistory, (history) => history.task, { cascade: true })
  history: TaskHistory[];

  @OneToMany(() => TaskAssignee, (assignee) => assignee.task, { cascade: true })
  assignees: TaskAssignee[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
