import { v4 as uuidv4 } from "uuid";

import { sessionStorage, userSessionMap, mailTransporter } from "../tools";

async function invalidateSessionInBothMap(userID: string, sessionID: string) {
    const hasSession = (await sessionStorage.hasItem(sessionID)) as boolean;
    if (hasSession) {
        await sessionStorage.removeItem(sessionID);
    }

    const hasUserSession = await userSessionMap.hasItem(userID);
    if (hasUserSession) {
        await userSessionMap.removeItem(userID);
    }

    return true;
}

export async function invalidateSession(sessionID: string) {
    const userID = (await sessionStorage.getItem(sessionID)) as string;
    await invalidateSessionInBothMap(userID, sessionID);
}

export async function invalidateSessionByUserID(userID: string) {
    const sessionID = (await userSessionMap.getItem(userID)) as string;
    await invalidateSessionInBothMap(userID, sessionID);
}

export async function setUserSession(userID: string) {
    await invalidateSessionByUserID(userID); // clear previous session - user can have only one session

    const newSessionID = uuidv4();

    // maintain two reverse tables for sessions
    await sessionStorage.setItem(newSessionID, userID);
    await userSessionMap.setItem(userID, newSessionID);

    return newSessionID;
}

export async function getUserIDFromSession(sessionID: string) {
    const hasSession = (await sessionStorage.hasItem(sessionID)) as boolean;
    if (hasSession) {
        return await sessionStorage.getItem(sessionID);
    } else {
        return null;
    }
}

interface IGenerateMailOptionsParams {
    emailTo: string;
    subject: string;
    templateFileName: string;
    htmlFileClickLink?: string;
}

export async function sendMail(options: IGenerateMailOptionsParams) {
    // used for - email confirmation during signup and email changing
    // used for - forgot password and when user changes password with/without forgetting
    // used for - when user changes his her email (send to both new and old email)
    // used for - thanking when account created, account deletion

    const APP_EMAIL = String(process.env.SMTP_MAIL);

    const mailOptions = {
        from: APP_EMAIL,
        to: options.emailTo,
        subject: options.subject,
        template: options.templateFileName,
    };

    // make this a promise request so that this function doesn't blocks the main thread of execution
    mailTransporter.sendMail(mailOptions);
}
