import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose, { Types } from "mongoose";
import connectDB from "@/lib/mongodb";
import Capsule from "@/models/Capsule";
import Book from "@/models/Book";
import { verifyToken } from "@/lib/jwt";

interface CapsuleData {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  sessionId?: Types.ObjectId | null;
  type: "text" | "voice" | "photo";
  content?: string;
  color?: string;
  audioUrl?: string;
  audioDuration?: number;
  imageUrl?: string;
  caption?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function formatCapsule(capsule: CapsuleData) {
  return {
    id: capsule._id.toString(),
    userId: capsule.userId.toString(),
    bookId: capsule.bookId.toString(),
    sessionId: capsule.sessionId ? capsule.sessionId.toString() : null,
    type: capsule.type,
    content: capsule.content ?? "",
    color: capsule.color ?? "#FAF7F2",
    audioUrl: capsule.audioUrl ?? "",
    audioDuration: capsule.audioDuration ?? 0,
    imageUrl: capsule.imageUrl ?? "",
    caption: capsule.caption ?? "",
    createdAt: capsule.createdAt,
    updatedAt: capsule.updatedAt,
  };
}

async function getAuthUser(token: string | undefined) {
  if (!token) return null;
  try {
    return verifyToken(token) as { id: string; username: string; email: string };
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const decoded = await getAuthUser(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: bookId } = await params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return NextResponse.json(
        { success: false, message: "Invalid book ID" },
        { status: 400 }
      );
    }

    const capsules = await Capsule.find({
      userId: decoded.id,
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const decoded = await getAuthUser(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: bookId } = await params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return NextResponse.json(
        { success: false, message: "Invalid book ID" },
        { status: 400 }
      );
    }

    // Check if book exists and belongs to user
    const book = await Book.findOne({ _id: bookId, userId: decoded.id });
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
      userId: decoded.id,
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
