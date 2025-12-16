export interface IProduct {
  id?: number | null;
  name?: string;
  description?: string;
  category_id?: number | null;
  qty?: number | null;
  old_price?: number | null;
  origin_country?: string;
  price?: number | null;
  images?: any;
  primary_image?: string
  available_qty?: number
}
