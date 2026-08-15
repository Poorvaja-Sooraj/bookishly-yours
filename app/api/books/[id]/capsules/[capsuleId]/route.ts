import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Capsule from "@/models/Capsule";
import { formatCapsule, withAuth } from "@/lib/api-helpers";

export const PUT = withAuth<Promise<{ id: string; capsuleId: string }>>(
  async (request, { params }, user) => {
    try {
      await connectDB();

      const { id: bookId, capsuleId } = await params;

      const body = await request.json();
      const { content, color } = body;

      const capsule = await Capsule.findOneAndUpdate(
        {
          _id: capsuleId,
          bookId,
          userId: user.id,
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
);

export const DELETE = withAuth<Promise<{ id: string; capsuleId: string }>>(
  async (request, { params }, user) => {
    try {
      await connectDB();

      const { id: bookId, capsuleId } = await params;

      const capsule = await Capsule.findOneAndDelete({
        _id: capsuleId,
        bookId,
        userId: user.id,
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
);

