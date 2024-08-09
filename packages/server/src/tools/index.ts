import { createStorage } from "unstorage";
import lruCacheDriver from "unstorage/drivers/lru-cache";
import nodemailer from "nodemailer";

export const sessionStorage = createStorage({
    driver: lruCacheDriver({
        max: 100, // Keep a max of 100 items in LRU Cache
    }),
});

export const userSessionMap = createStorage({
    driver: lruCacheDriver({
        max: 100, // Keep a max of 100 items in LRU Cache
    }),
});

export const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: String(process.env.SMTP_MAIL),
        pass: String(process.env.SMTP_PASS),
    },
});
