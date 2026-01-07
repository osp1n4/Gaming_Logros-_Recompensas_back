import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../../../src/events/services/events.service';
import { EventsRepository } from '../../../src/events/repositories/events.repository';
import { RabbitMQService } from '../../../src/rabbitmq/services/rabbitmq.service';
import { PlayersService } from '../../../src/players/services/players.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('EventsService - Proxy Pattern (TDD - RED Phase)', () => {
  let service: EventsService;
  let eventsRepository: jest.Mocked<EventsRepository>;
  let rabbitmqService: jest.Mocked<RabbitMQService>;
  let playersService: jest.Mocked<PlayersService>;

  const mockEventsRepository = {
    create: jest.fn(),
    findByPlayerId: jest.fn(),
  };

  const mockRabbitMQService = {
    publishEvent: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  };

  const mockPlayersService = {
    getPlayerById: jest.fn(),
    updatePlayerStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EventsRepository,
          useValue: mockEventsRepository,
        },
        {
          provide: RabbitMQService,
          useValue: mockRabbitMQService,
        },
        {
          provide: PlayersService,
          useValue: mockPlayersService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventsRepository = module.get(EventsRepository);
    rabbitmqService = module.get(RabbitMQService);
    playersService = module.get(PlayersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processGameEvent - Proxy Validation', () => {
    const validPlayerId = '123e4567-e89b-12d3-a456-426614174000';

    it('should validate and publish monster_killed event successfully', async () => {
      const eventDto = {
        playerId: validPlayerId,
        eventType: 'monster_killed',
        eventData: { monsterType: 'dragon', count: 1 },
      };

      const mockPlayer = { id: validPlayerId, username: 'testuser' };
      playersService.getPlayerById.mockResolvedValue(mockPlayer as any);
      eventsRepository.create.mockResolvedValue({ id: 'event-123', ...eventDto } as any);
      rabbitmqService.publishEvent.mockResolvedValue(undefined);

      const result = await service.processGameEvent(eventDto);

      expect(result).toBeDefined();
      expect(playersService.getPlayerById).toHaveBeenCalledWith(validPlayerId);
      expect(eventsRepository.create).toHaveBeenCalled();
      expect(rabbitmqService.publishEvent).toHaveBeenCalledWith('player.events', expect.any(Object));
    });

    it('should validate and publish time_played event successfully', async () => {
      const eventDto = {
        playerId: validPlayerId,
        eventType: 'time_played',
        eventData: { minutes: 60 },
      };

      const mockPlayer = { id: validPlayerId, username: 'testuser' };
      playersService.getPlayerById.mockResolvedValue(mockPlayer as any);
      eventsRepository.create.mockResolvedValue({ id: 'event-456', ...eventDto } as any);
      rabbitmqService.publishEvent.mockResolvedValue(undefined);

      const result = await service.processGameEvent(eventDto);

      expect(result).toBeDefined();
      expect(rabbitmqService.publishEvent).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent player ID', async () => {
      const eventDto = {
        playerId: 'non-existent-id',
        eventType: 'monster_killed',
        eventData: { count: 1 },
      };

      playersService.getPlayerById.mockRejectedValue(new NotFoundException());

      await expect(service.processGameEvent(eventDto)).rejects.toThrow(NotFoundException);
      expect(rabbitmqService.publishEvent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for negative monster count', async () => {
      const eventDto = {
        playerId: validPlayerId,
        eventType: 'monster_killed',
        eventData: { count: -5 },
      };

      await expect(service.processGameEvent(eventDto)).rejects.toThrow(BadRequestException);
      expect(rabbitmqService.publishEvent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for negative time played', async () => {
      const eventDto = {
        playerId: validPlayerId,
        eventType: 'time_played',
        eventData: { minutes: -30 },
      };

      await expect(service.processGameEvent(eventDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for undefined event type', async () => {
      const eventDto = {
        playerId: validPlayerId,
        eventType: undefined,
        eventData: { count: 1 },
      };

      await expect(service.processGameEvent(eventDto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty event type', async () => {
      const eventDto = {
        playerId: validPlayerId,
        eventType: '',
        eventData: { count: 1 },
      };

      await expect(service.processGameEvent(eventDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null eventData', async () => {
      const eventDto = {
        playerId: validPlayerId,
        eventType: 'monster_killed',
        eventData: null,
      };

      await expect(service.processGameEvent(eventDto as any)).rejects.toThrow(BadRequestException);
    });

    it('should handle RabbitMQ connection failure gracefully', async () => {
      const eventDto = {
        playerId: validPlayerId,
        eventType: 'monster_killed',
        eventData: { count: 1 },
      };

      const mockPlayer = { id: validPlayerId, username: 'testuser' };
      playersService.getPlayerById.mockResolvedValue(mockPlayer as any);
      eventsRepository.create.mockResolvedValue({ id: 'event-789', ...eventDto } as any);
      rabbitmqService.publishEvent.mockRejectedValue(new Error('RabbitMQ connection failed'));

      await expect(service.processGameEvent(eventDto)).rejects.toThrow('RabbitMQ connection failed');
    });

    it('should reject event with unsupported event type', async () => {
      const eventDto = {
        playerId: validPlayerId,
        eventType: 'unsupported_event',
        eventData: { data: 'test' },
      };

      await expect(service.processGameEvent(eventDto)).rejects.toThrow(BadRequestException);
    });
  });
});
