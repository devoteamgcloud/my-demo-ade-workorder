# Fix Work Order Closing With Open Task Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent work orders from being closed while task cards are still open or in progress, enforcing that every task card must be "DONE" or "DEFERRED" before closing, indicating which task cards are still outstanding both in the UI and via domain validation errors, verifying with Playwright, and including verification screenshots in the Pull Request.

**Architecture:** Domain logic functions (`getOutstandingTaskCards`, `canCloseWorkOrder`, `isTaskCardComplete`) are defined in `src/lib/types.ts`. The business invariant is enforced directly in `WorkOrderStore.close()` in `src/lib/store.ts` in compliance with codebase rules ("Business rules live in the store, not in pages or actions"). The work order detail page (`src/app/work-orders/[id]/page.tsx`) renders the "Close work order" button disabled when task cards remain outstanding, displaying an informative list of outstanding task card IDs. Playwright is used for E2E verification to capture screenshots across states and verify button states.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Vitest, Playwright, Tailwind CSS v4, GitHub CLI (`gh`).

---

## Goal Description

GitHub Issue [#1](https://github.com/devoteamgcloud/my-demo-ade-workorder/issues/1):
- **Problem:** When viewing a work order such as `WO-1042` (where `TC-3` and `TC-4` are still `OPEN`), clicking "Close work order" immediately marks the work order `CLOSED` even though 2 of 4 task cards are incomplete.
- **Requirement:** A work order can only be closed when every task card is `DONE` or `DEFERRED`. Otherwise, the system must show which task cards are still outstanding and prevent closing.
- **Verification Requirement:** Use Playwright to test the user flow, capture verification screenshots, and include the screenshot when opening the Pull Request.

---

## User Review Required

> [!IMPORTANT]
> **Enforcement Strategy**:
> 1. **Store Layer**: Calling `store.close(orderId)` when any task cards are not `DONE` or `DEFERRED` will throw an error: `Cannot close work order <id>: task cards still outstanding (<card-ids>)`. Also, attempting to close an already-closed work order throws `Work order <id> is already closed`.
> 2. **UI Layer**: The "Close work order" button on `/work-orders/[id]` is disabled (`disabled` + `aria-disabled` + styled with `disabled:opacity-50 disabled:cursor-not-allowed`) whenever any task cards are outstanding. An explanatory label `Outstanding: TC-3, TC-4` is displayed right next to/under the button.
> 3. **E2E & PR**: Playwright tests the UI flow, captures screenshots of the disabled button with outstanding cards and the successful close after completing cards, and attaches the screenshot image when opening the PR on GitHub.

---

## Open Questions

None. All requirements, including the Playwright verification and PR image attachment, are clarified.

---

## Workspace Setup (Worktree)

Per project conventions and user rules:
- Worktree path: `.worktrees/fix-1-close-work-order-with-open-tasks`
- Git branch: `fix/1-prevent-closing-work-order-with-open-tasks`
- Ensure `.worktrees/` is in `.gitignore`
- Conventional commit: `fix: prevent closing work orders with open task cards (Closes #1)`

---

## Proposed Changes

### Component 1: Domain Logic (`src/lib/types.ts`)

#### [MODIFY] `src/lib/types.ts`
Add helpers:
- `isTaskCardComplete(status: TaskCardStatus): boolean` — true for `"DONE"` and `"DEFERRED"`
- `getOutstandingTaskCards(order: WorkOrder): TaskCard[]` — returns all task cards that are not complete
- `canCloseWorkOrder(order: WorkOrder): boolean` — returns true if order is not already `"CLOSED"` and `getOutstandingTaskCards(order).length === 0`

---

### Component 2: Store Business Rules & Unit Tests (`src/lib/store.ts`, `src/lib/store.test.ts`)

#### [MODIFY] `src/lib/store.ts`
In `WorkOrderStore.close(orderId: string)`:
- Require the work order
- Check if already closed -> throw error
- Check `getOutstandingTaskCards(order)` -> if not empty, throw error listing outstanding task IDs
- Update status to `"CLOSED"` and set `closedAt`

#### [MODIFY] `src/lib/store.test.ts`
Add unit tests verifying:
- `getOutstandingTaskCards` and `canCloseWorkOrder` return correct results across orders with open, in-progress, done, and deferred cards.
- `store.close()` succeeds when all cards are DONE or DEFERRED.
- `store.close()` throws describing outstanding card IDs when cards are OPEN or IN_PROGRESS.
- `store.close()` throws when work order is already closed.

---

### Component 3: Work Order Detail UI (`src/app/work-orders/[id]/page.tsx`)

#### [MODIFY] `src/app/work-orders/[id]/page.tsx`
- Import `canCloseWorkOrder` and `getOutstandingTaskCards`.
- Disable the "Close work order" button when `!canClose`.
- If `!canClose`, display `Outstanding: <TC-X, TC-Y>` with `data-testid="outstanding-tasks"`.

---

### Component 4: Playwright E2E Verification & PR Image

#### [NEW] `scripts/verify-playwright.mjs` (or Playwright spec)
- Launch browser with Playwright.
- Navigate to `http://localhost:3000/work-orders/WO-1042`.
- Verify Close button is disabled and `data-testid="outstanding-tasks"` contains `TC-3, TC-4`.
- Take screenshot `screenshots/wo-1042-outstanding-tasks.png`.
- Change `TC-3` to `DONE` and `TC-4` to `DEFERRED`.
- Verify Close button is now enabled and outstanding note is removed.
- Click "Close work order", verify status changes to `CLOSED`.
- Take screenshot `screenshots/wo-1042-closed.png`.

---

## Implementation Tasks

### Task 1: Domain types and helper functions

**Files:**
- Modify: `src/lib/types.ts:37-43`
- Test: `src/lib/store.test.ts`

- [ ] **Step 1: Write failing tests for domain helpers in `src/lib/store.test.ts`**

```ts
import { canCloseWorkOrder, getOutstandingTaskCards, isTaskCardComplete, progress } from "./types";

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL due to missing helper exports.

- [ ] **Step 3: Implement domain helpers in `src/lib/types.ts`**

```ts
export function isTaskCardComplete(status: TaskCardStatus): boolean {
  return status === "DONE" || status === "DEFERRED";
}

export function getOutstandingTaskCards(order: WorkOrder): TaskCard[] {
  return order.taskCards.filter((card) => !isTaskCardComplete(card.status));
}

export function canCloseWorkOrder(order: WorkOrder): boolean {
  return order.status !== "CLOSED" && getOutstandingTaskCards(order).length === 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/store.test.ts
git commit -m "feat: add domain helpers for task completion and work order closing eligibility"
```

---

### Task 2: Enforce business rule in Store

**Files:**
- Modify: `src/lib/store.ts:38-43`
- Test: `src/lib/store.test.ts`

- [ ] **Step 1: Write failing tests for `store.close()` in `src/lib/store.test.ts`**

```ts
  it("throws when closing a work order with open task cards", () => {
    expect(() => store.close("WO-1042")).toThrow(
      "Cannot close work order WO-1042: task cards still outstanding (TC-3, TC-4)",
    );
  });

  it("throws when closing a work order with in-progress task cards", () => {
    expect(() => store.close("WO-1037")).toThrow(
      "Cannot close work order WO-1037: task cards still outstanding (TC-2)",
    );
  });

  it("throws when closing an already closed work order", () => {
    expect(() => store.close("WO-1036")).toThrow("Work order WO-1036 is already closed");
  });

  it("closes a work order when all task cards are done or deferred", () => {
    const orderDeferred = store.close("WO-1039");
    expect(orderDeferred.status).toBe("CLOSED");
    expect(orderDeferred.closedAt).not.toBeNull();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL (`store.close("WO-1042")` does not throw).

- [ ] **Step 3: Implement validation in `src/lib/store.ts`**

```ts
import { SEED_WORK_ORDERS } from "./seed";
import {
  getOutstandingTaskCards,
  type TaskCard,
  type TaskCardStatus,
  type WorkOrder,
} from "./types";

// ...
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/store.ts src/lib/store.test.ts
git commit -m "fix: disallow closing work orders when task cards are outstanding (Closes #1)"
```

---

### Task 3: Update Work Order Detail UI

**Files:**
- Modify: `src/app/work-orders/[id]/page.tsx:54-64`

- [ ] **Step 1: Update `WorkOrderDetail` in `src/app/work-orders/[id]/page.tsx`**

```tsx
import {
  canCloseWorkOrder,
  getOutstandingTaskCards,
  progress,
  TASK_CARD_STATUSES,
  type WorkOrder,
} from "@/lib/types";

// ... in WorkOrderDetail:
  const isClosed = order.status === "CLOSED";
  const outstanding = getOutstandingTaskCards(order);
  const canClose = canCloseWorkOrder(order);

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-muted">{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{order.title}</h1>
        </div>
        {!isClosed && (
          <div className="flex flex-col items-start gap-1.5 md:items-end">
            <form action={closeWorkOrder.bind(null, order.id)}>
              <button
                type="submit"
                disabled={!canClose}
                aria-disabled={!canClose}
                title={
                  !canClose
                    ? `Cannot close: task cards still outstanding (${outstanding.map((c) => c.id).join(", ")})`
                    : undefined
                }
                className="h-10 rounded-lg bg-accent px-4 text-sm font-medium whitespace-nowrap text-accent-ink transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                Close work order
              </button>
            </form>
            {!canClose && (
              <p
                className="text-xs text-muted"
                data-testid="outstanding-tasks"
              >
                Outstanding: <span className="font-mono">{outstanding.map((c) => c.id).join(", ")}</span>
              </p>
            )}
          </div>
        )}
      </div>
```

- [ ] **Step 2: Run lint, typecheck, and tests**

Run: `npm run lint && npm run typecheck && npm test`
Expected: PASS with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/work-orders/[id]/page.tsx
git commit -m "feat: disable close button and show outstanding task cards on detail page"
```

---

### Task 4: Playwright E2E Verification & Screenshot Capture

**Files:**
- Create: `scripts/verify-e2e.mjs`
- Generate: `screenshots/wo-1042-outstanding.png`, `screenshots/wo-1042-closed.png`

- [ ] **Step 1: Write Playwright verification script `scripts/verify-e2e.mjs`**

Script starts dev server (or attaches to it), automates browser:
1. Loads `/work-orders/WO-1042`.
2. Asserts "Close work order" button is disabled.
3. Asserts text `Outstanding: TC-3, TC-4` is present in `[data-testid="outstanding-tasks"]`.
4. Captures screenshot `screenshots/wo-1042-outstanding.png`.
5. Selects `DONE` for `TC-3` and clicks Save.
6. Asserts outstanding text becomes `Outstanding: TC-4`.
7. Selects `DEFERRED` for `TC-4` and clicks Save.
8. Asserts "Close work order" button is enabled and outstanding text is gone.
9. Clicks "Close work order".
10. Asserts status badge is `Closed`.
11. Captures screenshot `screenshots/wo-1042-closed.png`.

- [ ] **Step 2: Execute Playwright verification script**

Run: `node scripts/verify-e2e.mjs`
Expected: All assertions pass, 2 screenshots saved in `screenshots/`.

---

### Task 5: Build Verification, Subagent Reviews, and PR Creation with Images

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: Next.js build succeeds cleanly.

- [ ] **Step 2: Dispatch subagent reviews**
- Spec compliance review: Verify all criteria from issue #1 are fulfilled.
- Code quality review: Verify typing, conventions, and style token compliance.

- [ ] **Step 3: Push branch and open Pull Request with verification image**
- Run `git push -u origin fix/1-prevent-closing-work-order-with-open-tasks`
- Create PR referencing `Closes #1` using `gh pr create`
- Embed/attach the verification screenshot image and description in the PR body.

---

## Verification Plan

### Automated Tests
1. `npm test` - Vitest suite testing `WorkOrderStore` business logic and `types` helpers.
2. `npm run lint` - ESLint checks across entire repository.
3. `npm run typecheck` - TypeScript compiler checks.
4. `npm run build` - Full Next.js production build verification.
5. `node scripts/verify-e2e.mjs` - Playwright E2E verification capturing screenshots.

### Manual Verification
1. Inspect generated `screenshots/wo-1042-outstanding.png` to confirm visual appearance of disabled button and `Outstanding: TC-3, TC-4`.
2. Inspect `screenshots/wo-1042-closed.png` to confirm state after successful closure.
