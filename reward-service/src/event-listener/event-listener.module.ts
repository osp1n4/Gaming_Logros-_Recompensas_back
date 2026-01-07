// Event Listener Module - Escucha logros desbloqueados (Patrón Observer)
import { Module } from '@nestjs/common';
import { EventListenerService } from './services/event-listener.service';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [RewardsModule],
  providers: [EventListenerService],
})
export class EventListenerModule {}
