import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from '../../../src/players/services/players.service';
import { PlayersRepository } from '../../../src/players/repositories/players.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PlayersService (TDD - RED Phase)', () => {
  let service: PlayersService;
  let repository: jest.Mocked<PlayersRepository>;

  const mockPlayersRepository = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        {
          provide: PlayersRepository,
          useValue: mockPlayersRepository,
        },
      ],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
    repository = module.get(PlayersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPlayer', () => {
    it('should create a new player successfully', async () => {
      const createPlayerDto = {
        username: 'testuser',
        email: 'test@example.com',
      };

      const expectedPlayer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createPlayerDto,
        stats: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create.mockResolvedValue(expectedPlayer);

      const result = await service.createPlayer(createPlayerDto);

      expect(result).toEqual(expectedPlayer);
      expect(repository.create).toHaveBeenCalledWith(createPlayerDto);
    });

    it('should throw BadRequestException when username already exists', async () => {
      const createPlayerDto = {
        username: 'existinguser',
        email: 'new@example.com',
      };

      repository.findByUsername.mockResolvedValue({ id: '123', username: 'existinguser' } as any);

      await expect(service.createPlayer(createPlayerDto)).rejects.toThrow(BadRequestException);
      expect(repository.findByUsername).toHaveBeenCalledWith('existinguser');
    });

    it('should throw BadRequestException when email already exists', async () => {
      const createPlayerDto = {
        username: 'newuser',
        email: 'existing@example.com',
      };

      repository.findByEmail.mockResolvedValue({ id: '123', email: 'existing@example.com' } as any);

      await expect(service.createPlayer(createPlayerDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid email format', async () => {
      const createPlayerDto = {
        username: 'testuser',
        email: 'invalid-email',
      };

      await expect(service.createPlayer(createPlayerDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty username', async () => {
      const createPlayerDto = {
        username: '',
        email: 'test@example.com',
      };

      await expect(service.createPlayer(createPlayerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPlayerById', () => {
    it('should return a player by ID', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedPlayer = {
        id: playerId,
        username: 'testuser',
        email: 'test@example.com',
        stats: { level: 5 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findById.mockResolvedValue(expectedPlayer);

      const result = await service.getPlayerById(playerId);

      expect(result).toEqual(expectedPlayer);
      expect(repository.findById).toHaveBeenCalledWith(playerId);
    });

    it('should throw NotFoundException when player does not exist', async () => {
      const playerId = 'non-existent-id';
      repository.findById.mockResolvedValue(null);

      await expect(service.getPlayerById(playerId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';

      await expect(service.getPlayerById(invalidId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null player ID', async () => {
      await expect(service.getPlayerById(null)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updatePlayerStats', () => {
    it('should update player stats successfully', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const statsUpdate = { level: 10, xp: 5000 };

      const existingPlayer = {
        id: playerId,
        username: 'testuser',
        stats: { level: 5, xp: 2000 },
      };

      const updatedPlayer = {
        ...existingPlayer,
        stats: { ...existingPlayer.stats, ...statsUpdate },
      };

      repository.findById.mockResolvedValue(existingPlayer as any);
      repository.update.mockResolvedValue(updatedPlayer as any);

      const result = await service.updatePlayerStats(playerId, statsUpdate);

      expect(result.stats.level).toBe(10);
      expect(result.stats.xp).toBe(5000);
    });

    it('should throw NotFoundException when updating non-existent player', async () => {
      const playerId = 'non-existent-id';
      repository.findById.mockResolvedValue(null);

      await expect(service.updatePlayerStats(playerId, { level: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for negative stat values', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const invalidStats = { level: -5, xp: -100 };

      await expect(service.updatePlayerStats(playerId, invalidStats)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
