// GameEvent Entity - Modelo de datos de eventos del juego
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from '../../players/entities/player.entity';

@Entity('game_events')
export class GameEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  playerId: string;

  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerId' })
  player: Player;

  @Column({ length: 100 })
  eventType: string;

  @Column({ type: 'jsonb', default: {} })
  eventData: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;
}
