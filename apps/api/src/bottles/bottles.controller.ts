import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Post,
  Sse,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';
import { SkipTransform } from '../common';
import { BottlesRealtimeService } from '../realtime/bottles-realtime.service';
import { BottlesService } from './bottles.service';
import { BottleResponseDto } from './dto/bottle-response.dto';
import { CatchBottleResponseDto } from './dto/catch-bottle-response.dto';
import { CreateBottleDto } from './dto/create-bottle.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { RepliedOutItemDto } from './dto/replied-out-item.dto';
import { RepliedToMeItemDto } from './dto/replied-to-me-item.dto';
import { StatsResponseDto } from './dto/stats-response.dto';

@ApiTags('bottles')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('bottles')
export class BottlesController {
  constructor(
    private readonly bottlesService: BottlesService,
    private readonly realtime: BottlesRealtimeService,
  ) {}

  @Post()
  @ApiOperation({ summary: '扔瓶子（与前端 Throw）' })
  @ApiResponse({ status: 201, type: BottleResponseDto })
  async create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateBottleDto,
  ): Promise<BottleResponseDto> {
    return this.bottlesService.create(userId, dto);
  }

  @Get('catch')
  @ApiOperation({
    summary: '随机捞一条他人瓶子（与前端 Sea / catch）；无可用瓶子时 HTTP 200 且 bottle 为 null',
  })
  @ApiResponse({ status: 200, type: CatchBottleResponseDto })
  async catchRandom(
    @CurrentUserId() userId: string,
  ): Promise<CatchBottleResponseDto> {
    const bottle = await this.bottlesService.catchRandom(userId);
    return { bottle };
  }

  @Get('mine')
  @ApiOperation({ summary: '我的瓶子列表' })
  @ApiResponse({ status: 200, type: [BottleResponseDto] })
  listMine(@CurrentUserId() userId: string): Promise<BottleResponseDto[]> {
    return this.bottlesService.listMine(userId);
  }

  @Get('favorites')
  @ApiOperation({ summary: '收藏列表' })
  @ApiResponse({ status: 200, type: [BottleResponseDto] })
  listFavorites(
    @CurrentUserId() userId: string,
  ): Promise<BottleResponseDto[]> {
    return this.bottlesService.listFavorites(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: '数据看板统计' })
  @ApiResponse({ status: 200, type: StatsResponseDto })
  stats(@CurrentUserId() userId: string): Promise<StatsResponseDto> {
    return this.bottlesService.getStats(userId);
  }

  @Get('replied-by-me')
  @ApiOperation({ summary: '我回复过的他人瓶子（含瓶主代号、我的回复列表）' })
  @ApiResponse({ status: 200, type: [RepliedOutItemDto] })
  listRepliedByMe(
    @CurrentUserId() userId: string,
  ): Promise<RepliedOutItemDto[]> {
    return this.bottlesService.listRepliedByMe(userId);
  }

  @Get('replies-to-me')
  @ApiOperation({ summary: '他人回复了我的瓶子（含回复者代号、每条回复与时间）' })
  @ApiResponse({ status: 200, type: [RepliedToMeItemDto] })
  listRepliesToMyBottles(
    @CurrentUserId() userId: string,
  ): Promise<RepliedToMeItemDto[]> {
    return this.bottlesService.listRepliesToMyBottles(userId);
  }

  @Get('events')
  @Sse()
  @SkipTransform()
  @ApiOperation({
    summary:
      'SSE：他人回复我的瓶子时推送 stats（EventSource / fetch 请使用 Query `token=<Clerk JWT>`，无法自定义 Header）',
  })
  @ApiQuery({ name: 'token', required: true, description: 'Clerk session JWT' })
  streamStats(@CurrentUserId() userId: string): Observable<MessageEvent> {
    return this.realtime.stream(userId);
  }

  @Post(':id/replies')
  @ApiOperation({ summary: '回复某条瓶子' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: BottleResponseDto })
  reply(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateReplyDto,
  ): Promise<BottleResponseDto> {
    return this.bottlesService.addReply(userId, id, dto.content);
  }

  @Post(':id/favorite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '收藏瓶子' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'data 为 null' })
  @ApiResponse({ status: 409, description: '已收藏过' })
  async favorite(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.bottlesService.addFavorite(userId, id);
  }

  @Delete(':id/favorite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '取消收藏' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'data 为 null' })
  async unfavorite(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.bottlesService.removeFavorite(userId, id);
  }
}
