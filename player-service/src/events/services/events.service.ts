// Events Service - Lógica de negocio para eventos
import { Injectable, BadRequestException } from '@nestjs/common';
import { EventsRepository } from '../repositories/events.repository';
import { RabbitMQService } from '../../rabbitmq/services/rabbitmq.service';
import { PlayersService } from '../../players/services/players.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { GameEvent } from '../entities/game-event.entity';

@Injectable()
export class EventsService {
  private readonly SUPPORTED_EVENT_TYPES = ['monster_killed', 'time_played', 'level_up'];

  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly rabbitmqService: RabbitMQService,
    private readonly playersService: PlayersService,
  ) {}

  async processGameEvent(createEventDto: CreateEventDto): Promise<GameEvent> {
    // Validate event type
    if (!createEventDto.eventType || createEventDto.eventType.trim() === '') {
      throw new BadRequestException('Event type is required');
    }

    // Validate event data
    if (!createEventDto.eventData || typeof createEventDto.eventData !== 'object') {
      throw new BadRequestException('Event data is required and must be an object');
    }

    // Validate event type is supported
    if (!this.SUPPORTED_EVENT_TYPES.includes(createEventDto.eventType)) {
      throw new BadRequestException(
        `Event type ${createEventDto.eventType} is not supported`,
      );
    }

    // Validate event-specific data
    await this.validateEventData(createEventDto);

    // Verify player exists (Proxy pattern - validates before forwarding)
    await this.playersService.getPlayerById(createEventDto.playerId);

    // Save event to database
    const savedEvent = await this.eventsRepository.create(createEventDto);

    // Publish event to RabbitMQ
    const exchange = process.env.RABBITMQ_EXCHANGE || 'player.events';
    await this.rabbitmqService.publishEvent(exchange, {
      playerId: savedEvent.playerId,
      eventType: savedEvent.eventType,
      eventData: savedEvent.eventData,
      timestamp: savedEvent.timestamp,
    });

    return savedEvent;
  }

  private async validateEventData(createEventDto: CreateEventDto): Promise<void> {
    const { eventType, eventData } = createEventDto;

    switch (eventType) {
      case 'monster_killed':
        if (eventData.count !== undefined && eventData.count < 0) {
          throw new BadRequestException('Monster count cannot be negative');
        }
        break;

      case 'time_played':
        if (eventData.minutes !== undefined && eventData.minutes < 0) {
          throw new BadRequestException('Time played cannot be negative');
        }
        break;

      default:
        break;
    }
  }
}

}