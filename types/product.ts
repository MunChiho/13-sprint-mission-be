import type { AuthUserSummary } from "./user.js";
import type { CommentWithAuthor } from "./comment.js";

export interface ProductListItem {
  id: number;
  name: string;
  price: number;
  images: string[];
  likeCount: number;
  createdAt: Date;
  isLiked: boolean;
}

export interface ProductRecord {
  id: number;
  name: string;
  description: string;
  price: number;
  tags: string[];
  images: string[];
  likeCount: number;
  ownerId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductDetail = ProductRecord & {
  owner: AuthUserSummary | null;
  comments: CommentWithAuthor[];
  isLiked: boolean;
};

export interface ProductLikeResult {
  id: number;
  likeCount: number;
  isLiked: boolean;
}

export type ProductOrderBy = "recent" | "like";

export interface CreateProductBody {
  name: string;
  description: string;
  price: number;
  tags?: string[];
  images?: string[];
}

export type UpdateProductBody = Partial<CreateProductBody>;

export interface GetProductsQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  orderBy?: ProductOrderBy;
}