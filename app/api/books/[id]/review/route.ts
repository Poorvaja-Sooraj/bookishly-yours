import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";
import { formatBook, withAuth } from "@/lib/api-helpers";

export const POST = withAuth<Promise<{ id: string }>>(
  async (request, { params }, user) => {
    try {
      await connectDB();

      const { id: bookId } = await params;
      const { rating } = await request.json();
      const book = await Book.findOne({ _id: bookId, userId: user.id });
      if (!book) return NextResponse.json({ success: false, message: "Book not found." }, { status: 404 });

      if (rating !== undefined) book.rating = Number(rating);
      await book.save();
      return NextResponse.json({ success: true, message: "Book rating saved successfully.", book: formatBook(book) }, { status: 200 });
    } catch (error) {
      console.error("POST book review error:", error);
      return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
  }
);
