import { v4 as uuidv4 } from "uuid";
import { sessionStorage } from "../storage";

export async function setUserSession(userID: string) {
    const newSessionID = String(uuidv4());
    await sessionStorage.setItem(newSessionID, userID);
    return newSessionID;
}

export async function getUserIDFromSession(sessionID: string) {
    if (await sessionStorage.hasItem(sessionID)) {
        return await sessionStorage.getItem(sessionID);
    } else {
        return null;
    }
}

export async function invalidateSession(sessionID: string) {
    await sessionStorage.removeItem(sessionID);
}
