import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('task_assignees')
@Unique(['taskId', 'userId'])
export class TaskAssignee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  taskId: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => Task, (task) => task.assignees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @CreateDateColumn()
  assignedAt: Date;
}
