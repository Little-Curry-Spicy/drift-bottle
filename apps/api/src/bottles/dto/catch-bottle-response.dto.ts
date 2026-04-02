import { ApiProperty } from '@nestjs/swagger';
import { BottleResponseDto } from './bottle-response.dto';

/** GET /bottles/catch 统一成功结构（HTTP 200）；无可捞时为 bottle: null */
export class CatchBottleResponseDto {
  @ApiProperty({
    type: BottleResponseDto,
    nullable: true,
    description: '捞到的瓶子；海里没有他人瓶子时为 null',
  })
  bottle: BottleResponseDto | null;
}
