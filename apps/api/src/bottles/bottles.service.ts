import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Bottle } from '../database/entities/bottle.entity';
import { BottleFavorite } from '../database/entities/bottle-favorite.entity';
import { BottleReply } from '../database/entities/bottle-reply.entity';
import type { BottleResponseDto } from './dto/bottle-response.dto';
import type { CreateBottleDto } from './dto/create-bottle.dto';
import type { StatsResponseDto } from './dto/stats-response.dto';

@Injectable()
export class BottlesService {
  constructor(
    @InjectRepository(Bottle)
    private readonly bottleRepo: Repository<Bottle>,
    @InjectRepository(BottleReply)
    private readonly replyRepo: Repository<BottleReply>,
    @InjectRepository(BottleFavorite)
    private readonly favoriteRepo: Repository<BottleFavorite>,
  ) {}

  private async toDto(bottle: Bottle, viewerId: string): Promise<BottleResponseDto> {
    const replies = (bottle.replies ?? [])
      .slice()
      .sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
    return {
      id: bottle.id,
      content: bottle.content,
      author: bottle.authorId === viewerId ? 'me' : 'stranger',
      replies: replies.map((r) => r.content),
      createdAt: bottle.createdAt.toISOString(),
    };
  }

  private async loadBottleWithReplies(id: string): Promise<Bottle> {
    const bottle = await this.bottleRepo.findOne({
      where: { id },
      relations: { replies: true },
    });
    if (!bottle) {
      throw new NotFoundException('Bottle not found');
    }
    return bottle;
  }

  async create(userId: string, dto: CreateBottleDto): Promise<BottleResponseDto> {
    const bottle = this.bottleRepo.create({
      authorId: userId,
      content: dto.content.trim(),
    });
    const saved = await this.bottleRepo.save(bottle);
    return this.toDto(
      await this.loadBottleWithReplies(saved.id),
      userId,
    );
  }

  /** 随机捞一条「别人的」瓶子（前端 Sea / catch） */
  async catchRandom(userId: string): Promise<BottleResponseDto | null> {
    const row = await this.bottleRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.replies', 'r')
      .where('b.author_id != :userId', { userId })
      .orderBy('RANDOM()')
      .getOne();
    if (!row) {
      return null;
    }
    return this.toDto(row, userId);
  }

  async listMine(userId: string): Promise<BottleResponseDto[]> {
    const list = await this.bottleRepo.find({
      where: { authorId: userId },
      relations: { replies: true },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(list.map((b) => this.toDto(b, userId)));
  }

  async listFavorites(userId: string): Promise<BottleResponseDto[]> {
    const favs = await this.favoriteRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const ids = favs.map((f) => f.bottleId);
    if (ids.length === 0) {
      return [];
    }
    const bottles = await this.bottleRepo.find({
      where: { id: In(ids) },
      relations: { replies: true },
    });
    const map = new Map(bottles.map((b) => [b.id, b]));
    return Promise.all(
      ids
        .map((id) => map.get(id))
        .filter((b): b is Bottle => b != null)
        .map((b) => this.toDto(b, userId)),
    );
  }

  async addReply(
    userId: string,
    bottleId: string,
    content: string,
  ): Promise<BottleResponseDto> {
    await this.loadBottleWithReplies(bottleId);
    const reply = this.replyRepo.create({
      bottle: { id: bottleId } as Bottle,
      authorId: userId,
      content: content.trim(),
    });
    await this.replyRepo.save(reply);
    return this.toDto(await this.loadBottleWithReplies(bottleId), userId);
  }

  async addFavorite(userId: string, bottleId: string): Promise<void> {
    await this.loadBottleWithReplies(bottleId);
    const existing = await this.favoriteRepo.findOne({
      where: { userId, bottleId },
    });
    if (existing) {
      throw new ConflictException('Already favorited');
    }
    await this.favoriteRepo.save(
      this.favoriteRepo.create({ userId, bottleId }),
    );
  }

  async removeFavorite(userId: string, bottleId: string): Promise<void> {
    const res = await this.favoriteRepo.delete({ userId, bottleId });
    if (!res.affected) {
      throw new NotFoundException('Favorite not found');
    }
  }

  async getStats(userId: string): Promise<StatsResponseDto> {
    const [thrown, favoriteCount, replied] = await Promise.all([
      this.bottleRepo.count({ where: { authorId: userId } }),
      this.favoriteRepo.count({ where: { userId } }),
      this.replyRepo.count({ where: { authorId: userId } }),
    ]);
    return { thrown, favorite: favoriteCount, replied };
  }
}
