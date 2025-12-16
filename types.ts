import React from 'react';

export interface User {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  rating: number;
  joinedDate: string;
  location: string;
  university?: string;
  department?: string;
  bio?: string;
  phone?: string;
  email?: string;
  state?: string;
}

export enum Condition {
  New = 'New',
  Used = 'Used',
  Refurbished = 'Refurbished',
}

export type ProductStatus = 'active' | 'sold';

export interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  condition: Condition;
  description: string;
  images: string[];
  location: string;
  postedDate: string;
  seller: User;
  views: number;
  isFeatured: boolean;
  isNegotiable: boolean;
  status?: ProductStatus; // Added for My Ads management
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  image?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read'; // Added for WhatsApp style ticks
}

export interface ChatConversation {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  product?: Product;
}