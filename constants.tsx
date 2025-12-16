
import React from 'react';
import { Smartphone, Utensils, Shirt, Wrench, Watch, MoreHorizontal, BookOpen } from 'lucide-react';
import { Category, Product, User, Condition, ChatConversation } from './types';

export const CURRENT_USER_ID = 'me';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Gadget', icon: <Smartphone className="w-5 h-5" /> },
  { id: '2', name: 'Books', icon: <BookOpen className="w-5 h-5" /> },
  { id: '3', name: 'Foods', icon: <Utensils className="w-5 h-5" /> },
  { id: '4', name: 'Clothes & Body wears', icon: <Shirt className="w-5 h-5" /> },
  { id: '5', name: 'Services', icon: <Wrench className="w-5 h-5" /> },
  { id: '6', name: 'Accessories', icon: <Watch className="w-5 h-5" /> },
  { id: '7', name: 'Others', icon: <MoreHorizontal className="w-5 h-5" /> },
];

export const MOCK_USERS: Record<string, User> = {
  'u1': {
    id: 'u1',
    name: 'Chioma Adebayo',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    rating: 4.9,
    joinedDate: 'Jan 2023',
    location: 'Lagos',
    university: 'UNILAG',
    department: 'Economics',
    bio: 'I sell used textbooks and gadgets.',
    phone: '08012345678',
    email: 'chioma@unilag.edu.ng'
  },
  'u2': {
    id: 'u2',
    name: 'Emmanuel K.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    isVerified: false,
    rating: 4.2,
    joinedDate: 'Mar 2024',
    location: 'Abuja',
    university: 'UniAbuja',
    department: 'Civil Engineering',
    bio: 'Fast deals only.',
    phone: '09087654321',
    email: 'emma@uniabuja.edu.ng'
  },
  'me': {
    id: 'me',
    name: 'David O.',
    avatar: '', // Empty initially to test ME icon fallback
    isVerified: true,
    rating: 5.0,
    joinedDate: 'Dec 2022',
    location: 'Lagos',
    university: 'Yabatech',
    department: 'Computer Science',
    bio: 'Tech enthusiast and student developer.',
    phone: '08123456789',
    email: 'david@yabatech.edu.ng',
    state: 'Lagos'
  }
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Calculus Early Transcendentals (8th Ed)',
    price: 4500,
    currency: '₦',
    category: 'Books', 
    condition: Condition.Used,
    description: 'Clean textbook, minimal highlighting. Essential for Engineering Year 1. Pick up at Engineering faculty.',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80'
    ],
    location: 'UNILAG Campus',
    postedDate: '2 hours ago',
    seller: MOCK_USERS['u1'],
    views: 124,
    isFeatured: true,
    isNegotiable: true,
    status: 'active'
  },
  {
    id: 'p2',
    title: 'iPhone 12 Pro - 128GB Pacific Blue',
    price: 350000,
    currency: '₦',
    category: 'Gadget',
    condition: Condition.Used,
    description: 'UK Used, flawless screen. Battery health 88%. Comes with a free case.',
    images: [
      'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80'
    ],
    location: 'Yaba',
    postedDate: '5 hours ago',
    seller: MOCK_USERS['u2'],
    views: 89,
    isFeatured: false,
    isNegotiable: true,
    status: 'active'
  },
  {
    id: 'p3',
    title: 'HP Pavilion 15 Gaming Laptop',
    price: 450000,
    currency: '₦',
    category: 'Gadget',
    condition: Condition.Used,
    description: 'Core i7, 16GB RAM, 512GB SSD, GTX 1650. Perfect for architecture students or gamers.',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
    ],
    location: 'Hostel A',
    postedDate: '1 day ago',
    seller: MOCK_USERS['u1'],
    views: 342,
    isFeatured: true,
    isNegotiable: true,
    status: 'active'
  },
    {
    id: 'p4',
    title: 'Small Generator (Tiger)',
    price: 45000,
    currency: '₦',
    category: 'Others',
    condition: Condition.Used,
    description: 'Selling because I am graduating. Works perfectly, just needs servicing.',
    images: [
      'https://plus.unsplash.com/premium_photo-1663040325491-b3711979b936?auto=format&fit=crop&w=600&q=80'
    ],
    location: 'Off-campus',
    postedDate: '30 mins ago',
    seller: MOCK_USERS['u2'],
    views: 12,
    isFeatured: false,
    isNegotiable: true,
    status: 'active'
  }
];

export const MOCK_CHATS: ChatConversation[] = [
  {
    id: 'c1',
    participant: MOCK_USERS['u1'],
    lastMessage: 'Can we meet at the library?',
    lastMessageTime: '10:30 AM',
    unreadCount: 1,
    product: MOCK_PRODUCTS[0]
  },
  {
    id: 'c2',
    participant: MOCK_USERS['u2'],
    lastMessage: 'No problem, send the money.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    product: MOCK_PRODUCTS[1]
  }
];
