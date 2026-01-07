import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PlayerAchievementsRepository } from '../repositories/player-achievements.repository';
import { RabbitMQService } from '../../rabbitmq/services/rabbitmq.service';
import { Achievement } from '../../achievements/entities/achievement.entity';
import { PlayerAchievement } from '../entities/player-achievement.entity';

@Injectable()
export class PlayerAchievementsService {
  constructor(
    private readonly repository: PlayerAchievementsRepository,
    private readonly rabbitmqService: RabbitMQService,
  ) {}

  async evaluateAchievements(
    playerId: string,
    achievement: Achievement,
    eventData: any,
  ): Promise<PlayerAchievement> {
    if (!playerId || !achievement?.id) {
      throw new BadRequestException('Invalid player or achievement data');
    }

    // Check if player achievement record exists
    let playerAchievement = await this.repository.findByPlayerAndAchievement(
      playerId,
      achievement.id,
    );

    // Prevent duplicate unlock
    if (playerAchievement?.unlocked) {
      throw new ConflictException('Achievement already unlocked');
    }

    // Create initial record if it doesn't exist
    if (!playerAchievement) {
      playerAchievement = await this.repository.create({
        playerId,
        achievementId: achievement.id,
        progress: 0,
        unlocked: false,
      });
    }

    // Calculate progress based on event data
    let newProgress = playerAchievement.progress;

    if (achievement.ruleType === 'MONSTER_KILL_COUNT') {
      newProgress = eventData.count || 0;
    } else if (achievement.ruleType === 'PLAYTIME') {
      newProgress = eventData.minutes || 0;
    }

    // Check if target is reached
    const target = achievement.ruleConfig?.target || 0;
    const unlocked = newProgress >= target;

    // Update player achievement
    const updatedAchievement = await this.repository.update(playerAchievement.id, {
      progress: newProgress,
      unlocked,
      unlockedAt: unlocked ? new Date() : null,
    });

    return updatedAchievement;
  }

  async isAchievementUnlocked(playerId: string, achievementId: string): Promise<boolean> {
    const playerAchievement = await this.repository.findByPlayerAndAchievement(
      playerId,
      achievementId,
    );

    return playerAchievement?.unlocked || false;
  }

  async getPlayerProgress(playerId: string, achievementId: string): Promise<PlayerAchievement | null> {
    return this.repository.findByPlayerAndAchievement(playerId, achievementId);
  }
}
