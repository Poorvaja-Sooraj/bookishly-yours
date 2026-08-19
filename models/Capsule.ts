import mongoose, { Schema, Document, models } from "mongoose";

export interface ICapsule extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  type: "text" | "voice" | "photo";
  content?: string;
  color?: string;
  audioUrl?: string;
  audioDuration?: number;
  imageUrl?: string;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CapsuleSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    type: {
      type: String,
      enum: ["text", "voice", "photo"],
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#FAF7F2",
    },
    audioUrl: {
      type: String,
      default: "",
    },
    audioDuration: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

CapsuleSchema.index({ userId: 1, bookId: 1, createdAt: -1 });

const Capsule =
  models.Capsule || mongoose.model<ICapsule>("Capsule", CapsuleSchema);

export default Capsule;
