export interface AuthUserSummary {
  id: number;
  email: string;
  nickname: string;
  image: string | null;
}

export interface UserProfile extends AuthUserSummary {
  createdAt: Date;
  updatedAt: Date;
}
