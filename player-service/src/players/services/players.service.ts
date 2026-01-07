// Players Service - Lógica de negocio para jugadores
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PlayersRepository } from '../repositories/players.repository';
import { CreatePlayerDto } from '../dto/create-player.dto';
import { UpdatePlayerDto } from '../dto/update-player.dto';
import { Player } from '../entities/player.entity';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class PlayersService {
  constructor(private readonly playersRepository: PlayersRepository) {}

  async createPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
    // Validate username not empty
    if (!createPlayerDto.username || createPlayerDto.username.trim() === '') {
      throw new BadRequestException('Username cannot be empty');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createPlayerDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Check if username already exists
    const existingUserByUsername = await this.playersRepository.findByUsername(
      createPlayerDto.username,
    );
    if (existingUserByUsername) {
      throw new BadRequestException('Username already exists');
    }

    // Check if email already exists
    const existingUserByEmail = await this.playersRepository.findByEmail(createPlayerDto.email);
    if (existingUserByEmail) {
      throw new BadRequestException('Email already exists');
    }

    return this.playersRepository.create(createPlayerDto);
  }

  async getPlayerById(playerId: string): Promise<Player> {
    if (!playerId) {
      throw new BadRequestException('Player ID is required');
    }

    if (!uuidValidate(playerId)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const player = await this.playersRepository.findById(playerId);
    if (!player) {
      throw new NotFoundException(`Player with ID ${playerId} not found`);
    }

    return player;
  }

  async updatePlayerStats(playerId: string, stats: Record<string, any>): Promise<Player> {
    // Validate stats values are not negative
    for (const key in stats) {
      if (typeof stats[key] === 'number' && stats[key] < 0) {
        throw new BadRequestException('Stat values cannot be negative');
      }
    }

    const player = await this.getPlayerById(playerId);

    const updatedStats = { ...player.stats, ...stats };

    return this.playersRepository.update(playerId, { stats: updatedStats });
  }
}
