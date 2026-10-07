export const TASK_CARD_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "DONE",
  "DEFERRED",
] as const;

export type TaskCardStatus = (typeof TASK_CARD_STATUSES)[number];

export type WorkOrderStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

export type TaskCard = {
  id: string;
  title: string;
  /** ATA chapter, e.g. "32" for landing gear */
  ata: string;
  status: TaskCardStatus;
};

export type WorkOrder = {
  id: string;
  /** Aircraft registration, e.g. 9M-AQA */
  tail: string;
  aircraftType: string;
  station: string;
  title: string;
  openedOn: string;
  status: WorkOrderStatus;
  closedAt: string | null;
  taskCards: TaskCard[];
};

export function isTaskCardStatus(value: unknown): value is TaskCardStatus {
  return TASK_CARD_STATUSES.includes(value as TaskCardStatus);
}

export function progress(order: WorkOrder): { done: number; total: number } {
  const done = order.taskCards.filter(
    (card) => card.status === "DONE" || card.status === "DEFERRED",
  ).length;
  return { done, total: order.taskCards.length };
}
