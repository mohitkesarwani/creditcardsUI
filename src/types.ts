export interface Review {
  name: string;
  comment: string;
  timestamp: number;
  stars: number; // 1-5
}

export interface Product {
  id: string;
  name: string;
  likes: number;
  shares: number;
  comments: number;
  rating: number; // 0-5 average
  reviews: Review[];
}
