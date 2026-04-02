import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBottleDto {
  @ApiProperty({ maxLength: 200, example: 'Hello from the sea' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  content: string;
}
