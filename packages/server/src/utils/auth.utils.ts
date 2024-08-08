import { v4 as uuidv4 } from "uuid";

const SESSIONS = new Map(); // todo: use cache or database for this

export function setUserSession(userID: string) {
    const newSessionID = uuidv4();
    SESSIONS.set(newSessionID, userID);
    return newSessionID;
}

export function getUserIDandTokenFromSession(sessionID: string) {
    if (SESSIONS.has(sessionID)) {
        return SESSIONS.get(sessionID);
    } else {
        return null;
    }
}

export function invalidateSession(sessionID: string) {
    SESSIONS.delete(sessionID);
}
