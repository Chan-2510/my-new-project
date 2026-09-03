import { notFound } from "next/navigation";
import DashboardPage from "../DashboardPage";

const sections: Record<string, string> = {
  transactions: "Transactions",
  sales: "Sales",
  invoices: "Invoices",
  inventory: "Inventory",
  customers: "Customers",
  settings: "Settings",
};

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const initialView = sections[section.toLowerCase()];
  if (!initialView) notFound();
  return <DashboardPage initialView={initialView} />;
}