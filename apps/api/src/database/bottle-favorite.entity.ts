import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'bottle_favorites' })
export class BottleFavorite {
  @PrimaryColumn('varchar', { name: 'user_id', length: 128 })
  userId: string;

  @PrimaryColumn('uuid', { name: 'bottle_id' })
  bottleId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
