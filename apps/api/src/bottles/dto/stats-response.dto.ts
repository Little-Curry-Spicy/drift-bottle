import { ApiProperty } from '@nestjs/swagger';

/** 与前端 `useDriftBottleMvp` 中 stats 对齐 */
export class StatsResponseDto {
  @ApiProperty({ description: '我扔出的瓶子数' })
  thrown: number;

  @ApiProperty({ description: '收藏数' })
  favorite: number;

  @ApiProperty({ description: '我发出的回复条数' })
  replied: number;
}
