import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { TestDataSeedService } from 'db/seeds/test-data-seed';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let moduleFixture: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same global pipes as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        whitelist: true,
      }),
    );
    
    await app.init();
    
    // Get DataSource after app initialization
    dataSource = moduleFixture.get<DataSource>(DataSource);

    const seeder = new TestDataSeedService(dataSource);
    await seeder.seedAllTables();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('genres', () => {
    let GLOBAL_PATH = '/genres';
    it('should return all genres', async () => {
      const PAGE_SIZE = 10;
      const res = await request(app.getHttpServer())
        .get(`${GLOBAL_PATH}?page=1&limit=${PAGE_SIZE}`)
        .expect(200);      
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.length).toBe(PAGE_SIZE);
    });

    it('should get genre with search query', async () => {
      const PAGE_SIZE = 10;
      const res = await request(app.getHttpServer())
        .get(`${GLOBAL_PATH}?page=1&limit=${PAGE_SIZE}&search=Action`)
        .expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Action');
    });

    it('should return bad request with non numaric pages', () => {
      const PAGE_SIZE = 10;
      return request(app.getHttpServer())
        .get(`${GLOBAL_PATH}?page=ssss&limit=${PAGE_SIZE}&search=Action`)
        .expect(400);
    });
  });

  describe('movies', () => {
    let GLOBAL_PATH = '/movies';
    const PAGE_SIZE = 10;
    it('should get movies', async () => {
      const res = await request(app.getHttpServer())
        .get(`${GLOBAL_PATH}?page=1&limit=${PAGE_SIZE}`)
        .expect(200);
      expect(res.body.data).toHaveLength(PAGE_SIZE);
      //each movie should have genres
      for (const movie of res.body.data) {
        const movieId = movie.id;
        const movieGenres = await dataSource.getRepository('movie_genres').find({ where: { movie_id: movieId } });
        expect(movieGenres).toBeDefined();
        expect(movieGenres.length).toBe(movie.genres.length);
      }
    });

    it('should get movies with search query', async () => {
      const res = await request(app.getHttpServer())
        .get(`${GLOBAL_PATH}?page=1&limit=${PAGE_SIZE}&search=Murder Company`)
        .expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Murder Company');
    });

    it('should return mories by sortBy and sortOrder', async () => {
      const res = await request(app.getHttpServer())
        .get(`${GLOBAL_PATH}?page=1&limit=${PAGE_SIZE}&sortBy=vote_average&sortOrder=desc`)
        .expect(200);
      expect(res.body.data[0].vote_average).toBe(10); // highest vote in mocks
    });
    it('should filter movies by genre', async () => {
      const genreIds = ['51ea606c-a61e-4cab-be0d-ed7a74ea0c7e', '12c24c69-cd51-43f1-89b3-ee90ff665152'];
      const res = await request(app.getHttpServer())
        .get(`${GLOBAL_PATH}?page=1&limit=${PAGE_SIZE}&genreIds=${genreIds[0]}&genreIds=${genreIds[1]}`)
        .expect(200);
      expect(res.body.data).toHaveLength(PAGE_SIZE);
      for (const movie of res.body.data) {
        const movieId = movie.id;
        // Verify that this movie has at least one of the requested genres
        const hasRequestedGenre = movie.genres.some(genre => genreIds.includes(genre.id));
        expect(hasRequestedGenre).toBe(true);
        const movieGenres = await dataSource.getRepository('movie_genres').find({ where: { movie_id: movieId } });
        expect(movieGenres).toBeDefined();
        expect(movieGenres.length).toBe(movie.genres.length);
        movie.genres.forEach(genre => expect(genre.name).toBeDefined());
      }
    });

    it('should rate a movie', async () => {
      const testMovieTitle = 'Murder Company';
      const testMovie = await dataSource.getRepository('movie').findOne({ where: { title: testMovieTitle } });
      expect(testMovie).toBeDefined();
      const res = await request(app.getHttpServer())
        .post(`${GLOBAL_PATH}/rate`)
        .send({ movieId: testMovie?.id, userId: '1', rating: 5 })
        .expect(201);
      expect(res.body.message).toBe('Movie rated successfully');

      //should reflect in average rating when get movies
      const moviesRes = await request(app.getHttpServer())
        .get(`${GLOBAL_PATH}?page=1&limit=${PAGE_SIZE}&search=${testMovieTitle}`)
        .expect(200);
      expect(moviesRes.body.data[0].average_internal_rating).toBe(5);
    });
  });

  describe('watchlist', () => {
    let GLOBAL_PATH = '/movies/watchlist';
    const PAGE_SIZE = 10;
    const testUserId = '1';
    const testMovieTitle = 'Murder Company';

    it('should add a movie to watch list', async () => {
      const testMovie = await dataSource.getRepository('movie').findOne({ where: { title: testMovieTitle } });
      expect(testMovie).toBeDefined();
      const res = await request(app.getHttpServer())
        .post(`${GLOBAL_PATH}`)
        .send({ movieId: testMovie?.id, userId: testUserId })
        .expect(201);
      expect(res.body.message).toBe('Movie added to watch list successfully');
      const userWatchList = await dataSource.getRepository('watch_list').find({ where: { user_id: testUserId } });
      expect(userWatchList).toBeDefined();
      expect(userWatchList.length).toBe(1);
      expect(userWatchList[0].movie_id).toBe(testMovie?.id);
      expect(userWatchList[0].user_id).toBe(testUserId);
    });

    it('should get watch list', async () => {
      const testMovie = await dataSource.getRepository('movie').findOne({ where: { title: testMovieTitle } });
      expect(testMovie).toBeDefined();
      const res = await request(app.getHttpServer())
        .get(`${GLOBAL_PATH}?page=1&limit=${PAGE_SIZE}&userId=${testUserId}`)
        .expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].movie_id).toBe(testMovie?.id);
    });
  });
});
