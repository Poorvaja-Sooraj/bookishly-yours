export type ReadingStatus = "Completed" | "Currently Reading" | "Want to Read";

export interface ReadingSession {
  startPage: number;
  endPage: number;
  duration: number; // seconds
  createdAt: string | Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  genre: string;
  readingStatus: ReadingStatus;
  totalPages: number;
  currentPage: number;

  // Extended reading tracking fields
  language?: string;
  startedDate?: string | Date | null;
  finishedDate?: string | Date | null;
  totalTimeSpent?: number; // seconds
  sessionsCount?: number;
  sessions?: ReadingSession[];
  rating?: number;
  createdAt?: string | Date;

  // UI-only fields
  coverBg?: string;
  coverTextColor?: string;
  coverAccentColor?: string;
}
