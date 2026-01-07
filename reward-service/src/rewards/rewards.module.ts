// Rewards Module - Gestión de recompensas otorgadas
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsController } from './controllers/rewards.controller';
import { RewardsService } from './services/rewards.service';
import { Reward } from './entities/reward.entity';
import { RewardsRepository } from './repositories/rewards.repository';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reward]), InventoryModule],
  controllers: [RewardsController],
  providers: [RewardsService, RewardsRepository],
  exports: [RewardsService],
})
export class RewardsModule {}
