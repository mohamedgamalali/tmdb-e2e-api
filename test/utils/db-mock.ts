export const createRepoMock = () => {
    const qb: any = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orUpdate: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };
    
    return {
      upsert: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      manager: {
        transaction: jest.fn(),
      },
    };
}