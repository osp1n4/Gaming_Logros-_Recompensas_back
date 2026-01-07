import { Injectable, BadRequestException } from '@nestjs/common';
import { PlayerAchievementsService } from '../../player-achievements/services/player-achievements.service';
import { AchievementsService } from '../../achievements/services/achievements.service';
import { RabbitMQService } from '../../rabbitmq/services/rabbitmq.service';

interface PlayerEvent {
  playerId: string;
  eventType: string;
  eventData: any;
  timestamp?: Date;
}

@Injectable()
export class EventListenerService {
  constructor(
    private readonly playerAchievementsService: PlayerAchievementsService,
    private readonly achievementsService: AchievementsService,
    private readonly rabbitmqService: RabbitMQService,
  ) {}

  async handlePlayerEvent(playerEvent: PlayerEvent): Promise<void> {
    // Validate event data
    if (!playerEvent?.playerId || !playerEvent?.eventType) {
      throw new BadRequestException('Invalid event data: missing playerId or eventType');
    }

    if (playerEvent.eventData === undefined || playerEvent.eventData === null) {
      throw new BadRequestException('Invalid event data: eventData is required');
    }

    // Map event types to rule types
    const ruleTypeMap: Record<string, string> = {
      monster_killed: 'MONSTER_KILL_COUNT',
      time_played: 'PLAYTIME',
    };

    const ruleType = ruleTypeMap[playerEvent.eventType];

    // If no matching rule type, skip processing
    if (!ruleType) {
      return;
    }

    // Find achievements matching this rule type
    const achievements = await this.achievementsService.findByRuleType(ruleType);

    if (!achievements || achievements.length === 0) {
      return;
    }

    // Process each achievement
    for (const achievement of achievements) {
      // Check if already unlocked
      const isUnlocked = await this.playerAchievementsService.isAchievementUnlocked(
        playerEvent.playerId,
        achievement.id,
      );

      if (isUnlocked) {
        continue; // Skip already unlocked achievements
      }

      // Evaluate achievement
      const result = await this.playerAchievementsService.evaluateAchievements(
        playerEvent.playerId,
        achievement,
        playerEvent.eventData,
      );

      // Publish event based on result
      if (result.unlocked) {
        await this.rabbitmqService.publishEvent('achievement.events', {
          routingKey: 'achievement.unlocked',
          data: {
            achievementId: achievement.id,
            playerId: playerEvent.playerId,
            unlockedAt: result.unlockedAt,
            rewardType: achievement.rewardType,
            rewardValue: achievement.rewardValue,
          },
        });
      } else {
        await this.rabbitmqService.publishEvent('achievement.events', {
          routingKey: 'achievement.progress',
          data: {
            achievementId: achievement.id,
            playerId: playerEvent.playerId,
            progress: result.progress,
          },
        });
      }
    }
  }
}
