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

async function getAuthUser(token: string | undefined) {
    if (!token) return null;
    return verifyToken(token) as { id: string; username: string; email: string };
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const decoded = await getAuthUser(token);
        if (!decoded) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const book = await Book.findOne({
            _id: id,
            userId: decoded.id,
        });

        if (!book) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Book not found.",
                },
                { status: 404 }
            );
        }

        await Book.findByIdAndDelete(id);

        return NextResponse.json(
            {
                success: true,
                message: "Book deleted successfully.",
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

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const decoded = await getAuthUser(token);
        if (!decoded) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const {
            title,
            author,
            coverImage,
            genre,
            readingStatus,
            totalPages,
            currentPage,
            language,
            startedDate,
            finishedDate,
        } = await request.json();

        const book = await Book.findOne({
            _id: id,
            userId: decoded.id,
        });

        if (!book) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Book not found.",
                },
                { status: 404 }
            );
        }

        book.title = title;
        book.author = author;
        book.coverImage = coverImage;
        book.genre = genre;
        book.readingStatus = readingStatus;
        book.totalPages = totalPages;
        book.currentPage = currentPage;
        if (language !== undefined) book.language = language;
        if (startedDate !== undefined) book.startedDate = startedDate;
        if (finishedDate !== undefined) book.finishedDate = finishedDate;

        await book.save();

        return NextResponse.json(
            {
                success: true,
                message: "Book updated successfully.",
                book: formatBook(book),
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
