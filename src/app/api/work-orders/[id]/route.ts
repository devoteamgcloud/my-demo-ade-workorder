import { getWorkOrder } from "@/lib/data";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/work-orders/[id]">,
) {
  const { id } = await ctx.params;
  const order = await getWorkOrder(id);
  if (!order) {
    return Response.json({ error: "Work order not found" }, { status: 404 });
  }
  return Response.json(order);
}
