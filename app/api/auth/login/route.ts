import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/jwt";
import { setAuthCookie } from "@/lib/api-helpers";

export async function POST(request: Request) {
    try {
        await connectDB();

        const { email, password } = await request.json();

        const identifier = email?.trim();

        if (!identifier || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username/Email and password are required.",
                },
                { status: 400 }
            );
        }

        const escapeRegExp = (str: string) => {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: { $regex: new RegExp(`^${escapeRegExp(identifier)}$`, "i") } }
            ]
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "The entered username or email address is not registered.",
                },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Incorrect password.",
                },
                { status: 401 }
            );
        }

        const token = generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
        });

        const response = NextResponse.json(
            {
                success: true,
                message: "Login successful.",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            },
            { status: 200 }
        );

        setAuthCookie(response, token);

        return response;
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            { status: 500 }
        );
    }
}