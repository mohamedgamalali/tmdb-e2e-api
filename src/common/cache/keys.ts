import { createHash } from 'crypto';

export enum CacheKeysMap {
    GET_GENRES = `get:genres`,
    GET_MOVIES = `get:movies`,
    GET_WATCH_LIST = `get:watch-list`,
}

export const getCacheKey = (key: CacheKeysMap, query: object) => {
    //sort query by key, gurantee unification with all API clients "web or mobile"
    const sortedQuery = Object.keys(query).sort().reduce((acc, key) => {
        acc[key] = query[key];
        return acc;
    }, {});
    const hash = createHash('sha256').update(JSON.stringify(sortedQuery)).digest('hex');
    return `${key}:${hash}`;
}

export const getPrefix = (key: CacheKeysMap) => `${key}:*`;

