import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Movie } from './movies.entity';
import { Genre } from '../genres/genre.entity';

@Entity('movie_genres')
@Unique(['movie_id', 'genre_id'])
export class MovieGenre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  movie_id: string;

  @Column('uuid')
  genre_id: string;

  @ManyToOne(() => Movie, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Genre, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'genre_id' })
  genre: Genre;
}