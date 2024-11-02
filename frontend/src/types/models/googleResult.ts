export interface GoogleResult {
  type: string;
  title: string;
  description: string;
  url: string;
  is_sponsored: boolean;
  favicon?: string;
  thumbnail?: string;
  videoInfo?: {
    platform: string;
    thumbnail: string;
    duration: string;
  };
} 