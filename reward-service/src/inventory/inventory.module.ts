// Inventory Module - Inventario de jugadores
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService } from './services/inventory.service';
import { PlayerInventory } from './entities/player-inventory.entity';
import { InventoryRepository } from './repositories/inventory.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerInventory])],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository],
  exports: [InventoryService],
})
export class InventoryModule {}
