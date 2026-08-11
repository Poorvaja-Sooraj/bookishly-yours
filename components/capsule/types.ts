export type CapsuleType = "text" | "voice" | "photo";

export interface CapsuleItem {
  id: string;
  userId: string;
  bookId: string;
  sessionId?: string | null;
  type: CapsuleType;
  content?: string;
  color?: string;
  audioUrl?: string;
  audioDuration?: number;
  imageUrl?: string;
  caption?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}
