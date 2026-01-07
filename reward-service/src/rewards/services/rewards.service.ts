import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { RewardsRepository } from '../repositories/rewards.repository';
import { InventoryService } from '../../inventory/services/inventory.service';
import { Reward } from '../entities/reward.entity';

@Injectable()
export class RewardsService {
  private readonly SUPPORTED_REWARD_TYPES = ['COINS', 'XP', 'ITEM'];

  constructor(
    private readonly repository: RewardsRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async grantReward(rewardData: {
    playerId: string;
    achievementId: string;
    rewardType: string;
    rewardValue: number;
    itemDetails?: any;
  }): Promise<Reward> {
    // Validate reward value is positive
    if (rewardData.rewardValue < 0) {
      throw new BadRequestException('Reward value must be positive');
    }

    // Validate reward type is supported
    if (!this.SUPPORTED_REWARD_TYPES.includes(rewardData.rewardType)) {
      throw new BadRequestException(`Reward type ${rewardData.rewardType} is not supported`);
    }

    // Generate idempotency key
    const idempotencyKey = `${rewardData.playerId}-${rewardData.achievementId}`;

    // Check if reward already granted
    const existingReward = await this.repository.findByIdempotencyKey(idempotencyKey);

    if (existingReward) {
      throw new ConflictException('Reward already granted for this achievement');
    }

    // Create reward record
    const reward = await this.repository.create({
      ...rewardData,
      idempotencyKey,
    });

    return reward;
  }

  async isRewardGranted(playerId: string, achievementId: string): Promise<boolean> {
    const idempotencyKey = `${playerId}-${achievementId}`;
    const reward = await this.repository.findByIdempotencyKey(idempotencyKey);
    return !!reward;
  }
}
