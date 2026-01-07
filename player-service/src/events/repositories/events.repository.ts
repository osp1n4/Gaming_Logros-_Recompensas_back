// Events Repository - Acceso a datos de eventos
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEvent } from '../entities/game-event.entity';
import { CreateEventDto } from '../dto/create-event.dto';

@Injectable()
export class EventsRepository {
  constructor(
    @InjectRepository(GameEvent)
    private readonly repository: Repository<GameEvent>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<GameEvent> {
    const event = this.repository.create(createEventDto);
    return this.repository.save(event);
  }

  async findByPlayerId(playerId: string): Promise<GameEvent[]> {
    return this.repository.find({
      where: { playerId },
      order: { timestamp: 'DESC' },
    });
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEvent } from '../entities/game-event.entity';

@Injectable()
export class EventsRepository {
  constructor(
    @InjectRepository(GameEvent)
    private readonly eventRepository: Repository<GameEvent>,
  ) {}

  async create(eventData: any): Promise<GameEvent> {
    const event = this.eventRepository.create(eventData);
    return await this.eventRepository.save(event);
  }

  async findByPlayerId(playerId: string): Promise<GameEvent[]> {
    return await this.eventRepository.find({ where: { playerId } });
  }
}
