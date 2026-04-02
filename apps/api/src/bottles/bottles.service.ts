import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Bottle, BottleFavorite, BottleReply } from '../database';
import { BottlesRealtimeService } from '../realtime/bottles-realtime.service';
import type { BottleResponseDto } from './dto/bottle-response.dto';
import type { CreateBottleDto } from './dto/create-bottle.dto';
import type { RepliedOutItemDto } from './dto/replied-out-item.dto';
import type { RepliedToMeItemDto } from './dto/replied-to-me-item.dto';
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
    private readonly realtime: BottlesRealtimeService,
  ) { }

  /** 别人在我扔出的瓶子下回复的数量（不含自己回复自己） */
  /** 瓶主展示用匿名代号（不暴露完整 Clerk id） */
  private maskAuthorId(authorId: string): string {
    const cleaned = authorId.replace(/[^a-zA-Z0-9]/g, '');
    const tail =
      cleaned.length >= 4 ? cleaned.slice(-4) : (cleaned + '****').slice(-4);
    return `海友 · ${tail}`;
  }

  /**
   * 按 bottle 去重计数「回复相关的瓶子数量」。
   * - direction = 'received'：瓶主是 viewer，且回复者不是 viewer（即“别人回复了我的瓶子”）
   * - direction = 'sent'：回复者是 viewer，且瓶主不是 viewer（即“我回复了他人的瓶子”）
   */
  private async countDistinctReplyBottles(
    viewerId: string,
    direction: "received" | "sent",
  ): Promise<number> {
    const qb = this.replyRepo
      .createQueryBuilder('r')
      .innerJoin('r.bottle', 'b')
      .select('COUNT(DISTINCT b.id)', 'cnt');

    if (direction === 'received') {
      qb.where('b.authorId = :viewerId', { viewerId }).andWhere(
        'r.authorId != :viewerId',
        { viewerId },
      );
    } else {
      qb.where('r.authorId = :viewerId', { viewerId }).andWhere(
        'b.authorId != :viewerId',
        { viewerId },
      );
    }

    const raw = await qb.getRawOne<{ cnt: string }>();
    const cnt = raw?.cnt;
    return typeof cnt === 'string' ? Number(cnt) : 0;
  }

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
    const bottle = await this.loadBottleWithReplies(bottleId);
    const ownerId = bottle.authorId;
    const reply = this.replyRepo.create({
      bottle: { id: bottleId } as Bottle,
      authorId: userId,
      content: content.trim(),
    });
    await this.replyRepo.save(reply);

    if (ownerId !== userId) {
      const received = await this.countDistinctReplyBottles(ownerId, 'received');
      this.realtime.notifyReceivedReplies(ownerId, received);
    }

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

  /** 我回复过的、且瓶主为他人的瓶子（用于「我回复了谁」） */
  async listRepliedByMe(userId: string): Promise<RepliedOutItemDto[]> {
    const myReplies = await this.replyRepo.find({
      where: { authorId: userId },
      relations: { bottle: true },
      order: { createdAt: 'ASC' },
    });

    const grouped = new Map<
      string,
      { bottle: Bottle; replies: typeof myReplies }
    >();

    for (const r of myReplies) {
      const b = r.bottle;
      if (!b || b.authorId === userId) continue;

      let entry = grouped.get(b.id);
      if (!entry) {
        entry = { bottle: b, replies: [] };
        grouped.set(b.id, entry);
      }
      entry.replies.push(r);
    }

    const items: RepliedOutItemDto[] = Array.from(grouped.values()).map(
      ({ bottle, replies }) => {
        const sorted = replies
          .slice()
          .sort((a, c) => a.createdAt.getTime() - c.createdAt.getTime());
        const last = sorted[sorted.length - 1]!;
        return {
          bottleId: bottle.id,
          bottleContent: bottle.content,
          bottleCreatedAt: bottle.createdAt.toISOString(),
          bottleAuthorMask: this.maskAuthorId(bottle.authorId),
          myReplyContents: sorted.map((x) => x.content),
          lastRepliedAt: last.createdAt.toISOString(),
        };
      },
    );

    items.sort(
      (a, b) =>
        new Date(b.lastRepliedAt).getTime() -
        new Date(a.lastRepliedAt).getTime(),
    );

    return items;
  }

  /** 他人回复了我扔出的瓶子（不含自己回自己） */
  async listRepliesToMyBottles(userId: string): Promise<RepliedToMeItemDto[]> {
    const rows = await this.replyRepo
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.bottle', 'b')
      .where('b.authorId = :userId', { userId })
      .andWhere('r.authorId != :userId', { userId })
      .orderBy('r.createdAt', 'ASC')
      .getMany();

    const grouped = new Map<string, typeof rows>();

    for (const row of rows) {
      const bid = row.bottle.id;
      const list = grouped.get(bid);
      if (list) {
        list.push(row);
      } else {
        grouped.set(bid, [row]);
      }
    }

    const bottleIds = Array.from(grouped.keys());
    const myReplies = bottleIds.length
      ? await this.replyRepo
        .createQueryBuilder('r')
        .innerJoinAndSelect('r.bottle', 'b')
        .where('r.authorId = :userId', { userId })
        .andWhere('b.id IN (:...ids)', { ids: bottleIds })
        .orderBy('r.createdAt', 'ASC')
        .getMany()
      : [];

    const myRepliesMap = new Map<string, typeof myReplies>();
    for (const r of myReplies) {
      const bid = r.bottle.id;
      const list = myRepliesMap.get(bid);
      if (list) {
        list.push(r);
      } else {
        myRepliesMap.set(bid, [r]);
      }
    }

    const items: RepliedToMeItemDto[] = Array.from(grouped.entries()).map(
      ([, repList]) => {
        const bottle = repList[0]!.bottle;
        const last = repList[repList.length - 1]!;
        return {
          bottleId: bottle.id,
          bottleContent: bottle.content,
          bottleCreatedAt: bottle.createdAt.toISOString(),
          incomingReplies: repList.map((r) => ({
            content: r.content,
            authorMask: this.maskAuthorId(r.authorId),
            createdAt: r.createdAt.toISOString(),
          })),
          myReplyContents: (myRepliesMap.get(bottle.id) ?? []).map((r) => r.content),
          lastReplyAt: last.createdAt.toISOString(),
        };
      },
    );

    items.sort(
      (a, b) =>
        new Date(b.lastReplyAt).getTime() - new Date(a.lastReplyAt).getTime(),
    );

    return items;
  }

  async getStats(userId: string): Promise<StatsResponseDto> {
    const [thrown, favoriteCount, replied, receivedReplies] = await Promise.all([
      this.bottleRepo.count({ where: { authorId: userId } }),
      this.favoriteRepo.count({ where: { userId } }),
      this.countDistinctReplyBottles(userId, "sent"),
      this.countDistinctReplyBottles(userId, "received"),
    ]);
    return { thrown, favorite: favoriteCount, replied, receivedReplies };
  }
}
