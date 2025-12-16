import type { EOrderStatus } from "src/enums/order-status.enum";
import type { IUser } from "./user.interface";

interface IHistoryProduct {
  name: string;
  price: number;
  product_id: number;
  quantity: number;
}

export interface IOrderHistoryItem {
  id: number;
  order_date: string;
  user: IUser;
  status: EOrderStatus;
  total_amount: number;
  is_paid?: boolean;
  items?: IHistoryProduct[];
  comment?: string;
}
