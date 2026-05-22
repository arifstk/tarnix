// types/index.ts — Shared TypeScript interfaces across the app

export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  cloudinaryId: string;
  category: string | ICategory;
  createdAt?: string;
}

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  count?: string; // populated by backend for admin 
  createdAt?: string;
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  image?: string;
  role: "user" | "admin" |"deliveryBoy";
}

