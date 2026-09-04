"use client";

import Link from "next/link";
import { useState } from "react";

const formFields: Record<string, { label: string; name: string; type?: string; placeholder: string }[]> = {
  transactions: [{ label: "Transaction name", name: "name", placeholder: "Product design retainer" }, { label: "Customer", name: "customer", placeholder: "Northstar Co." }, { label: "Transaction date", name: "date", type: "date", placeholder: "" }, { label: "Amount", name: "amount", type: "number", placeholder: "5800.00" }, { label: "Status", name: "status", placeholder: "Pending" }],
  sales: [{ label: "Opportunity name", name: "name", placeholder: "Website redesign" }, { label: "Account owner", name: "owner", placeholder: "Northstar Co." }, { label: "Expected close", name: "close", type: "date", placeholder: "" }, { label: "Value", name: "value", type: "number", placeholder: "42000" }],
  invoices: [{ label: "Customer", name: "customer", placeholder: "Northstar Co." }, { label: "Invoice number", name: "invoice", placeholder: "INV-1052" }, { label: "Due date", name: "due", type: "date", placeholder: "" }, { label: "Amount", name: "amount", type: "number", placeholder: "5800.00" }],
  inventory: [{ label: "Item name", name: "name", placeholder: "Canvas Tote" }, { label: "SKU", name: "sku", placeholder: "SKU-2204" }, { label: "Category", name: "category", placeholder: "Accessories" }, { label: "Quantity", name: "quantity", type: "number", placeholder: "25" }],
  customers: [{ label: "Customer name", name: "name", placeholder: "Northstar Co." }, { label: "Industry", name: "industry", placeholder: "Technology" }, { label: "Email", name: "email", type: "email", placeholder: "hello@example.com" }, { label: "Lifetime value", name: "value", type: "number", placeholder: "42800" }],
  settings: [{ label: "Company name", name: "company", placeholder: "Mini NetSuite" }, { label: "Default payment terms", name: "terms", placeholder: "Net 30" }, { label: "Currency", name: "currency", placeholder: "USD ($)" }],
};

const titles: Record<string, string> = { transactions: "New transaction", sales: "New opportunity", invoices: "Create invoice", inventory: "Add item", customers: "Add customer", settings: "Save changes" };

export default function ActionPage({ section }: { section: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fields = formFields[section];
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); const response = await fetch(`/api/${section}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); if (!response.ok) { const result = await response.json().catch(() => null) as { error?: string } | null; setError(result?.error ?? "Could not save this record."); return; } setSubmitted(true); }
  return <main className="action-page"><div className="action-header"><div><p className="eyebrow">Workspace / {section}</p><h1>{titles[section]}<span className="accent-dot">.</span></h1><p className="muted">Enter the details below to continue.</p></div><Link className="text-button" href={`/${section}`}>← Back to {section}</Link></div><form className="panel action-form" onSubmit={submit}><div className="form-grid">{fields.map((field) => <label key={field.name}><span>{field.label}</span><input name={field.name} type={field.type ?? "text"} placeholder={field.placeholder} required /></label>)}</div><div className="form-actions"><Link className="text-button" href={`/${section}`}>Cancel</Link><button className="primary-button" type="submit">{titles[section]}</button></div>{submitted && <p className="form-success" role="status">{titles[section]} saved successfully.</p>}{error && <p className="form-error" role="alert">{error}</p>}</form></main>;
}