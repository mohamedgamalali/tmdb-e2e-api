# TMDB E2E Project

A NestJS application that integrates with The Movie Database (TMDB) API to sync and manage movie and genre data with comprehensive testing coverage.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and Yarn

### How to run the project

1. **Copy environment configuration:**
   ```bash
   cp env.development .env
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Access the API:**
   - **API Endpoint:** http://localhost:8080
   - **Database:** PostgreSQL on port 5432
   - **Cache:** Redis on port 6379

## 📊 Database Seeding

### Seed from TMDB API
To populate the database with initial data from TMDB:

```bash
# From inside the docker container
docker exec -it tmdb-e2e-app yarn seed

# Or run directly if you have the environment set up locally
yarn seed
```

The seed script will:
- Connect to the TMDB API using your configured API key
- Sync genres and movies data
- Populate the database with initial content
- Use the sync module services for data consistency

## 🧪 Testing

### Unit Tests
```bash
yarn test
```

### E2E Tests
```bash
yarn test:e2e
```

### Test Coverage
```bash
yarn test:cov
```

### Watch Mode
```bash
yarn test:watch
```

## 🏗️ Project Structure

```
src/
├── common/          # Shared utilities, middleware, cache
├── config/          # Configuration and validation
├── genres/          # Genre management
├── movies/          # Movie management
├── sync/            # TMDB data synchronization
└── tmdb/            # TMDB API client
```

## 🔄 Sync Module

The sync module (`src/sync/`) handles data synchronization between TMDB API and your local database:

- **SyncGenresService**: Manages genre synchronization
- **SyncMoviesService**: Handles movie data sync
- **Cache Integration**: Uses Redis for performance optimization

## 📋 Next Steps

### 1. Implement Background Cron Job
Set up a scheduled job to automatically sync data from TMDB:

```typescript
// Example cron job implementation
@Cron('0 */6 * * *') // Every 6 hours
async handleCron() {
  await this.syncGenresService.syncGenres();
  await this.syncMoviesService.syncMovies();
}
```

## 🔧 Development

### Available Scripts
```bash
yarn start          # Start in production mode
yarn start:dev      # Start in development mode with watch
yarn start:debug    # Start with debug enabled
yarn build          # Build the application
yarn lint           # Run ESLint
yarn format         # Format code with Prettier
```

### Environment Variables
Key configuration options in `.env`:
- `TMDB_API_KEY`: Your TMDB API key
- `DATABASE_*`: PostgreSQL connection settings
- `REDIS_URL`: Redis connection string
- `LOG_LEVEL`: Application logging level

## 🐳 Docker Services

The application runs with these services:
- **App**: NestJS application (port 8080)
- **PostgreSQL**: Main database (port 5432)
- **PostgreSQL Test**: Test database (port 5433)
- **Redis**: Cache layer (port 6379)

## 📚 API Documentation

Once the application is running, you can access:
- **Swagger UI**: http://localhost:8080/api (if configured)
- **Health Check**: http://localhost:8080/health (if implemented)

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 8080, 5432, 6379 are available
2. **Database connection**: Check PostgreSQL health check in docker-compose
3. **API key**: Verify TMDB_API_KEY is set in your .env file
4. **Cache issues**: Ensure Redis is running and accessible

### Logs
```bash
# View application logs
docker logs tmdb-e2e-app

# View database logs
docker logs tmdb-postgres

# View cache logs
docker logs cache
```