import { Test, TestingModule } from '@nestjs/testing';
import { RewardsService } from '../../../src/rewards/services/rewards.service';
import { RewardsRepository } from '../../../src/rewards/repositories/rewards.repository';
import { InventoryService } from '../../../src/inventory/services/inventory.service';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('RewardsService - Idempotency (TDD - RED Phase)', () => {
  let service: RewardsService;
  let repository: jest.Mocked<RewardsRepository>;
  let inventoryService: jest.Mocked<InventoryService>;

  const mockRepository = {
    findByIdempotencyKey: jest.fn(),
    create: jest.fn(),
    findByPlayerId: jest.fn(),
  };

  const mockInventoryService = {
    addToInventory: jest.fn(),
    updateInventory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardsService,
        {
          provide: RewardsRepository,
          useValue: mockRepository,
        },
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
    repository = module.get(RewardsRepository);
    inventoryService = module.get(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('grantReward - Idempotency', () => {
    it('should grant reward with unique idempotency key', async () => {
      const rewardData = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        achievementId: 'achievement-001',
        rewardType: 'COINS',
        rewardValue: 500,
      };

      const idempotencyKey = `${rewardData.playerId}-${rewardData.achievementId}`;

      repository.findByIdempotencyKey.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        id: 'reward-001',
        ...rewardData,
        idempotencyKey,
      } as any);
      inventoryService.addToInventory.mockResolvedValue(undefined);

      const result = await service.grantReward(rewardData);

      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ idempotencyKey }),
      );
    });

    it('should reject duplicate reward with same idempotency key', async () => {
      const rewardData = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        achievementId: 'achievement-001',
        rewardType: 'COINS',
        rewardValue: 500,
      };

      const idempotencyKey = `${rewardData.playerId}-${rewardData.achievementId}`;

      repository.findByIdempotencyKey.mockResolvedValue({
        id: 'reward-001',
        idempotencyKey,
      } as any);

      await expect(service.grantReward(rewardData)).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should validate reward value is positive', async () => {
      const invalidRewardData = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        achievementId: 'achievement-001',
        rewardType: 'COINS',
        rewardValue: -100,
      };

      await expect(service.grantReward(invalidRewardData)).rejects.toThrow(BadRequestException);
    });

    it('should validate reward type is supported', async () => {
      const invalidRewardData = {
        playerId: '123e4567-e89b-12d3-a456-426614174000',
        achievementId: 'achievement-001',
        rewardType: 'INVALID_TYPE',
        rewardValue: 100,
      };

      await expect(service.grantReward(invalidRewardData as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('isRewardGranted', () => {
    it('should return true if reward already granted', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const achievementId = 'achievement-001';
      const idempotencyKey = `${playerId}-${achievementId}`;

      repository.findByIdempotencyKey.mockResolvedValue({
        id: 'reward-001',
        idempotencyKey,
      } as any);

      const result = await service.isRewardGranted(playerId, achievementId);

      expect(result).toBe(true);
    });

    it('should return false if reward not granted yet', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const achievementId = 'achievement-001';

      repository.findByIdempotencyKey.mockResolvedValue(null);

      const result = await service.isRewardGranted(playerId, achievementId);

      expect(result).toBe(false);
    });
  });
});
