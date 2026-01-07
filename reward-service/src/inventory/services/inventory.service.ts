import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryRepository } from '../repositories/inventory.repository';
import { Inventory } from '../entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}

  async addToInventory(
    playerId: string,
    rewardType: string,
    amount: number,
    itemDetails?: any,
  ): Promise<void> {
    // Validate amount is positive
    if (amount < 0) {
      throw new BadRequestException('Amount must be positive');
    }

    // Get player inventory
    const inventory = await this.repository.findByPlayerId(playerId);

    if (!inventory) {
      throw new NotFoundException('Player inventory not found');
    }

    // Update inventory based on reward type
    if (rewardType === 'COINS') {
      await this.repository.update(inventory.id, {
        coins: inventory.coins + amount,
      });
    } else if (rewardType === 'XP') {
      await this.repository.update(inventory.id, {
        xp: inventory.xp + amount,
      });
    } else if (rewardType === 'ITEM') {
      const updatedItems = [...inventory.items, itemDetails];
      await this.repository.update(inventory.id, {
        items: updatedItems,
      });
    }
  }

  async getPlayerInventory(playerId: string): Promise<Inventory | null> {
    const inventory = await this.repository.findByPlayerId(playerId);
    
    if (!inventory) {
      throw new NotFoundException('Player inventory not found');
    }
    
    return inventory;
  }

  async createInventory(playerId: string): Promise<Inventory> {
    return this.repository.create({
      playerId,
      coins: 0,
      xp: 0,
      items: [],
    });
  }
}
