import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerAchievement } from '../entities/player-achievement.entity';

@Injectable()
export class PlayerAchievementsRepository {
  constructor(
    @InjectRepository(PlayerAchievement)
    private readonly repository: Repository<PlayerAchievement>,
  ) {}

  async findByPlayerAndAchievement(
    playerId: string,
    achievementId: string,
  ): Promise<PlayerAchievement | null> {
    return this.repository.findOne({ where: { playerId, achievementId } });
  }

  async findByPlayerId(playerId: string): Promise<PlayerAchievement[]> {
    return this.repository.find({ where: { playerId } });
  }

  async create(playerAchievement: Partial<PlayerAchievement>): Promise<PlayerAchievement> {
    const newPlayerAchievement = this.repository.create(playerAchievement);
    return this.repository.save(newPlayerAchievement);
  }

  async update(id: string, data: Partial<PlayerAchievement>): Promise<PlayerAchievement> {
    await this.repository.update(id, data);
    return this.repository.findOne({ where: { id } });
  }
}
