import { Injectable } from '@nestjs/common';
import { AchievementsRepository } from '../repositories/achievements.repository';
import { Achievement } from '../entities/achievement.entity';

@Injectable()
export class AchievementsService {
  constructor(private readonly repository: AchievementsRepository) {}

  async findAll(): Promise<Achievement[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Achievement | null> {
    return this.repository.findById(id);
  }

  async findByRuleType(ruleType: string): Promise<Achievement[]> {
    return this.repository.findByRuleType(ruleType);
  }
}
