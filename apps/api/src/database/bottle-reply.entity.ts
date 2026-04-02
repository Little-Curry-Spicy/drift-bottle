import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bottle } from './bottle.entity';

@Entity({ name: 'bottle_replies' })
export class BottleReply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Bottle, (bottle) => bottle.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bottle_id' })
  bottle: Bottle;

  @Column({ name: 'author_id', type: 'varchar', length: 128 })
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
