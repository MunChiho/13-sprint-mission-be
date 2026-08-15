import type { AuthUserSummary } from "./user";
import type { CommentWithAuthor } from "./comment";

export interface ArticleListItem {
  id: number;
  title: string;
  content: string;
  images: string[];
  likeCount: number;
  createdAt: Date;
  owner: AuthUserSummary | null;
  isLiked: boolean;
}

export interface ArticleRecord {
  id: number;
  title: string;
  content: string;
  images: string[];
  likeCount: number;
  ownerId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ArticleDetail = ArticleRecord & {
  owner: AuthUserSummary | null;
  comments: CommentWithAuthor[];
  isLiked: boolean;
};

export interface ArticleLikeResult {
  id: number;
  likeCount: number;
  isLiked: boolean;
}

export type ArticleOrderBy = "recent" | "like";

export interface CreateArticleBody {
  title: string;
  content: string;
  images?: string[];
}

export type UpdateArticleBody = Partial<CreateArticleBody>;

export interface GetArticlesQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  orderBy?: ArticleOrderBy;
}
