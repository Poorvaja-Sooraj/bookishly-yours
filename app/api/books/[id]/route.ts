import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";
import { formatBook, withAuth } from "@/lib/api-helpers";

export const DELETE = withAuth<Promise<{ id: string }>>(
    async (request, { params }, user) => {
        try {
            await connectDB();

            const { id } = await params;

            const book = await Book.findOne({
                _id: id,
                userId: user.id,
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
);

export const PUT = withAuth<Promise<{ id: string }>>(
    async (request, { params }, user) => {
        try {
            await connectDB();

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
                userId: user.id,
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
);
