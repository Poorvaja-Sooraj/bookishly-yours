import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";
import { formatBook, withAuth } from "@/lib/api-helpers";

/**
 * POST /api/books/[id]/session
 *
 * Records a completed reading session.
 * Records a new reading session for a book.
 * If the session is successfully added, returns the updated book details.
 */
export const POST = withAuth<Promise<{ id: string }>>(
    async (request, { params }, user) => {
        try {
            await connectDB();

            const { id } = await params;

            const { startPage, endPage, duration } = await request.json();

            // Validate fields
            if (
                startPage === undefined ||
                endPage === undefined ||
                duration === undefined
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Please provide startPage, endPage and duration.",
                    },
                    { status: 400 }
                );
            }

            const book = await Book.findOne({
                _id: id,
                userId: user.id,
            });

            if (!book) {
                return NextResponse.json(
                    { success: false, message: "Book not found." },
                    { status: 404 }
                );
            }

            // Update reading progress
            book.currentPage = Math.min(endPage, book.totalPages);
            book.totalTimeSpent = (book.totalTimeSpent ?? 0) + duration;
            book.sessionsCount = (book.sessionsCount ?? 0) + 1;

            // Push session record and mark the array as modified (required for Mongoose subdoc arrays)
            book.sessions = book.sessions ?? [];
            book.sessions.push({
                startPage,
                endPage: Math.min(endPage, book.totalPages),
                duration,
                createdAt: new Date(),
            });
            book.markModified("sessions");

            // Set startedDate on first session
            if (!book.startedDate) {
                book.startedDate = new Date();
            }

            // Mark complete if finished, else transition to Currently Reading
            if (book.currentPage >= book.totalPages) {
                book.readingStatus = "Completed";
                if (!book.finishedDate) {
                    book.finishedDate = new Date();
                }
            } else {
                book.readingStatus = "Currently Reading";
                book.finishedDate = null;
            }

            await book.save();

            const updatedBook = formatBook(book);

            return NextResponse.json(
                {
                    success: true,
                    message: "Reading session recorded successfully.",
                    book: updatedBook,
                },
                { status: 200 }
            );
        } catch (error) {
            console.error("Error recording session:", error);
            return NextResponse.json(
                { success: false, message: "Internal Server Error" },
                { status: 500 }
            );
        }
    }
);
