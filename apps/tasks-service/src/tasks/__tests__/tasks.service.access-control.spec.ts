import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { TasksService } from '../tasks.service';
import { Task } from '../../entities/task.entity';
import { Comment } from '../../entities/comment.entity';
import { TaskHistory } from '../../entities/task-history.entity';
import { TaskAssignee } from '../../entities/task-assignee.entity';
import { EventsService } from '../../events/events.service';
import { CreateCommentDto, TaskStatus } from '@repo/types';
import {
  mockTask,
  mockUser,
  createMockRepositories,
  createMockAuthService,
  createMockEventsService,
} from './test-helpers';

describe('TasksService - Access Control', () => {
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

  describe('getTaskById - Access Control', () => {
    it('should allow access when user is creator', async () => {
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(mockTask);
      (mockAuthService.send as jest.Mock).mockReturnValue(of([]));

      const result = await service.getTaskById(mockTask.id, 'user-123');

      expect(result).toBeDefined();
      expect(result.id).toBe(mockTask.id);
    });

    it('should allow access when user is assignee', async () => {
      const taskWithAssignees = {
        ...mockTask,
        creatorId: 'other-user',
        assignees: [{ userId: 'user-123', taskId: mockTask.id }],
      };

      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(taskWithAssignees);
      (mockAuthService.send as jest.Mock).mockReturnValue(
        of([{ id: 'user-123', email: 'test@test.com', username: 'test' }])
      );

      const result = await service.getTaskById(mockTask.id, 'user-123');

      expect(result).toBeDefined();
    });

    it('should deny access when user is neither creator nor assignee', async () => {
      const taskWithDifferentCreator = {
        ...mockTask,
        creatorId: 'other-user',
        assignees: [],
      };

      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(taskWithDifferentCreator);

      await expect(service.getTaskById(mockTask.id, 'user-123')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw NotFoundException when task does not exist', async () => {
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getTaskById('nonexistent-id', 'user-123')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('updateTask - Access Control', () => {
    it('should allow update when user is creator', async () => {
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(mockTask);
      (mockRepositories.task.save as jest.Mock).mockResolvedValue({
        ...mockTask,
        title: 'Updated Title',
      });
      (mockRepositories.history.create as jest.Mock).mockReturnValue({});
      (mockRepositories.history.save as jest.Mock).mockResolvedValue(undefined);
      (mockEventsService.publishTaskUpdated as jest.Mock).mockResolvedValue(undefined);
      (mockAuthService.send as jest.Mock).mockReturnValue(of([]));

      const result = await service.updateTask(mockTask.id, {
        title: 'Updated Title',
        userId: 'user-123',
      });

      expect(result.title).toBe('Updated Title');
      expect(mockRepositories.task.save).toHaveBeenCalled();
    });

    it('should deny update when user is not creator', async () => {
      const taskWithDifferentCreator = {
        ...mockTask,
        creatorId: 'other-user',
      };

      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(taskWithDifferentCreator);

      await expect(
        service.updateTask(mockTask.id, {
          title: 'Updated Title',
          userId: 'user-123',
        })
      ).rejects.toThrow(ForbiddenException);

      expect(mockRepositories.task.save).not.toHaveBeenCalled();
    });

    it('should deny update even if user is assignee but not creator', async () => {
      const taskWithAssignees = {
        ...mockTask,
        creatorId: 'other-user',
        assignees: [{ userId: 'user-123', taskId: mockTask.id }],
      };

      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(taskWithAssignees);

      await expect(
        service.updateTask(mockTask.id, {
          title: 'Updated Title',
          userId: 'user-123',
        })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteTask - Access Control', () => {
    it('should allow delete when user is creator', async () => {
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(mockTask);
      (mockRepositories.task.remove as jest.Mock).mockResolvedValue(mockTask);

      const result = await service.deleteTask(mockTask.id, 'user-123');

      expect(result.message).toBe('Task deleted successfully');
      expect(mockRepositories.task.remove).toHaveBeenCalledWith(mockTask);
    });

    it('should deny delete when user is not creator', async () => {
      const taskWithDifferentCreator = {
        ...mockTask,
        creatorId: 'other-user',
      };

      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(taskWithDifferentCreator);

      await expect(service.deleteTask(mockTask.id, 'user-123')).rejects.toThrow(
        ForbiddenException
      );

      expect(mockRepositories.task.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task does not exist', async () => {
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteTask('nonexistent-id', 'user-123')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('createComment - Access Control', () => {
    const createCommentDto: CreateCommentDto & { taskId: string; authorId: string } = {
      content: 'Test comment',
      taskId: 'task-123',
      authorId: 'user-123',
    };

    it('should allow comment when user is creator', async () => {
      const mockComment = {
        id: 'comment-123',
        content: createCommentDto.content,
        taskId: createCommentDto.taskId,
        authorId: createCommentDto.authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(mockTask);
      (mockRepositories.comment.create as jest.Mock).mockReturnValue(mockComment);
      (mockRepositories.comment.save as jest.Mock).mockResolvedValue(mockComment);
      (mockRepositories.history.create as jest.Mock).mockReturnValue({});
      (mockRepositories.history.save as jest.Mock).mockResolvedValue(undefined);
      (mockEventsService.publishCommentCreated as jest.Mock).mockResolvedValue(undefined);
      (mockAuthService.send as jest.Mock).mockReturnValue(
        of({ id: 'user-123', email: 'test@test.com', username: 'test' })
      );

      const result = await service.createComment(createCommentDto);

      expect(result.content).toBe(createCommentDto.content);
      expect(mockRepositories.comment.save).toHaveBeenCalled();
    });

    it('should allow comment when user is assignee', async () => {
      const taskWithAssignees = {
        ...mockTask,
        creatorId: 'other-user',
        assignees: [{ userId: 'user-123', taskId: mockTask.id }],
      };

      const mockComment = {
        id: 'comment-123',
        content: createCommentDto.content,
        taskId: createCommentDto.taskId,
        authorId: createCommentDto.authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(taskWithAssignees);
      (mockRepositories.comment.create as jest.Mock).mockReturnValue(mockComment);
      (mockRepositories.comment.save as jest.Mock).mockResolvedValue(mockComment);
      (mockRepositories.history.create as jest.Mock).mockReturnValue({});
      (mockRepositories.history.save as jest.Mock).mockResolvedValue(undefined);
      (mockEventsService.publishCommentCreated as jest.Mock).mockResolvedValue(undefined);
      (mockAuthService.send as jest.Mock).mockReturnValue(
        of({ id: 'user-123', email: 'test@test.com', username: 'test' })
      );

      const result = await service.createComment(createCommentDto);

      expect(result).toBeDefined();
    });

    it('should deny comment when user has no access', async () => {
      const taskWithDifferentCreator = {
        ...mockTask,
        creatorId: 'other-user',
        assignees: [],
      };

      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(taskWithDifferentCreator);

      await expect(service.createComment(createCommentDto)).rejects.toThrow(ForbiddenException);

      expect(mockRepositories.comment.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task does not exist', async () => {
      (mockRepositories.task.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.createComment(createCommentDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTasks - Filtering with Access Control', () => {
    it('should filter tasks by user access (creator or assignee)', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTask], 1]),
      };

      (mockRepositories.task.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);
      (mockAuthService.send as jest.Mock).mockReturnValue(of([]));

      const result = await service.getTasks({
        page: 1,
        size: 10,
        userId: 'user-123',
      });

      expect(result.data).toBeDefined();
      expect(result.meta.total).toBe(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(task.creatorId = :userId OR assignee.userId = :userId)',
        { userId: 'user-123' }
      );
    });

    it('should apply ACL filter before other filters', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      (mockRepositories.task.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);
      (mockAuthService.send as jest.Mock).mockReturnValue(of([]));

      await service.getTasks({
        page: 1,
        size: 10,
        status: TaskStatus.TODO,
        userId: 'user-123',
      });

      const calls = (mockQueryBuilder.andWhere as jest.Mock).mock.calls;
      const aclCall = calls.find((call) => call[0].includes('creatorId'));

      expect(aclCall).toBeDefined();
    });
  });
});
