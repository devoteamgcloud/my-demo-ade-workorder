import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { closeWorkOrder, updateTaskCard } from "@/app/actions";
import { SkeletonRows } from "@/components/skeleton-rows";
import { StatusBadge, statusLabel } from "@/components/status-badge";
import { getWorkOrder } from "@/lib/data";
import { formatDate, formatDateTime } from "@/lib/format";
import { TASK_CARD_STATUSES, progress, type WorkOrder } from "@/lib/types";

export async function generateMetadata(
  props: PageProps<"/work-orders/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  return { title: id };
}

export default function WorkOrderPage(props: PageProps<"/work-orders/[id]">) {
  return (
    <>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeftIcon size={16} weight="bold" />
        All work orders
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <WorkOrderDetail params={props.params} />
      </Suspense>
    </>
  );
}

async function WorkOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getWorkOrder(id);
  if (!order) notFound();
  const isClosed = order.status === "CLOSED";

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
          <form action={closeWorkOrder.bind(null, order.id)}>
            <button
              type="submit"
              className="h-10 rounded-lg bg-accent px-4 text-sm font-medium whitespace-nowrap text-accent-ink transition hover:opacity-90 active:scale-[0.98]"
            >
              Close work order
            </button>
          </form>
        )}
      </div>

      <Meta order={order} />

      <h2 className="mt-10 mb-3 text-base font-semibold">Task cards</h2>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[640px] text-sm" data-testid="task-cards">
          <thead className="bg-surface-muted text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Card</th>
              <th className="px-4 py-2.5 font-medium">ATA</th>
              <th className="px-4 py-2.5 font-medium">Task</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              {!isClosed && <th className="px-4 py-2.5 font-medium">Update</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {order.taskCards.map((card) => (
              <tr key={card.id}>
                <td className="px-4 py-3 font-mono">{card.id}</td>
                <td className="px-4 py-3 font-mono text-muted">{card.ata}</td>
                <td className="px-4 py-3">{card.title}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={card.status} />
                </td>
                {!isClosed && (
                  <td className="px-4 py-2">
                    <form
                      key={card.status}
                      action={updateTaskCard.bind(null, order.id, card.id)}
                      className="flex items-center gap-2"
                    >
                      <select
                        name="status"
                        defaultValue={card.status}
                        aria-label={`Status for ${card.id}`}
                        className="h-8 rounded-lg border border-line bg-surface px-2 text-sm text-ink focus:outline-2 focus:outline-accent"
                      >
                        {TASK_CARD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="h-8 rounded-lg border border-line px-3 text-sm font-medium hover:bg-surface-muted active:scale-[0.98]"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Meta({ order }: { order: WorkOrder }) {
  const { done, total } = progress(order);
  const items: [string, string, boolean?][] = [
    ["Aircraft", order.tail, true],
    ["Type", order.aircraftType],
    ["Station", order.station, true],
    ["Opened", formatDate(order.openedOn)],
    ["Task cards", `${done} of ${total} complete`],
  ];
  if (order.closedAt) items.push(["Closed", formatDateTime(order.closedAt)]);

  return (
    <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-line bg-surface p-5 md:grid-cols-3 lg:grid-cols-6">
      {items.map(([label, value, mono]) => (
        <div key={label}>
          <dt className="text-xs text-muted">{label}</dt>
          <dd className={`mt-0.5 font-medium ${mono ? "font-mono" : ""}`}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DetailSkeleton() {
  return (
    <div aria-hidden>
      <div className="h-4 w-24 animate-pulse rounded bg-surface-muted motion-reduce:animate-none" />
      <div className="mt-3 h-7 w-80 animate-pulse rounded bg-surface-muted motion-reduce:animate-none" />
      <div className="mt-6 h-20 animate-pulse rounded-lg bg-surface-muted motion-reduce:animate-none" />
      <table className="mt-10 w-full">
        <tbody>
          <SkeletonRows rows={4} cols={4} />
        </tbody>
      </table>
    </div>
  );
}
