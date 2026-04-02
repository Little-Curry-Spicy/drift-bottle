import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BottleReply } from './bottle-reply.entity';

@Entity({ name: 'bottles' })
export class Bottle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'author_id', type: 'varchar', length: 128 })
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => BottleReply, (reply) => reply.bottle)
  replies: BottleReply[];
}
