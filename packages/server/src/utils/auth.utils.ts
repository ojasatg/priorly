import jwt from "jsonwebtoken";

export function createAuthToken(userId: string) {
    const secret = String(process.env.JWT_SECRET);
    const MAX_AGE = 3 * 24 * 60 * 60; // 3 days in seconds

    const token = jwt.sign({ id: userId }, secret, { expiresIn: MAX_AGE });
    return token;
}

export function getUserIdFromAuthToken(token: string) {
    const secret = String(process.env.JWT_SECRET);

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            console.error("Token verification failed:", err);
        } else {
            return (decoded as { id: string })?.id;
        }
    });
}
