// Test setup file for e2e tests
import 'reflect-metadata';

// Set test environment variables
process.env.NODE_ENV = 'test';

// Set default test database environment variables if not provided
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5433';
process.env.DATABASE_USER = 'tmdb_user_test';
process.env.DATABASE_PASSWORD = 'tmdb_password_test';
process.env.DATABASE_NAME = 'tmdb_db_test';

// Increase test timeout for e2e tests
jest.setTimeout(30000); 