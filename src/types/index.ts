import type {
  Post,
  User,
  Tag,
  Comment,
  Like,
  Bookmark,
  Series,
  Interest,
  Notification,
} from "@prisma/client";

export type PostWithAuthor = Post & {
  author: Pick<User, "id" | "name" | "image" | "bio">;
  tags: { tag: Tag }[];
  _count: {
    likes: number;
    comments: number;
    bookmarks: number;
    reactions: number;
  };
};

export type PostWithDetails = PostWithAuthor & {
  comments: CommentWithAuthor[];
  likes: Like[];
  bookmarks: Bookmark[];
  reactions: ReactionGroup[];
  series?: Pick<Series, "id" | "title" | "slug"> | null;
};

export type CommentWithAuthor = Comment & {
  author: Pick<User, "id" | "name" | "image">;
  replies?: CommentWithAuthor[];
};

export type UserProfile = User & {
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  interests?: { interest: Interest }[];
};

export type FeedPost = PostWithAuthor & {
  isLiked?: boolean;
  isBookmarked?: boolean;
  userReactions?: string[];
};

export type ReactionGroup = {
  emoji: string;
  count: number;
  reacted: boolean;
};

export type SeriesWithPosts = Series & {
  author: Pick<User, "id" | "name" | "image">;
  posts: Pick<
    Post,
    "id" | "title" | "slug" | "excerpt" | "readTime" | "publishedAt"
  >[];
  _count: { posts: number };
};

export type SearchResult = {
  posts: PostWithAuthor[];
  total: number;
  query: string;
};

export type NotificationWithDetails = Notification & {
  actor: Pick<User, "id" | "name" | "image">;
  recipient: Pick<User, "id" | "name" | "image">;
};

export type DashboardStats = {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalPosts: number;
};

export const REACTION_EMOJIS = ["👍", "❤️", "🔥", "🎉", "🤔", "👀"] as const;

export const INTERESTS = [
  { name: "Technology", icon: "💻", color: "#3B82F6" },
  { name: "Programming", icon: "🧑‍💻", color: "#8B5CF6" },
  { name: "AI & ML", icon: "🤖", color: "#EC4899" },
  { name: "Web Development", icon: "🌐", color: "#06B6D4" },
  { name: "Mobile Dev", icon: "📱", color: "#F97316" },
  { name: "Data Science", icon: "📊", color: "#14B8A6" },
  { name: "DevOps", icon: "⚙️", color: "#6366F1" },
  { name: "Cybersecurity", icon: "🔒", color: "#EF4444" },
  { name: "Design", icon: "🎨", color: "#F59E0B" },
  { name: "Productivity", icon: "🚀", color: "#10B981" },
  { name: "Startups", icon: "💡", color: "#84CC16" },
  { name: "Open Source", icon: "🌟", color: "#A855F7" },
] as const;
