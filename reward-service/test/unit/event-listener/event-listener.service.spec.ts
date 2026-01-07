import { Test, TestingModule } from '@nestjs/testing';
import { EventListenerService } from '../../../src/event-listener/services/event-listener.service';
import { RewardsService } from '../../../src/rewards/services/rewards.service';
import { InventoryService } from '../../../src/inventory/services/inventory.service';

describe('EventListenerService - Reward Service (TDD - RED Phase)', () => {
  let service: EventListenerService;
  let rewardsService: jest.Mocked<RewardsService>;
  let inventoryService: jest.Mocked<InventoryService>;

  const mockRewardsService = {
    grantReward: jest.fn(),
    isRewardGranted: jest.fn(),
  };

  const mockInventoryService = {
    addToInventory: jest.fn(),
    getPlayerInventory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventListenerService,
        {
          provide: RewardsService,
          useValue: mockRewardsService,
        },
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    }).compile();

    service = module.get<EventListenerService>(EventListenerService);
    rewardsService = module.get(RewardsService);
    inventoryService = module.get(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAchievementUnlocked', () => {
    it('should grant coins reward successfully', async () => {
      const achievementEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        achievementId: 'achievement-001',
        rewardType: 'COINS',
        rewardValue: 500,
      };

      rewardsService.isRewardGranted.mockResolvedValue(false);
      rewardsService.grantReward.mockResolvedValue({
        id: 'reward-001',
        playerId: achievementEvent.playerId,
        rewardType: 'COINS',
        rewardValue: 500,
      } as any);
      inventoryService.addToInventory.mockResolvedValue(undefined);

      await service.handleAchievementUnlocked(achievementEvent);

      expect(rewardsService.grantReward).toHaveBeenCalledWith(achievementEvent);
      expect(inventoryService.addToInventory).toHaveBeenCalledWith(
        achievementEvent.playerId,
        'COINS',
        500,
      );
    });

    it('should grant item reward successfully', async () => {
      const achievementEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        achievementId: 'achievement-002',
        rewardType: 'ITEM',
        rewardValue: 1,
        itemDetails: { itemId: 'sword-001', itemName: 'Iron Sword' },
      };

      rewardsService.isRewardGranted.mockResolvedValue(false);
      rewardsService.grantReward.mockResolvedValue({
        id: 'reward-002',
        playerId: achievementEvent.playerId,
      } as any);
      inventoryService.addToInventory.mockResolvedValue(undefined);

      await service.handleAchievementUnlocked(achievementEvent);

      expect(inventoryService.addToInventory).toHaveBeenCalledWith(
        achievementEvent.playerId,
        'ITEM',
        1,
        achievementEvent.itemDetails,
      );
    });

    it('should prevent duplicate reward grant (idempotency)', async () => {
      const achievementEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        achievementId: 'achievement-001',
        rewardType: 'COINS',
        rewardValue: 500,
      };

      rewardsService.isRewardGranted.mockResolvedValue(true);

      await service.handleAchievementUnlocked(achievementEvent);

      expect(rewardsService.grantReward).not.toHaveBeenCalled();
      expect(inventoryService.addToInventory).not.toHaveBeenCalled();
    });

    it('should handle reward not available error', async () => {
      const achievementEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        achievementId: 'achievement-003',
        rewardType: 'UNAVAILABLE_REWARD',
        rewardValue: 0,
      };

      rewardsService.isRewardGranted.mockResolvedValue(false);
      rewardsService.grantReward.mockRejectedValue(new Error('Reward type not supported'));

      await expect(service.handleAchievementUnlocked(achievementEvent)).rejects.toThrow(
        'Reward type not supported',
      );
      expect(inventoryService.addToInventory).not.toHaveBeenCalled();
    });

    it('should handle database transaction failure during reward grant', async () => {
      const achievementEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        achievementId: 'achievement-001',
        rewardType: 'COINS',
        rewardValue: 500,
      };

      rewardsService.isRewardGranted.mockResolvedValue(false);
      rewardsService.grantReward.mockRejectedValue(new Error('Database transaction failed'));

      await expect(service.handleAchievementUnlocked(achievementEvent)).rejects.toThrow(
        'Database transaction failed',
      );
    });

    it('should handle desynchronization with Achievement Service', async () => {
      const invalidEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        achievementId: null,
        rewardType: 'COINS',
        rewardValue: 500,
      };

      await expect(service.handleAchievementUnlocked(invalidEvent as any)).rejects.toThrow();
    });

    it('should rollback inventory update on failure', async () => {
      const achievementEvent = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        achievementId: 'achievement-001',
        rewardType: 'COINS',
        rewardValue: 500,
      };

      rewardsService.isRewardGranted.mockResolvedValue(false);
      rewardsService.grantReward.mockResolvedValue({ id: 'reward-001' } as any);
      inventoryService.addToInventory.mockRejectedValue(new Error('Inventory update failed'));

      await expect(service.handleAchievementUnlocked(achievementEvent)).rejects.toThrow(
        'Inventory update failed',
      );
    });
  });
});
