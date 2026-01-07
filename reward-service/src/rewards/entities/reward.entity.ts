import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  playerId: string;

  @Column({ type: 'uuid' })
  achievementId: string;

  @Column({ type: 'varchar', length: 50 })
  rewardType: string; // 'COINS', 'XP', 'ITEM'

  @Column({ type: 'int' })
  rewardValue: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  idempotencyKey: string;

  @Column({ type: 'jsonb', nullable: true })
  itemDetails: Record<string, any>;

  @CreateDateColumn()
  grantedAt: Date;
}
