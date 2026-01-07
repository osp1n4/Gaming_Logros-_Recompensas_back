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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../entities/player.entity';

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async findById(id: string): Promise<Player | null> {
    return await this.playerRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<Player | null> {
    return await this.playerRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<Player | null> {
    return await this.playerRepository.findOne({ where: { email } });
  }

  async create(playerData: any): Promise<Player> {
    const player = this.playerRepository.create(playerData);
    return await this.playerRepository.save(player);
  }

  async update(id: string, playerData: any): Promise<Player> {
    await this.playerRepository.update(id, playerData);
    return await this.findById(id);
  }
}
