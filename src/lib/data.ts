import { connection } from "next/server";

import { getStore } from "./store";
import type { WorkOrder } from "./types";

export async function listWorkOrders(): Promise<WorkOrder[]> {
  await connection();
  return getStore().list();
}

export async function getWorkOrder(id: string): Promise<WorkOrder | undefined> {
  await connection();
  return getStore().get(id);
}
