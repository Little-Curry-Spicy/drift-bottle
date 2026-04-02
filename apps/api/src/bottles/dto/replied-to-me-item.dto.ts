import { ApiProperty } from '@nestjs/swagger';

/** 他人对我瓶子的一条回复 */
export class IncomingReplyLineDto {
  @ApiProperty()
  content: string;

  @ApiProperty({ description: '回复者匿名代号（如 海友 · xxxx）' })
  authorMask: string;

  @ApiProperty({ description: '回复时间 ISO' })
  createdAt: string;
}

/** 收到他人回复的我方瓶子摘要 */
export class RepliedToMeItemDto {
  @ApiProperty()
  bottleId: string;

  @ApiProperty()
  bottleContent: string;

  @ApiProperty()
  bottleCreatedAt: string;

  @ApiProperty({ type: [IncomingReplyLineDto], description: '他人回复，时间升序' })
  incomingReplies: IncomingReplyLineDto[];

  @ApiProperty({ type: [String], description: '我在该瓶子下发出的回复（时间升序）' })
  myReplyContents: string[];

  @ApiProperty({ description: '最后一条他人回复时间 ISO' })
  lastReplyAt: string;
}
