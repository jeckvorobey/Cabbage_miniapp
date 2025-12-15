export interface IUser {
  id: number;
  full_name: string;
  phone: string | null;
  subscribe_news: boolean;
  role: number;
  language_code: string;
  is_premium: boolean;
  main_image_url: string;
  is_bot: boolean;
  is_user?: boolean;
  username: string;
  name: string;
  telegram_id: number;
}
