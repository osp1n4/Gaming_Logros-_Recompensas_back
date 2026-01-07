// CreateEventDto - DTO para crear evento
import { IsString, IsUUID, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  playerId: string;

  @ApiProperty({ example: 'monster_killed' })
  @IsString()
  @IsNotEmpty()
  eventType: string;

  @ApiProperty({ example: { monsterType: 'dragon', count: 1 } })
  @IsObject()
  @IsNotEmpty()
  eventData: Record<string, any>;
}
