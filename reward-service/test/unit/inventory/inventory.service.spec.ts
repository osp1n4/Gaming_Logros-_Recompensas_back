import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from '../../../src/inventory/services/inventory.service';
import { InventoryRepository } from '../../../src/inventory/repositories/inventory.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InventoryService (TDD - RED Phase)', () => {
  let service: InventoryService;
  let repository: jest.Mocked<InventoryRepository>;

  const mockRepository = {
    findByPlayerId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: InventoryRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    repository = module.get(InventoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToInventory', () => {
    it('should add coins to player inventory', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const existingInventory = {
        id: 'inventory-001',
        playerId,
        coins: 100,
        xp: 0,
        items: [],
      };

      repository.findByPlayerId.mockResolvedValue(existingInventory as any);
      repository.update.mockResolvedValue({
        ...existingInventory,
        coins: 600,
      } as any);

      await service.addToInventory(playerId, 'COINS', 500);

      expect(repository.update).toHaveBeenCalledWith(
        'inventory-001',
        expect.objectContaining({ coins: 600 }),
      );
    });

    it('should add XP to player inventory', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const existingInventory = {
        id: 'inventory-001',
        playerId,
        coins: 0,
        xp: 1000,
        items: [],
      };

      repository.findByPlayerId.mockResolvedValue(existingInventory as any);
      repository.update.mockResolvedValue({
        ...existingInventory,
        xp: 1500,
      } as any);

      await service.addToInventory(playerId, 'XP', 500);

      expect(repository.update).toHaveBeenCalledWith(
        'inventory-001',
        expect.objectContaining({ xp: 1500 }),
      );
    });

    it('should add item to player inventory', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const existingInventory = {
        id: 'inventory-001',
        playerId,
        coins: 0,
        xp: 0,
        items: [],
      };

      const itemDetails = { itemId: 'sword-001', itemName: 'Iron Sword' };

      repository.findByPlayerId.mockResolvedValue(existingInventory as any);
      repository.update.mockResolvedValue({
        ...existingInventory,
        items: [itemDetails],
      } as any);

      await service.addToInventory(playerId, 'ITEM', 1, itemDetails);

      expect(repository.update).toHaveBeenCalledWith(
        'inventory-001',
        expect.objectContaining({
          items: expect.arrayContaining([itemDetails]),
        }),
      );
    });

    it('should throw NotFoundException if player inventory does not exist', async () => {
      const playerId = 'non-existent-player';

      repository.findByPlayerId.mockResolvedValue(null);

      await expect(service.addToInventory(playerId, 'COINS', 100)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for negative values', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(service.addToInventory(playerId, 'COINS', -100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle database update failure', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';

      repository.findByPlayerId.mockResolvedValue({
        id: 'inventory-001',
        playerId,
      } as any);
      repository.update.mockRejectedValue(new Error('Database update failed'));

      await expect(service.addToInventory(playerId, 'COINS', 100)).rejects.toThrow(
        'Database update failed',
      );
    });
  });

  describe('getPlayerInventory', () => {
    it('should return player inventory', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const inventory = {
        id: 'inventory-001',
        playerId,
        coins: 500,
        xp: 1000,
        items: [],
      };

      repository.findByPlayerId.mockResolvedValue(inventory as any);

      const result = await service.getPlayerInventory(playerId);

      expect(result).toEqual(inventory);
    });

    it('should throw NotFoundException if inventory does not exist', async () => {
      const playerId = 'non-existent-player';

      repository.findByPlayerId.mockResolvedValue(null);

      await expect(service.getPlayerInventory(playerId)).rejects.toThrow(NotFoundException);
    });
  });
});
