import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";
import { verifyToken } from "@/lib/jwt";

function formatBook(book: any) {
    return {
        id: book._id.toString(),
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        genre: book.genre,
        readingStatus: book.readingStatus,
        totalPages: book.totalPages,
        currentPage: book.currentPage,
        language: book.language ?? "English",
        startedDate: book.startedDate ?? null,
        finishedDate: book.finishedDate ?? null,
        totalTimeSpent: book.totalTimeSpent ?? 0,
        sessionsCount: book.sessionsCount ?? 0,
        sessions: (book.sessions ?? []).map((s: any) => ({
            startPage: s.startPage,
            endPage: s.endPage,
            duration: s.duration,
            createdAt: s.createdAt,
        })),
        rating: book.rating ?? 0,
        createdAt: book.createdAt,
    };
}

export async function POST(request: Request) {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token) as {
            id: string;
            username: string;
            email: string;
        };

        const {
            title,
            author,
            coverImage,
            genre,
            readingStatus,
            totalPages,
            currentPage,
            language,
        } = await request.json();

        if (!title || !author || !genre || !totalPages) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please fill all required fields.",
                },
                { status: 400 }
            );
        }

        const book = await Book.create({
            userId: decoded.id,
            title,
            author,
            coverImage,
            genre,
            readingStatus,
            totalPages,
            currentPage,
            language: language ?? "English",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Book added successfully.",
                book: formatBook(book),
            },
            { status: 201 }
        );
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

export async function GET() {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token) as {
            id: string;
            username: string;
            email: string;
        };

        const books = await Book.find({
            userId: decoded.id,
        }).sort({
            createdAt: -1,
        });

        const formattedBooks = books.map(formatBook);

        return NextResponse.json(
            {
                success: true,
                books: formattedBooks,
            },
            { status: 200 }
        );
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
