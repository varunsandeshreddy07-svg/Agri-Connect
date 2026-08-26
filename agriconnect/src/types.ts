export type VerificationLevel = 'basic' | 'land_verified' | 'gold_certified';

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  avatar: string;
  rating: number;
  totalReviews: number;
  verificationLevel: VerificationLevel;
  verifiedDocs: {
    kisanId?: boolean;
    landRecord?: boolean;
    soilHealthCard?: boolean;
    organicApeda?: boolean;
  };
  memberSince: string;
  totalSoldQuintals: number;
  bio?: string;
}

export type CropCategory = 
  | 'Grains'
  | 'Pulses'
  | 'Vegetables'
  | 'Fruits'
  | 'Spices'
  | 'Oilseeds'
  | 'Cash Crops';

export type CropGrade = 'Grade A+' | 'Grade A' | 'Grade B';

export type StorageType = 'Dry Ventilated Shed' | 'Cold Storage' | 'Warehouse' | 'Farm Packhouse';

export interface CropListing {
  id: string;
  title: string;
  cropName: string;
  variety: string;
  category: CropCategory;
  quantity: number;
  unit: 'kg' | 'quintals' | 'tonnes';
  pricePerUnit: number;
  mandiBenchmarkPrice: number;
  minOrderQuantity: number;
  harvestDate: string;
  location: string;
  state: string;
  grade: CropGrade;
  isOrganic: boolean;
  organicCertNumber?: string;
  storageType: StorageType;
  moistureContent: number; // e.g. 11.5%
  images: string[];
  description: string;
  farmerId: string;
  farmer: Farmer;
  status: 'available' | 'reserved' | 'sold';
  createdAt: string;
  tags: string[];
}

export interface TradeOffer {
  id: string;
  cropId: string;
  cropTitle: string;
  proposedPrice: number;
  proposedQuantity: number;
  unit: string;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  notes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'farmer';
  recipientId: string;
  text: string;
  timestamp: string;
  offerDetails?: TradeOffer;
  read: boolean;
}

export interface Conversation {
  id: string;
  otherParty: {
    id: string;
    name: string;
    role: 'buyer' | 'farmer';
    avatar: string;
    verificationLevel: VerificationLevel;
    phone: string;
    location: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  cropContext?: {
    id: string;
    title: string;
    price: number;
    quantity: number;
    unit: string;
    image: string;
  };
  messages: ChatMessage[];
}

export interface MarketPriceTickerItem {
  id: string;
  crop: string;
  market: string;
  mandiPrice: number;
  directPrice: number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export interface UserRole {
  type: 'buyer' | 'farmer' | 'demo';
  currentUser: {
    id: string;
    name: string;
    role: 'buyer' | 'farmer';
    avatar: string;
    organizationOrFarm: string;
    location: string;
    phone: string;
    verificationLevel: VerificationLevel;
  };
}
