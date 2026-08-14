import type { AuthUserSummary } from "./user";

export type CommentAuthor = AuthUserSummary;

export interface CommentWithAuthor {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: CommentAuthor | null;
}

export type CommentDraft = Omit<CommentWithAuthor, "author">;

export interface CursorListResponse<T> {
  list: T[];
  nextCursor: number | null;
}