import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';

@Injectable()
export class AchievementsRepository {
  constructor(
    @InjectRepository(Achievement)
    private readonly repository: Repository<Achievement>,
  ) {}

  async findAll(): Promise<Achievement[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<Achievement | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByRuleType(ruleType: string): Promise<Achievement[]> {
    return this.repository.find({ where: { ruleType } });
  }

  async create(achievement: Partial<Achievement>): Promise<Achievement> {
    const newAchievement = this.repository.create(achievement);
    return this.repository.save(newAchievement);
  }
}
