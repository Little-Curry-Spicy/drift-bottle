import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { Bottle } from '../database/entities/bottle.entity';
import { BottleFavorite } from '../database/entities/bottle-favorite.entity';
import { BottleReply } from '../database/entities/bottle-reply.entity';
import { BottlesController } from './bottles.controller';
import { BottlesService } from './bottles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bottle, BottleReply, BottleFavorite]),
  ],
  controllers: [BottlesController],
  providers: [BottlesService, ClerkAuthGuard],
})
export class BottlesModule {}
