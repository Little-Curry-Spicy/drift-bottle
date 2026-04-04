import { ApiProperty } from '@nestjs/swagger';

/** 我回复过「他人」的漂流瓶摘要（瓶主不以明文 id 暴露，仅展示代号） */
export class RepliedOutItemDto {
  @ApiProperty()
  bottleId: string;

  @ApiProperty({ description: '瓶子原文' })
  bottleContent: string;

  @ApiProperty({ description: '瓶子创建时间 ISO' })
  bottleCreatedAt: string;

  @ApiProperty({ description: '瓶主匿名代号（如 海友 · xxxx）' })
  bottleAuthorMask: string;

  @ApiProperty({
    type: [String],
    description: '我在该瓶下发出的回复（时间升序）',
  })
  myReplyContents: string[];

  @ApiProperty({ description: '我最后一次在该瓶下回复的时间 ISO' })
  lastRepliedAt: string;
}
