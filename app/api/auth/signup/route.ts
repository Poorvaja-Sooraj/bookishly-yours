import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/jwt";
import { setAuthCookie } from "@/lib/api-helpers";

export async function POST(request: Request) {
    try {
        await connectDB();

        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "All fields are required.",
                },
                { status: 400 }
            );
        }
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User already exists with this email.",
                },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        const token = generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
        });

        const response = NextResponse.json(
            {
                success: true,
                message: "User registered successfully.",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            },
            { status: 201 }
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
