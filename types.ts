// Data Models matching the MongoDB Schema

export enum ServiceCategory {
  PLUMBING = 'Plumbing',
  ELECTRICAL = 'Electrical',
  RENOVATION = 'Renovation',
  CLEANING = 'Cleaning',
  MOVING = 'Moving',
  LOCKSMITH = 'Locksmith'
}

export type Language = 'en' | 'he' | 'ar';
export type UserRole = 'user' | 'professional' | 'admin';
export type RequestStatus = 'open' | 'quoted' | 'in_progress' | 'completed' | 'cancelled';
export type QuoteStatus = 'pending' | 'accepted' | 'rejected';

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar: string;
  role: UserRole;
  language: Language;
  location?: GeoLocation;
  createdAt: number;
}

export interface Professional {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  coverImage: string;
  category: ServiceCategory;
  rating: number;
  reviewCount: number;
  location: GeoLocation;
  distance?: number; // Runtime calc
  hourlyRate: number;
  isAvailable: boolean;
  description: string;
  gallery: string[];
  stories: Story[];
  verified: boolean;
  tags: string[];
}

export interface Story {
  id: string;
  imageUrl: string;
  title: string;
  type: 'image' | 'video';
  duration: number; // seconds
  timestamp: number;
}

export interface ServiceRequest {
  id: string;
  userId: string;
  category: ServiceCategory;
  description: string;
  images: string[];
  status: RequestStatus;
  urgency: 'low' | 'medium' | 'high';
  budget?: number;
  location: GeoLocation;
  createdAt: number;
}

export interface Quote {
  id: string;
  requestId: string;
  proId: string;
  proName: string;
  proAvatar: string;
  price: number;
  description: string;
  estimatedTime: string; // e.g., "2 hours"
  status: QuoteStatus;
  valueScore?: number; // Computed score for "Best Value" badge
  createdAt: number;
}

export interface Contract {
  id: string;
  requestId: string;
  quoteId: string;
  clientName: string;
  proName: string;
  serviceTitle: string;
  status: 'draft' | 'pending_signature' | 'signed' | 'completed';
  price: number;
  terms: string;
  clientSignature?: string; // base64 or timestamp
  proSignature?: string;
  dateCreated: string;
  dateSigned?: string;
}

export interface HistoryEvent {
  id: string;
  userId: string;
  action: 'login' | 'search' | 'view_pro' | 'create_request' | 'chat_message' | 'sign_contract';
  metadata?: any;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: 'user' | 'ai' | 'pro';
  text: string;
  imageUrl?: string;
  timestamp: number;
  isSystemMessage?: boolean;
}