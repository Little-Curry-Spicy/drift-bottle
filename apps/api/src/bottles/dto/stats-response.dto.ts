import { ApiProperty } from '@nestjs/swagger';

/** 与前端 `useDriftBottleMvp` 中 stats 对齐 */
export class StatsResponseDto {
  @ApiProperty({ description: '我扔出的瓶子数' })
  thrown: number;

  @ApiProperty({ description: '收藏数' })
  favorite: number;

  @ApiProperty({ description: '我回复过的他人瓶子数量（与详情弹层同口径）' })
  replied: number;

  @ApiProperty({ description: '他人回复我瓶子的瓶子数量（与详情弹层同口径）' })
  receivedReplies: number;
}
