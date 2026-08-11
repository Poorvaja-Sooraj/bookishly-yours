import mongoose, { Schema, Document, models } from "mongoose";

export interface IReadingSession {
    startPage: number;
    endPage: number;
    duration: number; // seconds
    createdAt: Date;
}

export interface IBook extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    author: string;
    coverImage: string;
    genre: string;
    readingStatus: string;
    totalPages: number;
    currentPage: number;
    language: string;
    startedDate: Date | null;
    finishedDate: Date | null;
    totalTimeSpent: number; // seconds
    sessionsCount: number;
    sessions: IReadingSession[];
    rating: number;
}

const ReadingSessionSchema = new Schema(
    {
        startPage: { type: Number, required: true },
        endPage: { type: Number, required: true },
        duration: { type: Number, required: true, default: 0 }, // seconds
    },
    { timestamps: true }
);

const BookSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        author: {
            type: String,
            required: true,
            trim: true,
        },

        coverImage: {
            type: String,
            default: "",
        },

        genre: {
            type: String,
            required: true,
            trim: true,
        },

        readingStatus: {
            type: String,
            enum: [
                "Want to Read",
                "Currently Reading",
                "Completed",
            ],
            default: "Want to Read",
        },

        totalPages: {
            type: Number,
            required: true,
            min: 1,
        },

        currentPage: {
            type: Number,
            default: 0,
            min: 0,
        },

        language: {
            type: String,
            default: "English",
            trim: true,
        },

        startedDate: {
            type: Date,
            default: null,
        },

        finishedDate: {
            type: Date,
            default: null,
        },

        totalTimeSpent: {
            type: Number,
            default: 0, // seconds
        },

        sessionsCount: {
            type: Number,
            default: 0,
        },

        sessions: {
            type: [ReadingSessionSchema],
            default: [],
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
    },
    {
        timestamps: true,
    }
);

const Book =
    models.Book || mongoose.model<IBook>("Book", BookSchema);

export default Book;
