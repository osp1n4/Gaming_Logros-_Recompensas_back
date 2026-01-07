// Players Repository - Acceso a datos de jugadores
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../entities/player.entity';
import { CreatePlayerDto } from '../dto/create-player.dto';
import { UpdatePlayerDto } from '../dto/update-player.dto';

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player)
    private readonly repository: Repository<Player>,
  ) {}

  async findById(id: string): Promise<Player | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<Player | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<Player | null> {
    return this.repository.findOne({ where: { email } });
  }

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const player = this.repository.create(createPlayerDto);
    return this.repository.save(player);
  }

  async update(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    await this.repository.update(id, updatePlayerDto);
    return this.findById(id);
  }
}
