import Link from "next/link";
import { Suspense } from "react";

import { SkeletonRows } from "@/components/skeleton-rows";
import { StatusBadge } from "@/components/status-badge";
import { listWorkOrders } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { progress } from "@/lib/types";

const COLUMNS = [
  "Work order",
  "Aircraft",
  "Type",
  "Station",
  "Description",
  "Task cards",
  "Status",
  "Opened",
];

export default function WorkOrdersPage() {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Work orders</h1>
        <Suspense fallback={<p className="text-sm text-muted">Loading</p>}>
          <Summary />
        </Suspense>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[860px] text-sm" data-testid="work-orders">
          <thead className="bg-surface-muted text-left text-xs text-muted">
            <tr>
              {COLUMNS.map((col) => (
                <th key={col} className="px-4 py-2.5 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <Suspense fallback={<SkeletonRows rows={8} cols={COLUMNS.length} />}>
              <WorkOrderRows />
            </Suspense>
          </tbody>
        </table>
      </div>
    </>
  );
}

async function Summary() {
  const orders = await listWorkOrders();
  const closed = orders.filter((wo) => wo.status === "CLOSED").length;
  return (
    <p className="text-sm text-muted">
      {orders.length - closed} active, {closed} closed
    </p>
  );
}

async function WorkOrderRows() {
  const orders = await listWorkOrders();
  if (orders.length === 0) {
    return (
      <tr>
        <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-muted">
          No work orders yet.
        </td>
      </tr>
    );
  }
  return orders.map((wo) => {
    const { done, total } = progress(wo);
    return (
      <tr key={wo.id} className="hover:bg-surface-muted/60">
        <td className="px-4 py-3">
          <Link
            href={`/work-orders/${wo.id}`}
            className="font-mono font-medium text-accent hover:underline"
          >
            {wo.id}
          </Link>
        </td>
        <td className="px-4 py-3 font-mono">{wo.tail}</td>
        <td className="px-4 py-3 text-muted">{wo.aircraftType}</td>
        <td className="px-4 py-3 font-mono text-muted">{wo.station}</td>
        <td className="px-4 py-3">{wo.title}</td>
        <td className="px-4 py-3 font-mono tabular-nums">
          {done}/{total}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={wo.status} />
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-muted tabular-nums">
          {formatDate(wo.openedOn)}
        </td>
      </tr>
    );
  });
}
