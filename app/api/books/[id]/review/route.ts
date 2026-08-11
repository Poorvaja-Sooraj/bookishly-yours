import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";
import { verifyToken } from "@/lib/jwt";

function formatBook(book: any) {
  return {
    id: book._id.toString(), title: book.title, author: book.author, coverImage: book.coverImage,
    genre: book.genre, readingStatus: book.readingStatus, totalPages: book.totalPages,
    currentPage: book.currentPage, language: book.language ?? "English",
    startedDate: book.startedDate ?? null, finishedDate: book.finishedDate ?? null,
    totalTimeSpent: book.totalTimeSpent ?? 0, sessionsCount: book.sessionsCount ?? 0,
    sessions: (book.sessions ?? []).map((s: any) => ({ startPage: s.startPage, endPage: s.endPage, duration: s.duration, createdAt: s.createdAt })),
    rating: book.rating ?? 0, createdAt: book.createdAt,
  };
}

async function getAuthUser(token: string | undefined) {
  if (!token) return null;
  try { return verifyToken(token) as { id: string; username: string; email: string }; } catch { return null; }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const token = (await cookies()).get("token")?.value;
    const decoded = await getAuthUser(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id: bookId } = await params;
    const { rating } = await request.json();
    const book = await Book.findOne({ _id: bookId, userId: decoded.id });
    if (!book) return NextResponse.json({ success: false, message: "Book not found." }, { status: 404 });

    if (rating !== undefined) book.rating = Number(rating);
    await book.save();
    return NextResponse.json({ success: true, message: "Book rating saved successfully.", book: formatBook(book) }, { status: 200 });
  } catch (error) {
    console.error("POST book review error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
