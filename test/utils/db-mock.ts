export const createQueryBuilderMock = () => {
    const qb: any = {
        // Insert operations
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orUpdate: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        
        // Delete operations
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        
        // Select operations
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        
        // Joins
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        
        // Ordering and pagination
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        
        // Grouping
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        andHaving: jest.fn().mockReturnThis(),
        
        // Execution methods
        execute: jest.fn().mockResolvedValue(undefined),
        getRawMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest.fn().mockResolvedValue({}),
        getMany: jest.fn().mockResolvedValue([]),
        getOne: jest.fn().mockResolvedValue({}),
        getCount: jest.fn().mockResolvedValue(0),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        
        // Other utilities
        clone: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
    };
    
    return qb;
};

export const createRepoMock = () => {
    return {
        // Basic CRUD operations
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue(null),
        findOneBy: jest.fn().mockResolvedValue(null),
        findAndCount: jest.fn().mockResolvedValue([[], 0]),
        save: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockReturnValue({}),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
        remove: jest.fn().mockResolvedValue({}),
        
        // Query builder
        createQueryBuilder: jest.fn().mockReturnValue(createQueryBuilderMock()),
        
        // Bulk operations
        upsert: jest.fn().mockResolvedValue({ affected: 1 }),
        insert: jest.fn().mockResolvedValue({ affected: 1 }),
        
        // Manager and metadata
        manager: {
            transaction: jest.fn(),
            query: jest.fn().mockResolvedValue([]),
            save: jest.fn().mockResolvedValue({}),
            remove: jest.fn().mockResolvedValue({}),
        },
        metadata: {
            tableName: 'test_table',
            columns: [],
        },
    };
};

// Helper to create mock entities
export const createMockGenre = (overrides: Partial<any> = {}): any => {
    return {
        id: `test-genre-id-${Math.random().toString(36).substring(2, 15)}`,
        tmdb_id: `123-${Math.random().toString(36).substring(2, 15)}`,
        name: 'Action',
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01'),
        ...overrides,
    };
};

export const createMockMovie = (overrides: Partial<any> = {}): any => {
    return {
        id: 'test-movie-id',
        tmdb_id: '456',
        title: 'Test Movie',
        overview: 'Test movie overview',
        release_date: new Date('2023-01-01'),
        poster_path: '/test-poster.jpg',
        backdrop_path: '/test-backdrop.jpg',
        popularity: 8.5,
        vote_average: 7.8,
        vote_count: 1000,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01'),
        movieGenres: [],
        genres: [],
        ...overrides,
    };
};

// Helper to create paginated response mock
export const createMockPaginatedResponse = <T>(data: T[], page = 1, limit = 10, total?: number): any => {
    return {
        data,
        pagination: {
            page,
            limit,
            total: total ?? data.length,
            totalPages: Math.ceil((total ?? data.length) / limit),
        },
    };
};