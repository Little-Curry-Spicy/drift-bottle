import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';
import { BottlesService } from './bottles.service';
import { BottleResponseDto } from './dto/bottle-response.dto';
import { CreateBottleDto } from './dto/create-bottle.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { StatsResponseDto } from './dto/stats-response.dto';

@ApiTags('bottles')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('bottles')
export class BottlesController {
  constructor(private readonly bottlesService: BottlesService) {}

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
  @ApiOperation({ summary: '随机捞一条他人瓶子（与前端 Sea / catch）' })
  @ApiResponse({ status: 200, type: BottleResponseDto })
  @ApiResponse({ status: 404, description: '海里暂时没有可捞的瓶子' })
  async catchRandom(
    @CurrentUserId() userId: string,
  ): Promise<BottleResponseDto> {
    const b = await this.bottlesService.catchRandom(userId);
    if (!b) {
      throw new NotFoundException('No bottles in the sea right now');
    }
    return b;
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '收藏瓶子' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 409, description: '已收藏过' })
  async favorite(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.bottlesService.addFavorite(userId, id);
  }

  @Delete(':id/favorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '取消收藏' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204 })
  async unfavorite(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.bottlesService.removeFavorite(userId, id);
  }
}
