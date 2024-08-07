import { v4 as uuidv4 } from "uuid";

const SESSIONS = new Map();

export function setUserSession(userID: string, csrfToken: string) {
    const newSessionID = uuidv4();
    SESSIONS.set(newSessionID, { userID, csrfToken });
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

export function getNewCRSFToken() {
    const token = uuidv4();
    return token;
}
