import { Test, TestingModule } from '@nestjs/testing';
import { EventListenerService } from '../../../src/event-listener/services/event-listener.service';
import { PlayerAchievementsService } from '../../../src/player-achievements/services/player-achievements.service';
import { AchievementsService } from '../../../src/achievements/services/achievements.service';
import { RabbitMQService } from '../../../src/rabbitmq/services/rabbitmq.service';

describe('EventListenerService - Observer Pattern (TDD - RED Phase)', () => {
  let service: EventListenerService;
  let playerAchievementsService: jest.Mocked<PlayerAchievementsService>;
  let achievementsService: jest.Mocked<AchievementsService>;
  let rabbitmqService: jest.Mocked<RabbitMQService>;

  const mockPlayerAchievementsService = {
    evaluateAchievements: jest.fn(),
    getPlayerProgress: jest.fn(),
    isAchievementUnlocked: jest.fn(),
  };

  const mockAchievementsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByRuleType: jest.fn(),
  };

  const mockRabbitMQService = {
    publishEvent: jest.fn(),
    subscribe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventListenerService,
        {
          provide: PlayerAchievementsService,
          useValue: mockPlayerAchievementsService,
        },
        {
          provide: AchievementsService,
          useValue: mockAchievementsService,
        },
        {
          provide: RabbitMQService,
          useValue: mockRabbitMQService,
        },
      ],
    }).compile();

    service = module.get<EventListenerService>(EventListenerService);
    playerAchievementsService = module.get(PlayerAchievementsService);
    achievementsService = module.get(AchievementsService);
    rabbitmqService = module.get(RabbitMQService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handlePlayerEvent - Observer Reaction', () => {
    it('should unlock "Cazador de Sombras" achievement when 10 monsters killed', async () => {
      const playerEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        eventType: 'monster_killed',
        eventData: { monsterType: 'shadow', count: 10 },
      };

      const achievement = {
        id: 'achievement-001',
        name: 'Cazador de Sombras',
        ruleType: 'MONSTER_KILL_COUNT',
        ruleConfig: { target: 10 },
        rewardType: 'COINS',
        rewardValue: 500,
      };

      achievementsService.findByRuleType.mockResolvedValue([achievement] as any);
      playerAchievementsService.isAchievementUnlocked.mockResolvedValue(false);
      playerAchievementsService.evaluateAchievements.mockResolvedValue({
        unlocked: true,
        achievementId: achievement.id,
      } as any);

      await service.handlePlayerEvent(playerEvent);

      expect(playerAchievementsService.evaluateAchievements).toHaveBeenCalled();
      expect(rabbitmqService.publishEvent).toHaveBeenCalledWith(
        'achievement.events',
        expect.objectContaining({
          routingKey: 'achievement.unlocked',
          data: expect.objectContaining({
            achievementId: achievement.id,
            playerId: playerEvent.playerId,
          }),
        }),
      );
    });

    it('should unlock "Veterano" achievement when 5 hours played', async () => {
      const playerEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        eventType: 'time_played',
        eventData: { minutes: 300 }, // 5 hours
      };

      const achievement = {
        id: 'achievement-002',
        name: 'Veterano',
        ruleType: 'PLAYTIME',
        ruleConfig: { target: 300 },
        rewardType: 'XP',
        rewardValue: 1000,
      };

      achievementsService.findByRuleType.mockResolvedValue([achievement] as any);
      playerAchievementsService.isAchievementUnlocked.mockResolvedValue(false);
      playerAchievementsService.evaluateAchievements.mockResolvedValue({
        unlocked: true,
        achievementId: achievement.id,
      } as any);

      await service.handlePlayerEvent(playerEvent);

      expect(rabbitmqService.publishEvent).toHaveBeenCalled();
    });

    it('should NOT unlock already unlocked achievement (prevent duplicates)', async () => {
      const playerEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        eventType: 'monster_killed',
        eventData: { count: 10 },
      };

      const achievement = {
        id: 'achievement-001',
        name: 'Cazador de Sombras',
        ruleType: 'MONSTER_KILL_COUNT',
        ruleConfig: { target: 10 },
      };

      achievementsService.findByRuleType.mockResolvedValue([achievement] as any);
      playerAchievementsService.isAchievementUnlocked.mockResolvedValue(true);

      await service.handlePlayerEvent(playerEvent);

      expect(playerAchievementsService.evaluateAchievements).not.toHaveBeenCalled();
      expect(rabbitmqService.publishEvent).not.toHaveBeenCalled();
    });

    it('should handle events that arrive out of order gracefully', async () => {
      const event1 = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        eventType: 'monster_killed',
        eventData: { count: 5 },
        timestamp: new Date('2024-01-01T12:00:00Z'),
      };

      const event2 = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        eventType: 'monster_killed',
        eventData: { count: 3 },
        timestamp: new Date('2024-01-01T11:00:00Z'), // Earlier timestamp
      };

      achievementsService.findByRuleType.mockResolvedValue([]);
      playerAchievementsService.evaluateAchievements.mockResolvedValue({ unlocked: false } as any);

      await service.handlePlayerEvent(event1);
      await service.handlePlayerEvent(event2);

      expect(playerAchievementsService.evaluateAchievements).toHaveBeenCalledTimes(2);
    });

    it('should handle PostgreSQL persistence failure', async () => {
      const playerEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        eventType: 'monster_killed',
        eventData: { count: 10 },
      };

      achievementsService.findByRuleType.mockResolvedValue([{ id: 'ach-001' }] as any);
      playerAchievementsService.evaluateAchievements.mockRejectedValue(
        new Error('Database connection lost'),
      );

      await expect(service.handlePlayerEvent(playerEvent)).rejects.toThrow(
        'Database connection lost',
      );
      expect(rabbitmqService.publishEvent).not.toHaveBeenCalled();
    });

    it('should handle malformed event data gracefully', async () => {
      const malformedEvent = {
        playerId: null,
        eventType: 'monster_killed',
        eventData: undefined,
      };

      await expect(service.handlePlayerEvent(malformedEvent as any)).rejects.toThrow();
    });

    it('should handle missing achievement rules', async () => {
      const playerEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        eventType: 'unknown_event',
        eventData: { data: 'test' },
      };

      achievementsService.findByRuleType.mockResolvedValue([]);

      await service.handlePlayerEvent(playerEvent);

      expect(playerAchievementsService.evaluateAchievements).not.toHaveBeenCalled();
    });
  });

  describe('handleAchievementProgress', () => {
    it('should update progress without unlocking achievement', async () => {
      const playerEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        eventType: 'monster_killed',
        eventData: { count: 3 },
      };

      const achievement = {
        id: 'achievement-001',
        ruleType: 'MONSTER_KILL_COUNT',
        ruleConfig: { target: 10 },
      };

      achievementsService.findByRuleType.mockResolvedValue([achievement] as any);
      playerAchievementsService.getPlayerProgress.mockResolvedValue({ progress: 3 } as any);
      playerAchievementsService.evaluateAchievements.mockResolvedValue({ unlocked: false } as any);

      await service.handlePlayerEvent(playerEvent);

      expect(rabbitmqService.publishEvent).toHaveBeenCalledWith(
        'achievement.events',
        expect.objectContaining({
          routingKey: 'achievement.progress',
        }),
      );
    });
  });
});
