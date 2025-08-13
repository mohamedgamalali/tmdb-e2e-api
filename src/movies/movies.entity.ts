import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, UpdateDateColumn } from 'typeorm';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  tmdb_id: string;

  @Column('varchar', { nullable: false })
  title: string;

  @Column('text', { nullable: true })
  overview: string;

  @Column('date', { nullable: true })
  release_date: Date;

  @Column('varchar', { nullable: true })
  poster_path: string;

  @Column('varchar', { nullable: true })
  backdrop_path: string;

  @Column('float', { nullable: true })
  popularity: number;

  @Column('float', { nullable: true })
  vote_average: number;

  @Column('int', { nullable: true })
  vote_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}