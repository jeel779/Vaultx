export type Role = "USER" | "ADMIN";

export type ListingStatus = "DRAFT" | "PENDING" | "VERIFIED" | "REJECTED" | "SOLD";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: Role;
  createdAt: string;
}

export interface ListingImage {
  id: string;
  imageUrl: string;
  listingId: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: "Gaming" | "Social Media" | "Other";
  platform: string;
  accountLevel: string;
  country: string;
  status: ListingStatus;
  rejectionReason?: string | null;
  sellerId: string;
  seller: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    createdAt?: string;
  };
  images: ListingImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  receiver: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  listing: {
    id: string;
    title: string;
    price: number;
  };
}

export interface Conversation {
  id: string;
  content: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    price: number;
  };
  otherUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export interface UserStats {
  DRAFT: number;
  PENDING: number;
  VERIFIED: number;
  REJECTED: number;
  SOLD: number;
  TOTAL: number;
}
