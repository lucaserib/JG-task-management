import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('task_history')
export class TaskHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  taskId: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column()
  action: string;

  @Column({ type: 'jsonb' })
  changes: Record<string, any>;

  @ManyToOne(() => Task, (task) => task.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @CreateDateColumn()
  createdAt: Date;
}
