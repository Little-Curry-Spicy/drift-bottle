import { Module } from '@nestjs/common';
import { BottlesRealtimeService } from './bottles-realtime.service';

@Module({
  providers: [BottlesRealtimeService],
  exports: [BottlesRealtimeService],
})
export class RealtimeModule {}
