import { createStorage } from "unstorage";
import lruCacheDriver from "unstorage/drivers/lru-cache";

export const sessionStorage = createStorage({
    driver: lruCacheDriver({
        max: 100, // Keep a max of 100 items in LRU Cache
    }),
});
