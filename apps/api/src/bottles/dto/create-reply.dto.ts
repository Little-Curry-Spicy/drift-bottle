import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateReplyDto {
  @ApiProperty({ maxLength: 1000, example: 'Same here!' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;
}
