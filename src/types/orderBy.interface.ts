interface IOrderItems {
  product_id: number,
  quantity: number,
  price: number
}

export interface IOrderBy {
  items?: IOrderItems[],
  comment?: string,
  total_amount?: number,
  payment_method?: string,
  address_id?: number | null
}
