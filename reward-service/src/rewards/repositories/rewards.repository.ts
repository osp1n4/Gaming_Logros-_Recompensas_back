import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from '../entities/reward.entity';

@Injectable()
export class RewardsRepository {
  constructor(
    @InjectRepository(Reward)
    private readonly repository: Repository<Reward>,
  ) {}

  async findByIdempotencyKey(idempotencyKey: string): Promise<Reward | null> {
    return this.repository.findOne({ where: { idempotencyKey } });
  }

  async findByPlayerId(playerId: string): Promise<Reward[]> {
    return this.repository.find({ where: { playerId } });
  }

  async create(reward: Partial<Reward>): Promise<Reward> {
    const newReward = this.repository.create(reward);
    return this.repository.save(newReward);
  }
}
