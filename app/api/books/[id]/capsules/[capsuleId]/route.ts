import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Capsule from "@/models/Capsule";
import { verifyToken } from "@/lib/jwt";

function formatCapsule(capsule: any) {
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; capsuleId: string }> }
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

    const { id: bookId, capsuleId } = await params;

    const body = await request.json();
    const { content, color } = body;

    const capsule = await Capsule.findOneAndUpdate(
      {
        _id: capsuleId,
        bookId,
        userId: decoded.id,
      },
      {
        ...(content !== undefined && { content }),
        ...(color !== undefined && { color }),
      },
      { new: true }
    );

    if (!capsule) {
      return NextResponse.json(
        { success: false, message: "Capsule item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Capsule item updated successfully",
        capsule: formatCapsule(capsule),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT capsule error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; capsuleId: string }> }
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

    const { id: bookId, capsuleId } = await params;

    const capsule = await Capsule.findOneAndDelete({
      _id: capsuleId,
      bookId,
      userId: decoded.id,
    });

    if (!capsule) {
      return NextResponse.json(
        { success: false, message: "Capsule item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Capsule item deleted successfully",
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

