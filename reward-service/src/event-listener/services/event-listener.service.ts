import { Injectable, BadRequestException } from '@nestjs/common';
import { RewardsService } from '../../rewards/services/rewards.service';
import { InventoryService } from '../../inventory/services/inventory.service';

interface AchievementEvent {
  playerId: string;
  achievementId: string;
  rewardType: string;
  rewardValue: number;
  itemDetails?: any;
}

@Injectable()
export class EventListenerService {
  constructor(
    private readonly rewardsService: RewardsService,
    private readonly inventoryService: InventoryService,
  ) {}

  async handleAchievementUnlocked(achievementEvent: AchievementEvent): Promise<void> {
    // Validate event data
    if (!achievementEvent?.playerId || !achievementEvent?.achievementId) {
      throw new BadRequestException('Invalid achievement event: missing required fields');
    }

    // Check if reward already granted (idempotency)
    const isGranted = await this.rewardsService.isRewardGranted(
      achievementEvent.playerId,
      achievementEvent.achievementId,
    );

    if (isGranted) {
      // Already granted, skip (idempotent behavior)
      return;
    }

    // Grant reward
    await this.rewardsService.grantReward({
      playerId: achievementEvent.playerId,
      achievementId: achievementEvent.achievementId,
      rewardType: achievementEvent.rewardType,
      rewardValue: achievementEvent.rewardValue,
      itemDetails: achievementEvent.itemDetails,
    });

    // Update inventory
    await this.inventoryService.addToInventory(
      achievementEvent.playerId,
      achievementEvent.rewardType,
      achievementEvent.rewardValue,
      achievementEvent.itemDetails,
    );
  }
}
