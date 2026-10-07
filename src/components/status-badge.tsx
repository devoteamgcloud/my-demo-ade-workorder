import type { TaskCardStatus, WorkOrderStatus } from "@/lib/types";

const STYLES: Record<TaskCardStatus | WorkOrderStatus, string> = {
  OPEN: "bg-amber-500/12 text-amber-800 dark:text-amber-300",
  IN_PROGRESS: "bg-sky-500/12 text-sky-800 dark:text-sky-300",
  DONE: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300",
  DEFERRED: "bg-violet-500/12 text-violet-800 dark:text-violet-300",
  CLOSED: "bg-zinc-500/12 text-zinc-700 dark:text-zinc-300",
};

export function statusLabel(status: TaskCardStatus | WorkOrderStatus) {
  return status === "IN_PROGRESS" ? "In progress" : status[0] + status.slice(1).toLowerCase();
}

export function StatusBadge({
  status,
}: {
  status: TaskCardStatus | WorkOrderStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STYLES[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}
