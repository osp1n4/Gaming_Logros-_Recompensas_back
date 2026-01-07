// Achievements Module - Gestión de definiciones de logros
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsController } from './controllers/achievements.controller';
import { AchievementsService } from './services/achievements.service';
import { Achievement } from './entities/achievement.entity';
import { AchievementsRepository } from './repositories/achievements.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement])],
  controllers: [AchievementsController],
  providers: [AchievementsService, AchievementsRepository],
  exports: [AchievementsService],
})
export class AchievementsModule {}
