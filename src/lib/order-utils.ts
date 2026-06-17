/**
 * Order creation helpers — use when checkout API is implemented (DATA-017).
 * Keeps order + items + stock updates atomic inside a single transaction.
 */
import { Prisma, OrderStatus } from '@prisma/client';
import { db } from '@/lib/db';

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
  price: number;
  color?: string | null;
  size?: string | null;
};

export type CreateOrderInput = {
  userId: string;
  total: number;
  status?: OrderStatus;
  items: CreateOrderItemInput[];
};

/**
 * Creates an order and its line items atomically.
 * Stock decrement can be added here once ProductSize exposes quantity (DATA-007).
 */
export async function createOrderWithItems(input: CreateOrderInput) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId: input.userId,
        total: input.total,
        status: input.status ?? OrderStatus.pending,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            color: item.color ?? null,
            size: item.size ?? null,
          })),
        },
      },
      include: { items: true },
    });

    return order;
  });
}

export type StockDecrementInput = {
  productId: string;
  sizeLabel: string;
};

/** Marks a size as out of stock inside a transaction (boolean stock model). */
export async function markSizeOutOfStock(
  tx: Prisma.TransactionClient,
  input: StockDecrementInput,
) {
  return tx.productSize.updateMany({
    where: { productId: input.productId, label: input.sizeLabel },
    data: { outOfStock: true },
  });
}
