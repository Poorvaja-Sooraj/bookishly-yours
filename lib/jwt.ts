import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error("Please define the JWT_SECRET environment variable.");
}

export interface AuthUserJwtPayload {
    id: string;
    username: string;
    email: string;
}

export function generateToken(payload: AuthUserJwtPayload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "7d",
    });
}

export function verifyToken(token: string): AuthUserJwtPayload {
    return jwt.verify(token, JWT_SECRET) as AuthUserJwtPayload;
}