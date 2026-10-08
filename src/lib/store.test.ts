import { beforeEach, describe, expect, it } from "vitest";

import { WorkOrderStore } from "./store";
import {
  canCloseWorkOrder,
  getOutstandingTaskCards,
  isTaskCardComplete,
  progress,
} from "./types";

let store: WorkOrderStore;

beforeEach(() => {
  store = WorkOrderStore.seeded();
});

describe("WorkOrderStore", () => {
  it("lists work orders newest first", () => {
    const ids = store.list().map((wo) => wo.id);
    expect(ids.length).toBeGreaterThanOrEqual(10);
    expect(ids).toEqual([...ids].sort().reverse());
  });

  it("returns undefined for an unknown work order", () => {
    expect(store.get("WO-0000")).toBeUndefined();
  });

  it("does not share state between stores", () => {
    store.updateTaskCard("WO-1042", "TC-3", "DONE");
    const fresh = WorkOrderStore.seeded();
    expect(fresh.get("WO-1042")?.taskCards[2].status).toBe("OPEN");
  });

  it("updates a task card status", () => {
    store.updateTaskCard("WO-1042", "TC-3", "DONE");
    expect(store.get("WO-1042")?.taskCards[2].status).toBe("DONE");
  });

  it("moves an open work order to in progress when work starts", () => {
    store.updateTaskCard("WO-1040", "TC-1", "IN_PROGRESS");
    expect(store.get("WO-1040")?.status).toBe("IN_PROGRESS");
  });

  it("throws for an unknown task card", () => {
    expect(() => store.updateTaskCard("WO-1042", "TC-9", "DONE")).toThrow();
  });

  it("closes a work order", () => {
    const order = store.close("WO-1038");
    expect(order.status).toBe("CLOSED");
    expect(order.closedAt).not.toBeNull();
  });
});

describe("progress", () => {
  it("counts done and deferred cards", () => {
    expect(progress(store.get("WO-1039")!)).toEqual({ done: 2, total: 2 });
    expect(progress(store.get("WO-1042")!)).toEqual({ done: 2, total: 4 });
  });
});

describe("domain task completion helpers", () => {
  it("identifies complete and incomplete statuses", () => {
    expect(isTaskCardComplete("DONE")).toBe(true);
    expect(isTaskCardComplete("DEFERRED")).toBe(true);
    expect(isTaskCardComplete("OPEN")).toBe(false);
    expect(isTaskCardComplete("IN_PROGRESS")).toBe(false);
  });

  it("finds outstanding task cards on a work order", () => {
    const order = store.get("WO-1042")!; // TC-1 DONE, TC-2 DONE, TC-3 OPEN, TC-4 OPEN
    const outstanding = getOutstandingTaskCards(order);
    expect(outstanding.map((c) => c.id)).toEqual(["TC-3", "TC-4"]);
    expect(canCloseWorkOrder(order)).toBe(false);
  });

  it("allows closing when all task cards are DONE or DEFERRED", () => {
    const orderDone = store.get("WO-1038")!; // TC-1 DONE, TC-2 DONE
    expect(getOutstandingTaskCards(orderDone)).toEqual([]);
    expect(canCloseWorkOrder(orderDone)).toBe(true);

    const orderDeferred = store.get("WO-1039")!; // TC-1 DONE, TC-2 DEFERRED
    expect(getOutstandingTaskCards(orderDeferred)).toEqual([]);
    expect(canCloseWorkOrder(orderDeferred)).toBe(true);
  });

  it("does not allow closing an already closed work order", () => {
    const closedOrder = store.get("WO-1036")!;
    expect(closedOrder.status).toBe("CLOSED");
    expect(canCloseWorkOrder(closedOrder)).toBe(false);
  });
});

