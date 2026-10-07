import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24">
      <h1 className="text-2xl font-semibold tracking-tight">Work order not found</h1>
      <p className="mt-2 text-muted">Check the number and try again.</p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-accent hover:underline">
        Back to work orders
      </Link>
    </div>
  );
}
