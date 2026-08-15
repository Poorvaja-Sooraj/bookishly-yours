import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";
import { verifyToken } from "@/lib/jwt";

/**
 * POST /api/books/[id]/session
 *
 * Records a completed reading session.
 * Body: { startPage: number, endPage: number, duration: number (seconds) }
 *
 * Updates:
 * - currentPage -> endPage
 * - totalTimeSpent += duration
 * - sessionsCount += 1
 * - sessions[] -> push new session
 * - startedDate -> set if currently null
 * - readingStatus -> "Completed" + finishedDate if endPage >= totalPages
 * - readingStatus -> "Currently Reading" if not already complete
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token) as {
            id: string;
            username: string;
            email: string;
        };

        const { id } = await params;

        const { startPage, endPage, duration } = await request.json();

        if (
            startPage === undefined ||
            endPage === undefined ||
            duration === undefined
        ) {
            return NextResponse.json(
                { success: false, message: "startPage, endPage and duration are required." },
                { status: 400 }
            );
        }

        const book = await Book.findOne({
            _id: id,
            userId: decoded.id,
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

        const updatedBook = {
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
            sessions: (book.sessions ?? []).map((s: {
                startPage: number;
                endPage: number;
                duration: number;
                createdAt: Date;
            }) => ({
                startPage: s.startPage,
                endPage: s.endPage,
                duration: s.duration,
                createdAt: s.createdAt,
            })),
            rating: book.rating ?? 0,
            createdAt: book.createdAt,
        };

        return NextResponse.json(
            {
                success: true,
                message: "Reading session recorded successfully.",
                book: updatedBook,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
