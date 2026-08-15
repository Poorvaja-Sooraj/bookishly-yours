import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Capsule from "@/models/Capsule";
import Book from "@/models/Book";
import { formatCapsule, withAuth } from "@/lib/api-helpers";

export const GET = withAuth<Promise<{ id: string }>>(
  async (request, { params }, user) => {
    try {
      await connectDB();

      const { id: bookId } = await params;

      if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return NextResponse.json(
          { success: false, message: "Invalid book ID" },
          { status: 400 }
        );
      }

      const capsules = await Capsule.find({
        userId: user.id,
        bookId: bookId,
      }).sort({ createdAt: -1 });

      const formattedCapsules = capsules.map(formatCapsule);

      return NextResponse.json(
        {
          success: true,
          capsules: formattedCapsules,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("GET capsules error:", error);
      return NextResponse.json(
        { success: false, message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);

export const POST = withAuth<Promise<{ id: string }>>(
  async (request, { params }, user) => {
    try {
      await connectDB();

      const { id: bookId } = await params;

      if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return NextResponse.json(
          { success: false, message: "Invalid book ID" },
          { status: 400 }
        );
      }

      // Check if book exists and belongs to user
      const book = await Book.findOne({ _id: bookId, userId: user.id });
      if (!book) {
        return NextResponse.json(
          { success: false, message: "Book not found" },
          { status: 404 }
        );
      }

      const body = await request.json();
      const { type, content, color, audioUrl, audioDuration, imageUrl, caption, sessionId } = body;

      if (!type || !["text", "voice", "photo"].includes(type)) {
        return NextResponse.json(
          { success: false, message: "Invalid capsule type" },
          { status: 400 }
        );
      }

      // Auto-link session ID if not passed, by picking latest session from book.sessions
      let linkedSessionId = sessionId || null;
      if (!linkedSessionId && book.sessions && book.sessions.length > 0) {
        const lastSession = book.sessions[book.sessions.length - 1];
        linkedSessionId = lastSession._id || null;
      }

      const capsule = await Capsule.create({
        userId: user.id,
        bookId,
        sessionId: linkedSessionId,
        type,
        content: content || "",
        color: color || "#FAF7F2",
        audioUrl: audioUrl || "",
        audioDuration: audioDuration || 0,
        imageUrl: imageUrl || "",
        caption: caption || "",
      });

      return NextResponse.json(
        {
          success: true,
          message: "Capsule item added successfully",
          capsule: formatCapsule(capsule),
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("POST capsule error:", error);
      return NextResponse.json(
        { success: false, message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);
