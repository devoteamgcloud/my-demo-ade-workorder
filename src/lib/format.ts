const TIME_ZONE = "Asia/Kuala_Lumpur";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso.slice(0, 10)}T12:00:00+08:00`));
}

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}
