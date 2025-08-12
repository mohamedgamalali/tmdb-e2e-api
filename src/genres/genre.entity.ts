import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, UpdateDateColumn } from 'typeorm';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  tmdbId: number;

  @Index({ unique: true })
  @Column('varchar', { nullable: false, unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}