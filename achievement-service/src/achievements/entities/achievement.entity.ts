import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  ruleType: string; // 'MONSTER_KILL_COUNT', 'PLAYTIME', etc.

  @Column({ type: 'jsonb' })
  ruleConfig: Record<string, any>; // { target: 10 }

  @Column({ type: 'varchar', length: 50 })
  rewardType: string; // 'COINS', 'XP', 'ITEM', etc.

  @Column({ type: 'int' })
  rewardValue: number;

  @CreateDateColumn()
  createdAt: Date;
}
