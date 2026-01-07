// UpdatePlayerDto - DTO para actualizar jugador
import { IsOptional, IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlayerDto {
  @ApiProperty({ example: 'newusername', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  username?: string;

  @ApiProperty({ example: 'newemail@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: { level: 10 }, required: false })
  @IsOptional()
  stats?: Record<string, any>;
}
