import { createStorage } from "unstorage";
import lruCacheDriver from "unstorage/drivers/lru-cache";
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import type { NodemailerExpressHandlebarsOptions } from "nodemailer-express-handlebars";

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

const hbsOptions: NodemailerExpressHandlebarsOptions = {
    viewEngine: {
        defaultLayout: false as unknown as string,
    },
    viewPath: "../server/src/assets/templates/emails",
};

export const mailTransporter = nodemailer
    .createTransport({
        service: "gmail",
        auth: {
            user: String(process.env.SMTP_MAIL),
            pass: String(process.env.SMTP_PASS),
        },
    })
    .use("compile", hbs(hbsOptions));
