import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";
import { formatBook, withAuth } from "@/lib/api-helpers";

export const POST = withAuth(async (request, context, user) => {
    try {
        await connectDB();

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
            userId: user.id,
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
});

export const GET = withAuth(async (request, context, user) => {
    try {
        await connectDB();

        const books = await Book.find({
            userId: user.id,
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
});
