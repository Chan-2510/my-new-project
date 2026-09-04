import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const resources = ["transactions", "sales", "invoices", "inventory", "customers"] as const;
type Resource = (typeof resources)[number];

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const resource = (await params).resource.toLowerCase() as Resource;
    if (!resources.includes(resource)) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

    const body = await request.json() as Record<string, string>;
    if (!body.name && !body.customer && !body.invoice) return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });

    if (resource === "customers") {
      const customer = await prisma.customer.create({ data: { name: body.name, industry: body.industry || null, email: body.email || null, lifetimeValue: body.value || "0" } });
      return NextResponse.json(customer, { status: 201 });
    }

    const customerName = body.customer || "Unassigned customer";
    const customer = await prisma.customer.findFirst({ where: { name: customerName } }) ?? await prisma.customer.create({ data: { name: customerName } });

    if (resource === "sales") return NextResponse.json(await prisma.opportunity.create({ data: { name: body.name, owner: body.owner || null, expectedClose: body.close ? new Date(body.close) : null, value: body.value || "0", customerId: customer.id } }), { status: 201 });
    if (resource === "invoices") return NextResponse.json(await prisma.invoice.create({ data: { number: body.invoice, dueAt: new Date(body.due), amount: body.amount, customerId: customer.id } }), { status: 201 });
    if (resource === "inventory") return NextResponse.json(await prisma.inventoryItem.create({ data: { name: body.name, sku: body.sku, category: body.category || null, onHand: Number(body.quantity) || 0 } }), { status: 201 });
    return NextResponse.json(await prisma.transaction.create({ data: { name: body.name, date: body.date ? new Date(body.date) : new Date(), status: body.status || "Pending", amount: body.amount, customerId: customer.id } }), { status: 201 });
  } catch (error) {
    console.error("API record creation failed", error);
    return NextResponse.json({ error: "Could not save this record" }, { status: 500 });
  }
}