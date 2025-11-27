import type { IUnit } from 'src/types/unit.interface';

export interface IProduct {
  id?: number | null
  name?: string
  description?: string
  category_id?: number | null
  unit_id?: number | null
  qty?: number | null
  old_price?: number | null
  origin_country?: string
  price?: number | null
  images?: any
  unit: IUnit | null
  unit_name?: string
}
