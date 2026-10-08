import { SEED_WORK_ORDERS } from "./seed";
import {
  getOutstandingTaskCards,
  type TaskCard,
  type TaskCardStatus,
  type WorkOrder,
} from "./types";

export class WorkOrderStore {
  private orders: Map<string, WorkOrder>;

  constructor(orders: WorkOrder[]) {
    this.orders = new Map(orders.map((wo) => [wo.id, wo]));
  }

  static seeded(): WorkOrderStore {
    return new WorkOrderStore(structuredClone(SEED_WORK_ORDERS));
  }

  list(): WorkOrder[] {
    return [...this.orders.values()].sort((a, b) => b.id.localeCompare(a.id));
  }

  get(orderId: string): WorkOrder | undefined {
    return this.orders.get(orderId);
  }

  updateTaskCard(
    orderId: string,
    cardId: string,
    status: TaskCardStatus,
  ): TaskCard {
    const order = this.require(orderId);
    const card = order.taskCards.find((c) => c.id === cardId);
    if (!card) throw new Error(`Task card ${cardId} not found on ${orderId}`);
    card.status = status;
    if (order.status === "OPEN" && status !== "OPEN") {
      order.status = "IN_PROGRESS";
    }
    return card;
  }

  close(orderId: string): WorkOrder {
    const order = this.require(orderId);
    if (order.status === "CLOSED") {
      throw new Error(`Work order ${orderId} is already closed`);
    }
    const outstanding = getOutstandingTaskCards(order);
    if (outstanding.length > 0) {
      const ids = outstanding.map((c) => c.id).join(", ");
      throw new Error(
        `Cannot close work order ${orderId}: task cards still outstanding (${ids})`,
      );
    }
    order.status = "CLOSED";
    order.closedAt = new Date().toISOString();
    return order;
  }

  private require(orderId: string): WorkOrder {
    const order = this.orders.get(orderId);
    if (!order) throw new Error(`Work order ${orderId} not found`);
    return order;
  }
}

const globalStore = globalThis as unknown as { workOrderStore?: WorkOrderStore };

/** Process-wide store; data resets when the server restarts. */
export function getStore(): WorkOrderStore {
  globalStore.workOrderStore ??= WorkOrderStore.seeded();
  return globalStore.workOrderStore;
}
