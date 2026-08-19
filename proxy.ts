import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

export async function proxy(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/auth", request.url));
    }

    try {
        if (!JWT_SECRET) {
            console.error("JWT_SECRET is missing");
            return NextResponse.redirect(new URL("/auth", request.url));
        }
        const secretKey = new TextEncoder().encode(JWT_SECRET);
        await jwtVerify(token, secretKey);
        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/auth", request.url));
    }
}

export const config = {
    matcher: ["/dashboard/:path*"],
};