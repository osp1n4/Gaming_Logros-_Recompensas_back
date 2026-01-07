import { Test, TestingModule } from '@nestjs/testing';
import { PlayerAchievementsService } from '../../../src/player-achievements/services/player-achievements.service';
import { PlayerAchievementsRepository } from '../../../src/player-achievements/repositories/player-achievements.repository';
import { RabbitMQService } from '../../../src/rabbitmq/services/rabbitmq.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('PlayerAchievementsService (TDD - RED Phase)', () => {
  let service: PlayerAchievementsService;
  let repository: jest.Mocked<PlayerAchievementsRepository>;
  let rabbitmqService: jest.Mocked<RabbitMQService>;

  const mockRepository = {
    findByPlayerAndAchievement: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findByPlayerId: jest.fn(),
  };

  const mockRabbitMQService = {
    publishEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerAchievementsService,
        {
          provide: PlayerAchievementsRepository,
          useValue: mockRepository,
        },
        {
          provide: RabbitMQService,
          useValue: mockRabbitMQService,
        },
      ],
    }).compile();

    service = module.get<PlayerAchievementsService>(PlayerAchievementsService);
    repository = module.get(PlayerAchievementsRepository);
    rabbitmqService = module.get(RabbitMQService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('evaluateAchievements', () => {
    it('should unlock achievement when target is reached', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const achievementId = 'achievement-001';
      const eventData = { count: 10 };

      const achievement = {
        id: achievementId,
        ruleType: 'MONSTER_KILL_COUNT',
        ruleConfig: { target: 10 },
        rewardType: 'COINS',
        rewardValue: 500,
      };

      const playerAchievement = {
        id: 'pa-001',
        playerId,
        achievementId,
        progress: 10,
        unlocked: false,
      };

      repository.findByPlayerAndAchievement.mockResolvedValue(playerAchievement as any);
      repository.update.mockResolvedValue({ ...playerAchievement, unlocked: true } as any);

      const result = await service.evaluateAchievements(playerId, achievement as any, eventData);

      expect(result.unlocked).toBe(true);
      expect(repository.update).toHaveBeenCalledWith(
        'pa-001',
        expect.objectContaining({ unlocked: true }),
      );
    });

    it('should prevent duplicate unlock of achievement', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const achievementId = 'achievement-001';

      const playerAchievement = {
        id: 'pa-001',
        playerId,
        achievementId,
        progress: 10,
        unlocked: true,
        unlockedAt: new Date(),
      };

      repository.findByPlayerAndAchievement.mockResolvedValue(playerAchievement as any);

      await expect(
        service.evaluateAchievements(playerId, { id: achievementId } as any, {}),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle database transaction failure', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const achievementId = 'achievement-001';

      repository.findByPlayerAndAchievement.mockResolvedValue({
        id: 'pa-001',
        unlocked: false,
      } as any);
      repository.update.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        service.evaluateAchievements(playerId, { id: achievementId } as any, { count: 10 }),
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('isAchievementUnlocked', () => {
    it('should return true for unlocked achievement', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const achievementId = 'achievement-001';

      repository.findByPlayerAndAchievement.mockResolvedValue({
        unlocked: true,
      } as any);

      const result = await service.isAchievementUnlocked(playerId, achievementId);

      expect(result).toBe(true);
    });

    it('should return false for locked achievement', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const achievementId = 'achievement-001';

      repository.findByPlayerAndAchievement.mockResolvedValue({
        unlocked: false,
      } as any);

      const result = await service.isAchievementUnlocked(playerId, achievementId);

      expect(result).toBe(false);
    });

    it('should return false when achievement progress does not exist', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const achievementId = 'achievement-001';

      repository.findByPlayerAndAchievement.mockResolvedValue(null);

      const result = await service.isAchievementUnlocked(playerId, achievementId);

      expect(result).toBe(false);
    });
  });
});
