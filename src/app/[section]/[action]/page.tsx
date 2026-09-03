import { notFound } from "next/navigation";
import ActionPage from "../../ActionPage";

const actions: Record<string, string> = { sales: "new", invoices: "new", inventory: "new", customers: "new", settings: "edit" };

export default async function SectionActionPage({ params }: { params: Promise<{ section: string; action: string }> }) {
  const { section, action } = await params;
  if (actions[section.toLowerCase()] !== action.toLowerCase()) notFound();
  return <ActionPage section={section.toLowerCase()} />;
}