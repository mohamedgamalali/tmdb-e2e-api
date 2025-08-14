import { DataSource, In } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { SyncGenresService } from 'src/sync/sync.genres.service';
import { SyncMoviesService } from 'src/sync/sync.movies.service';
import { Genre } from 'src/genres/genre.entity';
import { writeFile } from 'fs/promises';
@Injectable()
export class DataSeedService {
  @Inject(SyncGenresService)
  private readonly syncGenresService: SyncGenresService;

  @Inject(SyncMoviesService)
  private readonly syncMoviesService: SyncMoviesService;

  constructor(private dataSource: DataSource) {}

  async seedDatabase() {

    try {
      // Generate data
      const genres = await this.syncGenresService.run();
      console.log('✅ Created genres:', genres.length);
      //only query with genres existed in DB avoiding bad relation errors
      const tmdbGenresIds = await this.dataSource.getRepository(Genre).find({ select: { tmdb_id: true } });
      const movies = await this.syncMoviesService.run({ pages: 10, TmdbGenresIds: tmdbGenresIds.map(genre => genre.tmdb_id), startPage: 1 });
      console.log('✅ Created movies:', movies);

      console.log('✅ Seed data generated successfully');

      // const allMovies = await this.dataSource.getRepository('movie').find();
      // await writeFile('allMovies.json', JSON.stringify(allMovies, null, 2));
      // const allGenres = await this.dataSource.getRepository('genre').find();
      // await writeFile('allGenres.json', JSON.stringify(allGenres, null, 2));

      // const allMovieGenres = await this.dataSource.getRepository('movie_genres').find();
      // await writeFile('allMovieGenres.json', JSON.stringify(allMovieGenres, null, 2));

    } catch (error) {
      console.error('❌ Error seeding data:', error);
      throw error;
    }
  }
}
