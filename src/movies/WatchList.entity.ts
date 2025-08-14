import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Movie } from './movies.entity';

@Entity('watch_list')
@Unique(['movie_id', 'user_id'])
export class WatchList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  movie_id: string;

  @Column('varchar') //mocked user id since we don't have actual auth flow
  user_id: string;

  @ManyToOne(() => Movie, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;
}