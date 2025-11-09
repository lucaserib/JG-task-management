import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { User } from '../../entities/user.entity';
import { mockUser, createMockRepository, createMockJwtService } from './test-helpers';

describe('AuthService - User Queries', () => {
  let service: AuthService;
  let userRepository: Repository<User>;

  const mockUserRepository = createMockRepository();
  const mockJwtService = createMockJwtService();

  const mockUser2 = {
    ...mockUser,
    id: 'user-456',
    email: 'test2@example.com',
    username: 'testuser2',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user payload when user exists', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserById(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should return null when user not found', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.getUserById('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should not expose sensitive fields like password', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserById(mockUser.id);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshToken');
      expect(result).not.toHaveProperty('resetPasswordToken');
    });
  });

  describe('getUsersByIds', () => {
    it('should return array of user payloads', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser, mockUser2]),
      };

      (mockUserRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

      const result = await service.getUsersByIds([mockUser.id, mockUser2.id]);

      expect(result).toEqual([
        {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
        },
        {
          id: mockUser2.id,
          email: mockUser2.email,
          username: mockUser2.username,
        },
      ]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.id IN (:...userIds)',
        { userIds: [mockUser.id, mockUser2.id] }
      );
    });

    it('should return empty array when no users found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      (mockUserRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

      const result = await service.getUsersByIds(['nonexistent-id']);

      expect(result).toEqual([]);
    });

    it('should handle empty input array', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      (mockUserRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

      const result = await service.getUsersByIds([]);

      expect(result).toEqual([]);
    });

    it('should not expose sensitive fields', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser]),
      };

      (mockUserRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

      const result = await service.getUsersByIds([mockUser.id]);

      expect(result[0]).not.toHaveProperty('password');
      expect(result[0]).not.toHaveProperty('refreshToken');
      expect(result[0]).not.toHaveProperty('resetPasswordToken');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users ordered by username', async () => {
      (mockUserRepository.find as jest.Mock).mockResolvedValue([mockUser, mockUser2]);

      const result = await service.getAllUsers();

      expect(result).toEqual([
        {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
        },
        {
          id: mockUser2.id,
          email: mockUser2.email,
          username: mockUser2.username,
        },
      ]);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'username'],
        order: { username: 'ASC' },
      });
    });

    it('should only select safe fields', async () => {
      (mockUserRepository.find as jest.Mock).mockResolvedValue([]);

      await service.getAllUsers();

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'username'],
        order: { username: 'ASC' },
      });
    });

    it('should return empty array when no users exist', async () => {
      (mockUserRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.getAllUsers();

      expect(result).toEqual([]);
    });

    it('should order results by username ascending', async () => {
      (mockUserRepository.find as jest.Mock).mockResolvedValue([mockUser, mockUser2]);

      await service.getAllUsers();

      expect(mockUserRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { username: 'ASC' },
        })
      );
    });
  });
});
