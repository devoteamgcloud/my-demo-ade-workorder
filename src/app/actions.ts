"use server";

import { refresh } from "next/cache";

import { getStore } from "@/lib/store";
import { isTaskCardStatus } from "@/lib/types";

export async function updateTaskCard(
  orderId: string,
  cardId: string,
  formData: FormData,
) {
  const status = formData.get("status");
  if (!isTaskCardStatus(status)) throw new Error("Invalid task card status");
  getStore().updateTaskCard(orderId, cardId, status);
  refresh();
}

export async function closeWorkOrder(orderId: string) {
  getStore().close(orderId);
  refresh();
}
