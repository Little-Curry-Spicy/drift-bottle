import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { Bottle, BottleFavorite, BottleReply } from '../database';
import { RealtimeModule } from '../realtime/realtime.module';
import { BottlesController } from './bottles.controller';
import { BottlesService } from './bottles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bottle, BottleReply, BottleFavorite]),
    RealtimeModule,
  ],
  controllers: [BottlesController],
  providers: [BottlesService, ClerkAuthGuard],
})
export class BottlesModule { }
