export enum EOrderStatus {
  /**
   * создан
   */
  CREATED = 'created',
  /**
   * собирается
   */
  ASSEMBLING = 'assembling',
  /**
   * в пути
   */
  DELIVERING = 'delivering',
  /**
   * завершён
   */
  COMPLETED = 'completed',
  /**
   * отменён
   */
  CANCELLED = 'cancelled'
}
