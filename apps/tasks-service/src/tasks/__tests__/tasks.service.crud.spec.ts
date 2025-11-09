import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { TasksService } from '../tasks.service';
import { Task } from '../../entities/task.entity';
import { Comment } from '../../entities/comment.entity';
import { TaskHistory } from '../../entities/task-history.entity';
import { TaskAssignee } from '../../entities/task-assignee.entity';
import { EventsService } from '../../events/events.service';
import { TaskStatus, TaskPriority, CreateTaskDto, UpdateTaskDto } from '@repo/types';
import {
  mockTask,
  createMockRepositories,
  createMockAuthService,
  createMockEventsService,
} from './test-helpers';

describe('TasksService - CRUD Operations', () => {
  let service: TasksService;
  let mockRepositories: ReturnType<typeof createMockRepositories>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockEventsService: ReturnType<typeof createMockEventsService>;

  beforeEach(async () => {
    mockRepositories = createMockRepositories();
    mockAuthService = createMockAuthService();
    mockEventsService = createMockEventsService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepositories.task,
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepositories.comment,
        },
        {
          provide: getRepositoryToken(TaskHistory),
          useValue: mockRepositories.history,
        },
        {
          provide: getRepositoryToken(TaskAssignee),
          useValue: mockRepositories.assignee,
        },
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthService,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const createTaskDto: CreateTaskDto & { creatorId: string } = {
      title: 'New Task',
      description: 'New Description',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: new Date('2024-12-31'),
      assigneeIds: ['user-456'],
      creatorId: 'user-123',
    };

    it('should create a task with all fields', async () => {
      const savedTask = { ...mockTask, ...createTaskDto };

      (mockRepositories.task.create as jest.Mock).mockReturnValue(savedTask);
      (mockRepositories.task.save as jest.Mock).mockResolvedValue(savedTask);
      (mockRepositories.assignee.create as jest.Mock).mockReturnValue({
        taskId: savedTask.id,
        userId: 'user-456',
      });
      (mockRepositories.assignee.save as jest.Mock).mockResolvedValue(undefined);
      (mockRepositories.history.create as jest.Mock).mockReturnValue({});
      (mockRepositories.history.save as jest.Mock).mockResolvedValue(undefined);
      (mockEventsService.publishTaskCreated as jest.Mock).mockResolvedValue(undefined);
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue({
        ...savedTask,
        assignees: [{ userId: 'user-456', taskId: savedTask.id }],
      });
      (mockAuthService.send as jest.Mock).mockReturnValue(
        of([{ id: 'user-456', email: 'assignee@test.com', username: 'assignee' }])
      );

      const result = await service.createTask(createTaskDto);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(createTaskDto.title);
      expect(result.priority).toBe(createTaskDto.priority);
    });

    it('should assign users to task', async () => {
      const savedTask = { ...mockTask, ...createTaskDto };

      (mockRepositories.task.create as jest.Mock).mockReturnValue(savedTask);
      (mockRepositories.task.save as jest.Mock).mockResolvedValue(savedTask);
      (mockRepositories.assignee.create as jest.Mock).mockReturnValue({
        taskId: savedTask.id,
        userId: 'user-456',
      });
      (mockRepositories.assignee.save as jest.Mock).mockResolvedValue(undefined);
      (mockRepositories.history.create as jest.Mock).mockReturnValue({});
      (mockRepositories.history.save as jest.Mock).mockResolvedValue(undefined);
      (mockEventsService.publishTaskCreated as jest.Mock).mockResolvedValue(undefined);
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue({
        ...savedTask,
        assignees: [{ userId: 'user-456', taskId: savedTask.id }],
      });
      (mockAuthService.send as jest.Mock).mockReturnValue(
        of([{ id: 'user-456', email: 'assignee@test.com', username: 'assignee' }])
      );

      await service.createTask(createTaskDto);

      expect(mockRepositories.assignee.save).toHaveBeenCalled();
    });

    it('should create history entry', async () => {
      const savedTask = { ...mockTask, ...createTaskDto };

      (mockRepositories.task.create as jest.Mock).mockReturnValue(savedTask);
      (mockRepositories.task.save as jest.Mock).mockResolvedValue(savedTask);
      (mockRepositories.assignee.create as jest.Mock).mockReturnValue({});
      (mockRepositories.assignee.save as jest.Mock).mockResolvedValue(undefined);
      (mockRepositories.history.create as jest.Mock).mockReturnValue({});
      (mockRepositories.history.save as jest.Mock).mockResolvedValue(undefined);
      (mockEventsService.publishTaskCreated as jest.Mock).mockResolvedValue(undefined);
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue({
        ...savedTask,
        assignees: [],
      });
      (mockAuthService.send as jest.Mock).mockReturnValue(of([]));

      await service.createTask(createTaskDto);

      expect(mockRepositories.history.create).toHaveBeenCalled();
      expect(mockRepositories.history.save).toHaveBeenCalled();
    });

    it('should publish task created event', async () => {
      const savedTask = { ...mockTask, ...createTaskDto };

      (mockRepositories.task.create as jest.Mock).mockReturnValue(savedTask);
      (mockRepositories.task.save as jest.Mock).mockResolvedValue(savedTask);
      (mockRepositories.assignee.create as jest.Mock).mockReturnValue({});
      (mockRepositories.assignee.save as jest.Mock).mockResolvedValue(undefined);
      (mockRepositories.history.create as jest.Mock).mockReturnValue({});
      (mockRepositories.history.save as jest.Mock).mockResolvedValue(undefined);
      (mockEventsService.publishTaskCreated as jest.Mock).mockResolvedValue(undefined);
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue({
        ...savedTask,
        assignees: [],
      });
      (mockAuthService.send as jest.Mock).mockReturnValue(of([]));

      await service.createTask(createTaskDto);

      expect(mockEventsService.publishTaskCreated).toHaveBeenCalledWith(
        savedTask.id,
        savedTask.title,
        createTaskDto.creatorId,
        createTaskDto.assigneeIds
      );
    });
  });

  describe('updateTask', () => {
    const updateTaskDto: UpdateTaskDto & { userId: string } = {
      title: 'Updated Title',
      description: 'Updated Description',
      userId: 'user-123',
    };

    it('should update task fields', async () => {
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(mockTask);
      (mockRepositories.task.save as jest.Mock).mockResolvedValue({
        ...mockTask,
        ...updateTaskDto,
      });
      (mockRepositories.history.create as jest.Mock).mockReturnValue({});
      (mockRepositories.history.save as jest.Mock).mockResolvedValue(undefined);
      (mockEventsService.publishTaskUpdated as jest.Mock).mockResolvedValue(undefined);
      (mockAuthService.send as jest.Mock).mockReturnValue(of([]));

      const result = await service.updateTask(mockTask.id, updateTaskDto);

      expect(result.title).toBe(updateTaskDto.title);
      expect(result.description).toBe(updateTaskDto.description);
    });

    it('should track changes in history', async () => {
      const originalTask = {
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-12-31'),
        creatorId: 'user-123',
        assignees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(originalTask);
      (mockRepositories.task.save as jest.Mock).mockResolvedValue({
        ...originalTask,
        title: 'Updated Title',
        description: 'Updated Description',
      });
      (mockRepositories.history.create as jest.Mock).mockReturnValue({});
      (mockRepositories.history.save as jest.Mock).mockResolvedValue(undefined);
      (mockEventsService.publishTaskUpdated as jest.Mock).mockResolvedValue(undefined);
      (mockAuthService.send as jest.Mock).mockReturnValue(of([]));

      await service.updateTask('task-123', updateTaskDto);

      expect(mockRepositories.history.create).toHaveBeenCalled();
      expect(mockRepositories.history.save).toHaveBeenCalled();
    });

    it('should update assignees when provided', async () => {
      const updateWithAssignees = {
        ...updateTaskDto,
        assigneeIds: ['user-456', 'user-789'],
      };

      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(mockTask);
      (mockRepositories.task.save as jest.Mock).mockResolvedValue(mockTask);
      (mockRepositories.assignee.delete as jest.Mock).mockResolvedValue(undefined);
      (mockRepositories.assignee.create as jest.Mock).mockReturnValue({});
      (mockRepositories.assignee.save as jest.Mock).mockResolvedValue(undefined);
      (mockRepositories.history.create as jest.Mock).mockReturnValue({});
      (mockRepositories.history.save as jest.Mock).mockResolvedValue(undefined);
      (mockEventsService.publishTaskUpdated as jest.Mock).mockResolvedValue(undefined);
      (mockAuthService.send as jest.Mock).mockReturnValue(of([]));

      await service.updateTask(mockTask.id, updateWithAssignees);

      expect(mockRepositories.assignee.delete).toHaveBeenCalledWith({ taskId: mockTask.id });
      expect(mockRepositories.assignee.save).toHaveBeenCalled();
    });

    it('should publish task updated event only when changes exist', async () => {
      const originalTask = {
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-12-31'),
        creatorId: 'user-123',
        assignees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(originalTask);
      (mockRepositories.task.save as jest.Mock).mockResolvedValue({
        ...originalTask,
        title: 'Updated Title',
        description: 'Updated Description',
      });
      (mockRepositories.history.create as jest.Mock).mockReturnValue({});
      (mockRepositories.history.save as jest.Mock).mockResolvedValue(undefined);
      (mockEventsService.publishTaskUpdated as jest.Mock).mockResolvedValue(undefined);
      (mockAuthService.send as jest.Mock).mockReturnValue(of([]));

      await service.updateTask('task-123', updateTaskDto);

      expect(mockEventsService.publishTaskUpdated).toHaveBeenCalled();
    });

    it('should not publish event when no changes', async () => {
      const noChangesDto = {
        userId: 'user-123',
      };

      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(mockTask);
      (mockRepositories.task.save as jest.Mock).mockResolvedValue(mockTask);
      (mockAuthService.send as jest.Mock).mockReturnValue(of([]));

      await service.updateTask(mockTask.id, noChangesDto);

      expect(mockEventsService.publishTaskUpdated).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(mockTask);
      (mockRepositories.task.remove as jest.Mock).mockResolvedValue(mockTask);

      const result = await service.deleteTask(mockTask.id, 'user-123');

      expect(result.message).toBe('Task deleted successfully');
      expect(mockRepositories.task.remove).toHaveBeenCalledWith(mockTask);
    });

    it('should cascade delete related entities', async () => {
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(mockTask);
      (mockRepositories.task.remove as jest.Mock).mockResolvedValue(mockTask);

      await service.deleteTask(mockTask.id, 'user-123');

      expect(mockRepositories.task.remove).toHaveBeenCalledWith(mockTask);
    });
  });
});
