// Event Listener Module - Escucha eventos de RabbitMQ (Patrón Observer)
import { Module } from '@nestjs/common';
import { EventListenerService } from './services/event-listener.service';
import { PlayerAchievementsModule } from '../player-achievements/player-achievements.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [PlayerAchievementsModule, AchievementsModule],
  providers: [EventListenerService],
})
export class EventListenerModule {}
