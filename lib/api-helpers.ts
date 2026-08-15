import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Types } from "mongoose";
import { verifyToken, type AuthUserJwtPayload } from "@/lib/jwt";

export type { AuthUserJwtPayload };

export interface BookSession {
  startPage: number;
  endPage: number;
  duration: number;
  createdAt?: Date;
}

export interface BookData {
  _id: {
    toString(): string;
  };
  title: string;
  author: string;
  coverImage?: string;
  genre?: string;
  readingStatus: string;
  totalPages: number;
  currentPage: number;
  language?: string;
  startedDate?: Date | null;
  finishedDate?: Date | null;
  totalTimeSpent?: number;
  sessionsCount?: number;
  sessions?: BookSession[];
  rating?: number;
  createdAt?: Date;
}

export interface CapsuleData {
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

export function formatBook(book: BookData) {
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
    sessions: (book.sessions ?? []).map((s) => ({
      startPage: s.startPage,
      endPage: s.endPage,
      duration: s.duration,
      createdAt: s.createdAt,
    })),
    rating: book.rating ?? 0,
    createdAt: book.createdAt,
  };
}

export function formatCapsule(capsule: CapsuleData) {
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

export async function getAuthUser(token: string | undefined): Promise<AuthUserJwtPayload | null> {
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export type AuthenticatedRouteHandler<Params = unknown> = (
  request: Request,
  context: { params: Params },
  user: AuthUserJwtPayload
) => Promise<Response> | Response;

export function withAuth<Params = unknown>(handler: AuthenticatedRouteHandler<Params>) {
  return async (request: Request, context: { params: Params }) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = await getAuthUser(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return handler(request, context, user);
  };
}
