import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  playerId: string;

  @Column({ type: 'int', default: 0 })
  coins: number;

  @Column({ type: 'int', default: 0 })
  xp: number;

  @Column({ type: 'jsonb', default: [] })
  items: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
