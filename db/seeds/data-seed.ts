import { DataSource, In } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { SyncGenresService } from 'src/sync/sync.genres.service';
import { SyncMoviesService } from 'src/sync/sync.movies.service';
import { Genre } from 'src/genres/genre.entity';
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
    } catch (error) {
      console.error('❌ Error seeding data:', error);
      throw error;
    }
  }
}
