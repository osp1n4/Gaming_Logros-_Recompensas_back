// Player Achievements Module - Progreso de logros por jugador
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerAchievementsController } from './controllers/player-achievements.controller';
import { PlayerAchievementsService } from './services/player-achievements.service';
import { PlayerAchievement } from './entities/player-achievement.entity';
import { PlayerAchievementsRepository } from './repositories/player-achievements.repository';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerAchievement]), RabbitMQModule],
  controllers: [PlayerAchievementsController],
  providers: [PlayerAchievementsService, PlayerAchievementsRepository],
  exports: [PlayerAchievementsService],
})
export class PlayerAchievementsModule {}
