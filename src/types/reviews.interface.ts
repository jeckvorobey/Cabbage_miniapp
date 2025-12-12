export interface IReviews {
  id?: number | null;
  product_id?: number | null;
  user_id?: number | null;
  order_id?: number | null;
  order_item_id?: number | null;
  text?: string;
  images?: any[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}
