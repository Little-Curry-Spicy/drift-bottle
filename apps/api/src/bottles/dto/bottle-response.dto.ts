import { ApiProperty } from '@nestjs/swagger';

export class BottleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: ['me', 'stranger'] })
  author: 'me' | 'stranger';

  @ApiProperty({ type: [String], description: '回复正文列表（按时间升序）' })
  replies: string[];

  @ApiProperty({ description: 'ISO 8601' })
  createdAt: string;
}
