import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';

@Injectable()
export class InventoryRepository {
  constructor(
    @InjectRepository(Inventory)
    private readonly repository: Repository<Inventory>,
  ) {}

  async findByPlayerId(playerId: string): Promise<Inventory | null> {
    return this.repository.findOne({ where: { playerId } });
  }

  async create(inventory: Partial<Inventory>): Promise<Inventory> {
    const newInventory = this.repository.create(inventory);
    return this.repository.save(newInventory);
  }

  async update(id: string, data: Partial<Inventory>): Promise<Inventory> {
    await this.repository.update(id, data);
    return this.repository.findOne({ where: { id } });
  }
}
