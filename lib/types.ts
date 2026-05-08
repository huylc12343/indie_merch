export interface MerchImage {
  directus_files_id: {
    id: string;
  };
}

export interface MerchItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  merch_images?: MerchImage[]; // đổi từ merchimages → merch_images
  colors?: string[];
  sizes?: string[];
  types?: string[];
  description?: string;
  status?: string;
}

export interface CartItem {
  cartKey: string;

  id: string;

  name: string;

  price: number;

  quantity: number;

  image: string;

  selectedColor?: string | null;

  selectedSize?: string | null;

  selectedType?: string | null;
}