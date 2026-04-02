import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BottlesModule } from './bottles/bottles.module';
import { Bottle, BottleFavorite, BottleReply } from './database/entities';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        return {
          type: 'postgres' as const,
          url: databaseUrl,
          entities: [Bottle, BottleReply, BottleFavorite],
          synchronize: config.get<string>('TYPEORM_SYNCHRONIZE') === 'true',
          logging: config.get<string>('TYPEORM_LOGGING') === 'true',
          ssl: false,
        };
      },
    }),
    BottlesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
