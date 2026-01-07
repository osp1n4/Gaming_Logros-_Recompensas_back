import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersController } from './controllers/players.controller';
import { PlayersService } from './services/players.service';
import { Player } from './entities/player.entity';
import { PlayersRepository } from './repositories/players.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  controllers: [PlayersController],
  providers: [PlayersService, PlayersRepository],
  exports: [PlayersService],
})
export class PlayersModule {}
