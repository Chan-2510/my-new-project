import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Dashboard from "./Dashboard";

export default async function DashboardPage({ initialView }: { initialView: string }) {
  const session = await auth();
  if (!session) redirect("/login");
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  const [transactions, opportunities, invoices, inventoryItems, customers] = await Promise.all([
    prisma.transaction.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" } }),
    prisma.opportunity.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" } }),
    prisma.invoice.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" } }),
    prisma.inventoryItem.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.customer.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  async function onSignIn() { "use server"; redirect("/api/auth/signin"); }
  const dashboardRecords = {
    transactions: transactions.map((item) => ({ name: item.name, date: item.date.toISOString(), status: item.status, amount: item.amount.toString(), customer: item.customer ? { name: item.customer.name } : null })),
    opportunities: opportunities.map((item) => ({ name: item.name, owner: item.owner, stage: item.stage, expectedClose: item.expectedClose?.toISOString() ?? null, value: item.value.toString(), customer: item.customer ? { name: item.customer.name } : null })),
    invoices: invoices.map((item) => ({ number: item.number, issuedAt: item.issuedAt.toISOString(), dueAt: item.dueAt.toISOString(), status: item.status, amount: item.amount.toString(), customer: { name: item.customer.name } })),
    inventoryItems: inventoryItems.map((item) => ({ sku: item.sku, name: item.name, category: item.category, onHand: item.onHand, reorderPoint: item.reorderPoint })),
    customers: customers.map((item) => ({ name: item.name, industry: item.industry, updatedAt: item.updatedAt.toISOString(), lifetimeValue: item.lifetimeValue.toString() })),
  };

  return <Dashboard initialView={initialView} users={users} signedInName={session?.user?.name} signedInEmail={session?.user?.email} onSignIn={onSignIn} records={dashboardRecords} />;
}