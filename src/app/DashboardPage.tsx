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

  return <Dashboard initialView={initialView} users={users} signedInName={session?.user?.name} signedInEmail={session?.user?.email} onSignIn={onSignIn} records={{ transactions, opportunities, invoices, inventoryItems, customers }} />;
}