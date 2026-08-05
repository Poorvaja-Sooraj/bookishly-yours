import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/jwt";

export async function POST(request: Request) {
    try {
        await connectDB();

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email and password are required.",
                },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password.",
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
                    message: "Invalid email or password.",
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

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

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