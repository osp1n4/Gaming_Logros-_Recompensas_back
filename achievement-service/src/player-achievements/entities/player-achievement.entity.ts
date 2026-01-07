import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('player_achievements')
export class PlayerAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  playerId: string;

  @Column({ type: 'uuid' })
  achievementId: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'boolean', default: false })
  unlocked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  unlockedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
