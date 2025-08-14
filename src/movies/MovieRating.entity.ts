import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Movie } from './movies.entity';

@Entity('movie_ratings')
@Unique(['movie_id', 'user_id'])
export class MovieRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  movie_id: string;

  @Column('varchar') //mocked user id since we don't have actual auth flow
  user_id: string;

  @Column('float', { nullable: false })
  rating: number;

  @ManyToOne(() => Movie, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;
}