"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

type User = { id: number; email: string; name: string | null };
type Records = { transactions: { name: string; date: Date; status: string; amount: unknown; customer: { name: string } | null }[]; opportunities: { name: string; owner: string | null; stage: string; expectedClose: Date | null; value: unknown; customer: { name: string } | null }[]; invoices: { number: string; issuedAt: Date; dueAt: Date; status: string; amount: unknown; customer: { name: string } }[]; inventoryItems: { sku: string; name: string; category: string | null; onHand: number; reorderPoint: number }[]; customers: { name: string; industry: string | null; updatedAt: Date; lifetimeValue: unknown }[] };

type DashboardProps = {
  users: User[];
  initialView?: string;
  signedInName?: string | null;
  signedInEmail?: string | null;
  onSignIn: () => Promise<void>;
  records: Records;
};

const modulePages: Record<string, { label: string; title: string; description: string; action: string; stats: string[][]; heading: string; columns: string[]; rows: string[][] }> = {
  Transactions: { label: "Accounts receivable", title: "Transactions", description: "Review and manage every business transaction in one place.", action: "New transaction", stats: [["Total transactions", "128", "Up 12 this month"], ["Total volume", "$584,210", "Up 18.4% this period"], ["Pending review", "7", "3 need attention"]], heading: "Transaction register", columns: ["Transaction", "Customer", "Date", "Status", "Amount"], rows: [["INV-1051", "Northstar Co.", "Sep 03, 2026", "Pending", "$5,800.00"], ["INV-1050", "Juniper & Co.", "Sep 02, 2026", "Paid", "$3,250.00"], ["INV-1049", "Vertex Labs", "Sep 01, 2026", "Overdue", "$1,890.00"]] },
  Sales: { label: "Sales pipeline", title: "Sales", description: "Track opportunities from first contact to closed deal.", action: "New opportunity", stats: [["Pipeline value", "$248,600", "Up 14.2% this month"], ["Open opportunities", "32", "8 added this week"], ["Win rate", "68%", "Up 6.4% vs. last month"]], heading: "Active opportunities", columns: ["Opportunity", "Account owner", "Stage", "Expected close", "Value"], rows: [["Website redesign", "Northstar Co.", "Proposal", "Sep 18, 2026", "$42,000"], ["Brand refresh", "Lumina Studio", "Negotiation", "Sep 24, 2026", "$18,500"], ["Analytics setup", "Vertex Labs", "Discovery", "Oct 02, 2026", "$27,800"]] },
  Invoices: { label: "Accounts receivable", title: "Invoices", description: "Create, send, and follow up on every invoice.", action: "Create invoice", stats: [["Total outstanding", "$19,430", "7 invoices due this week"], ["Paid this month", "$64,860", "Up 11.8% vs. August"], ["Overdue", "$1,890", "1 invoice needs attention"]], heading: "Invoice register", columns: ["Invoice", "Customer", "Issued", "Due date", "Status", "Amount"], rows: [["INV-1051", "Northstar Co.", "Sep 03, 2026", "Oct 03, 2026", "Pending", "$5,800.00"], ["INV-1050", "Juniper & Co.", "Sep 02, 2026", "Oct 02, 2026", "Paid", "$3,250.00"], ["INV-1049", "Vertex Labs", "Sep 01, 2026", "Sep 15, 2026", "Overdue", "$1,890.00"]] },
  Inventory: { label: "Stock control", title: "Inventory", description: "Know what is available, reserved, and running low.", action: "Add item", stats: [["Inventory value", "$126,840.50", "412 total items"], ["In stock", "394", "95.6% healthy stock"], ["Low stock", "18", "4 items need reorder"]], heading: "Item catalogue", columns: ["SKU", "Item", "Category", "On hand", "Reorder point", "Status"], rows: [["SKU-2204", "Canvas Tote", "Accessories", "12", "25", "Low stock"], ["SKU-1140", "Desk Organizer", "Office", "86", "30", "In stock"], ["SKU-3341", "Travel Mug", "Accessories", "44", "20", "In stock"]] },
  Customers: { label: "Relationship management", title: "Customers", description: "Keep customer records and account activity in one place.", action: "Add customer", stats: [["All customers", "284", "Up 38 this month"], ["Active accounts", "218", "76.8% of customer base"], ["Average value", "$4,280", "Up 9.2% this quarter"]], heading: "Customer directory", columns: ["Customer", "Industry", "Last activity", "Open invoices", "Lifetime value"], rows: [["Northstar Co.", "Technology", "Today, 09:42", "1", "$42,800"], ["Lumina Studio", "Creative services", "Yesterday", "0", "$31,240"], ["Vertex Labs", "Technology", "Sep 01, 2026", "1", "$28,900"]] },
  Settings: { label: "Workspace administration", title: "Settings", description: "Manage your workspace preferences and account defaults.", action: "Save changes", stats: [["Workspace", "Mini NetSuite", "Practice environment"], ["Currency", "USD ($)", "Default transaction currency"], ["Time zone", "UTC +09:00", "Japan Standard Time"]], heading: "Workspace preferences", columns: ["Preference", "Current value", "Description"], rows: [["Company name", "Mini NetSuite", "Shown on invoices and reports"], ["Default payment terms", "Net 30", "Applied to new invoices"], ["Fiscal year starts", "January", "Used for reporting periods"]] },
};

const navItems = [["Overview", "▦"], ["Transactions", "↔"], ["Sales", "↗"], ["Invoices", "▤"], ["Inventory", "◫"], ["Customers", "◎"], ["Settings", "⚙"]];

export default function Dashboard({ users, initialView = "Overview", signedInName, signedInEmail, onSignIn, records }: DashboardProps) {
  const [view] = useState(initialView);
  const [toast, setToast] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };
  const page = modulePages[view];
  const displayName = signedInName ?? signedInEmail?.split("@")[0] ?? "Guest user";
  const initials = signedInEmail ? displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "--";

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand"><span className="brand-mark">N</span><span>mini<span className="brand-accent">/</span>netsuite</span></div>
        <p className="eyebrow">Workspace</p>
        <nav className="nav-list">{navItems.map(([label, icon]) => <Link key={label} href={label === "Overview" ? "/" : `/${label.toLowerCase()}`} className={`nav-item ${view === label ? "active" : ""}`}><span className="nav-icon">{icon}</span>{label}</Link>)}</nav>
        <div className="sidebar-bottom">
          <div className="support-card"><span className="status-dot" /><div><strong>All systems good</strong><small>Last synced 2 min ago</small></div></div>
          <button className="profile" type="button" onClick={() => signOut({ callbackUrl: "/login" })} aria-label={`Log out ${displayName}`}><span className="avatar">{initials}</span><span><strong>{displayName}</strong><small>{signedInEmail ? "Administrator" : "Not signed in"}</small></span><span className="more" aria-hidden="true">•••</span></button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark">N</span>mini/netsuite</div><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{view}</strong></div><div className="top-actions"><Search records={records} /><Notifications records={records} /><div className="account-menu"><button className="top-avatar" type="button" onClick={() => setProfileMenuOpen((isOpen) => !isOpen)} aria-label="Open account menu" aria-expanded={profileMenuOpen}>{initials}</button>{profileMenuOpen && <div className="account-dropdown"><button type="button" onClick={() => signOut({ callbackUrl: "/login" })}>Logout</button></div>}</div></div></header>
        {view === "Overview" ? <Overview onNotify={notify} users={users} displayName={displayName} /> : <><ModuleView page={page} onNotify={notify} /><DatabaseRecords view={view} records={records} /></>}
        <footer>Mini NetSuite <span>•</span> Learning project <span>•</span> Data shown is for practice <span>•</span>{signedInEmail ? <button className="text-button" onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</button> : <button className="text-button" onClick={onSignIn}>Sign in</button>}</footer>
      </main>
      <div className={`toast ${toast ? "visible" : ""}`} role="status">{toast}</div>
    </div>
  );
}

function Overview({ onNotify, users, displayName }: { onNotify: (message: string) => void; users: User[]; displayName: string }) {
  useEffect(() => {
    const periodSelect = document.querySelector<HTMLSelectElement>('select[aria-label="Revenue period"]');
    const summaryValue = document.querySelector<HTMLElement>(".chart-summary strong");
    const summaryTrend = document.querySelector<HTMLElement>(".chart-summary .trend");
    const chartLine = document.querySelector<SVGPathElement>(".chart .line");
    const chartArea = document.querySelector<SVGPathElement>(".chart .area");
    const chartLabels = document.querySelector<HTMLElement>(".chart-labels");
    const activityItems = document.querySelectorAll<HTMLElement>(".activity-item");
    if (!periodSelect || !summaryValue || !summaryTrend || !chartLine || !chartArea || !chartLabels) return;
    const updateRevenue = () => {
      const isMonthView = periodSelect.value === "Last 30 days";
      summaryValue.textContent = isMonthView ? "$92,480" : "$584,210";
      summaryTrend.textContent = isMonthView ? "Up 8.7%" : "Up 18.4%";
      const linePath = isMonthView ? "M0 168 C70 150 110 170 170 132 S260 145 320 102 S410 118 470 82 S580 96 700 42" : "M0 174 C60 160 80 162 120 145 S190 152 230 124 S295 136 345 108 S405 106 460 82 S525 92 570 55 S635 66 700 20";
      chartLine.setAttribute("d", linePath);
      chartArea.setAttribute("d", `${linePath} V220 H0Z`);
      chartLabels.innerHTML = isMonthView ? "<span>Aug 05</span><span>Aug 10</span><span>Aug 15</span><span>Aug 20</span><span>Aug 25</span><span>Aug 30</span><span>Sep 03</span>" : "<span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>";
    };
    periodSelect.addEventListener("change", updateRevenue);
    const activityListeners = Array.from(activityItems, (item) => {
      const showDetails = () => onNotify(item.textContent?.replace(/\s+/g, " ").trim() ?? "Activity details");
      item.addEventListener("click", showDetails);
      return { item, showDetails };
    });
    return () => {
      periodSelect.removeEventListener("change", updateRevenue);
      activityListeners.forEach(({ item, showDetails }) => item.removeEventListener("click", showDetails));
    };
  }, [onNotify]);
  return <>
    <section className="page-intro"><div><p className="eyebrow">Thursday, September 03, 2026</p><h1>Good morning, {displayName}<span className="accent-dot">.</span></h1><p className="muted">Here&apos;s what&apos;s happening across your business today.</p></div><Link className="primary-button" href="/transactions/new"><span>+</span> New transaction</Link></section>
    <section className="metric-grid" aria-label="Business metrics"><Metric label="Net revenue" value="$84,290" note="Compared to $74,720 last month" trend="Up 12.8%" className="revenue" /><Metric label="Open invoices" value="24" note="7 due this week" trend="Up 4.2%" /><Metric label="Inventory value" value="$126,840.50" note="412 total items · 18 low stock" trend="Down 2.1%" negative /><Metric label="New customers" value={String(Math.max(38, users.length))} note="Since the start of this month" trend="Up 8.6%" /></section>
    <section className="content-grid"><article className="panel sales-panel"><div className="panel-heading"><div><p className="eyebrow">Performance</p><h2>Revenue overview</h2></div><select aria-label="Revenue period"><option>Last 7 months</option><option>Last 30 days</option></select></div><div className="chart-summary"><strong>$584,210</strong><span className="trend positive">Up 18.4%</span><small>vs. previous period</small></div><div className="chart"><div className="chart-grid"><span>$100k</span><span>$75k</span><span>$50k</span><span>$25k</span><span>$0</span></div><svg viewBox="0 0 700 220" preserveAspectRatio="none" aria-label="Revenue rises from April through October"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#d8efe9" stopOpacity=".8" /><stop offset="1" stopColor="#d8efe9" stopOpacity="0" /></linearGradient></defs><path className="area" d="M0 174 C60 160 80 162 120 145 S190 152 230 124 S295 136 345 108 S405 106 460 82 S525 92 570 55 S635 66 700 20 V220 H0Z" /><path className="line" d="M0 174 C60 160 80 162 120 145 S190 152 230 124 S295 136 345 108 S405 106 460 82 S525 92 570 55 S635 66 700 20" /></svg><div className="chart-labels"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div></div></article><article className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">Live feed</p><h2>Recent activity</h2></div><button className="text-button" onClick={() => onNotify("Showing all activity")}>View all <span>→</span></button></div><div className="activity-list">{[["↗", "Payment received", "INV-1048 · Lumina Studio", "+$2,400", "teal"], ["▤", "Invoice sent", "INV-1051 · Northstar Co.", "2h ago", "yellow"], ["◎", "New customer added", "Marcel Chen", "4h ago", "blue"], ["◫", "Stock alert", "SKU-2204 · Canvas Tote", "Low stock", "coral"]].map(([icon, title, detail, time, color]) => <div className="activity-item" key={title}><span className={`activity-icon ${color}`}>{icon}</span><div><strong>{title}</strong><p>{detail}</p></div><time>{time}</time></div>)}</div></article></section>
    <section className="panel transactions-panel"><div className="panel-heading"><div><p className="eyebrow">Accounts receivable</p><h2>Recent transactions</h2></div><button className="text-button" onClick={() => onNotify("Showing all transactions")}>View all <span>→</span></button></div><div className="table-wrap"><table><thead><tr><th>Transaction</th><th>Customer</th><th>Date</th><th>Status</th><th className="amount">Amount</th></tr></thead><tbody>{[["INV-1051", "Product design retainer", "Northstar Co.", "Pending", "$5,800.00"], ["INV-1050", "Q3 marketing services", "Juniper & Co.", "Paid", "$3,250.00"], ["INV-1049", "Annual software license", "Vertex Labs", "Overdue", "$1,890.00"]].map(([id, name, customer, status, amount]) => <tr key={id}><td><span className="transaction-id">{id}</span><strong>{name}</strong></td><td>{customer}</td><td>Sep 03, 2026</td><td><span className={`pill ${status.toLowerCase()}`}>{status}</span></td><td className="amount">{amount}</td></tr>)}</tbody></table></div></section>
  </>;
}

function Metric({ label, value, note, trend, negative, className = "" }: { label: string; value: string; note: string; trend: string; negative?: boolean; className?: string }) { return <article className={`metric-card ${className}`}><div className="card-label"><span>{label}</span><span className={`trend ${negative ? "negative" : "positive"}`}>{trend}</span></div><strong>{value}</strong><small>{note}</small></article>; }

function ModuleView({ page, onNotify }: { page: (typeof modulePages)[string]; onNotify: (message: string) => void }) { const section = page.title.toLowerCase(); const actionPath = page.title === "Settings" ? `/${section}/edit` : `/${section}/new`; return <><section className="page-intro module-intro"><div><p className="eyebrow">{page.label}</p><h1>{page.title}<span className="accent-dot">.</span></h1><p className="muted">{page.description}</p></div><Link className="primary-button" href={actionPath}><span>+</span> {page.action}</Link></section><section className="metric-grid module-metrics">{page.stats.map(([label, value, note]) => <Metric key={label} label={label} value={value} note={note} trend="●" />)}</section><section className="panel module-table"><div className="panel-heading"><div><p className="eyebrow">{page.label}</p><h2>{page.heading}</h2></div><button className="text-button" onClick={() => onNotify("Export started")}>Export <span>↓</span></button></div><div className="table-wrap"><table><thead><tr>{page.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{page.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td className={index === row.length - 1 ? "amount" : ""} key={`${row[0]}-${cell}`}>{["Pending", "Paid", "Overdue", "Low stock", "In stock"].includes(cell) ? <span className={`pill ${cell.toLowerCase().replace(" ", "-")}`}>{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div>{page.title === "Settings" && <div className="settings-options">{["Email notifications", "Compact table view", "Two-step approval"].map((label, index) => <label key={label}><span><strong>{label}</strong><small>{index === 0 ? "Receive updates about invoices and stock alerts" : index === 1 ? "Show more records in less space" : "Require approval before sending invoices"}</small></span><input type="checkbox" defaultChecked={index === 0} onChange={(event) => onNotify(`${event.target.checked ? "Enabled" : "Disabled"} setting`)} /></label>)}</div>}</section></>; }

function DatabaseRecords({ view, records }: { view: string; records: Records }) {
  const rows = view === "Transactions" ? records.transactions.map((item) => [item.name, item.customer?.name ?? "-", item.date.toLocaleDateString("en-US"), item.status, String(item.amount)]) : view === "Sales" ? records.opportunities.map((item) => [item.name, item.customer?.name ?? "-", item.stage, item.expectedClose?.toLocaleDateString("en-US") ?? "-", String(item.value)]) : view === "Invoices" ? records.invoices.map((item) => [item.number, item.customer.name, item.issuedAt.toLocaleDateString("en-US"), item.status, String(item.amount)]) : view === "Inventory" ? records.inventoryItems.map((item) => [item.sku, item.name, item.category ?? "-", String(item.onHand), String(item.reorderPoint)]) : records.customers.map((item) => [item.name, item.industry ?? "-", item.updatedAt.toLocaleDateString("en-US"), String(item.lifetimeValue)]);
  const columns = view === "Transactions" ? ["Transaction", "Customer", "Date", "Status", "Amount"] : view === "Sales" ? ["Opportunity", "Customer", "Stage", "Expected close", "Value"] : view === "Invoices" ? ["Invoice", "Customer", "Issued", "Status", "Amount"] : view === "Inventory" ? ["SKU", "Item", "Category", "On hand", "Reorder point"] : ["Customer", "Industry", "Updated", "Lifetime value"];
  return <section className="panel module-table database-records"><div className="panel-heading"><div><p className="eyebrow">Live database</p><h2>Saved records</h2></div><span className="record-count">{rows.length} records</span></div><div className="table-wrap">{rows.length === 0 ? <p className="muted empty-records">No saved records yet.</p> : <table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={`${view}-${rowIndex}`}>{row.map((cell, cellIndex) => <td className={cellIndex === row.length - 1 ? "amount" : ""} key={`${view}-${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table>}</div></section>;
}

function Search({ records }: { records: Records }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchItems = [
    ...records.transactions.map((item) => ({ title: item.name, detail: item.customer?.name ?? "Transaction", section: "transactions" })),
    ...records.opportunities.map((item) => ({ title: item.name, detail: item.customer?.name ?? "Opportunity", section: "sales" })),
    ...records.invoices.map((item) => ({ title: item.number, detail: item.customer.name, section: "invoices" })),
    ...records.inventoryItems.map((item) => ({ title: item.name, detail: item.sku, section: "inventory" })),
    ...records.customers.map((item) => ({ title: item.name, detail: item.industry ?? "Customer", section: "customers" })),
  ];
  const matches = query.trim() ? searchItems.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6) : [];

  return <div className="search-box">
    {open && <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records..." aria-label="Search records" />}
    <button className="icon-button" aria-label={open ? "Close search" : "Search"} onClick={() => { setOpen(!open); if (open) setQuery(""); }}><SearchIcon /></button>
    {open && query.trim() && <div className="search-results" role="listbox">{matches.length ? matches.map((item, index) => <Link key={`${item.section}-${item.title}-${index}`} href={`/${item.section}`} onClick={() => { setOpen(false); setQuery(""); }}><strong>{item.title}</strong><small>{item.detail}</small></Link>) : <p>No matching records</p>}</div>}
  </div>;
}

function Notifications({ records }: { records: Records }) {
  const [open, setOpen] = useState(false);
  const notifications = [
    ...records.invoices.filter((item) => item.status === "Overdue").map((item) => ({ title: `Invoice ${item.number} is overdue`, detail: item.customer.name, tone: "coral" })),
    ...records.inventoryItems.filter((item) => item.onHand <= item.reorderPoint).map((item) => ({ title: `${item.name} is low in stock`, detail: `${item.onHand} remaining`, tone: "yellow" })),
    ...records.invoices.filter((item) => item.status === "Pending").map((item) => ({ title: `Invoice ${item.number} needs review`, detail: item.customer.name, tone: "blue" })),
  ].slice(0, 5);

  return <div className="notification-box">
    <button className="icon-button notification" aria-label={`${notifications.length} notifications`} aria-expanded={open} onClick={() => setOpen(!open)}><BellIcon />{notifications.length > 0 && <i />}</button>
    {open && <div className="notification-panel"><div className="notification-heading"><strong>Notifications</strong><small>{notifications.length} unread</small></div>{notifications.length ? notifications.map((item, index) => <div className="notification-item" key={`${item.title}-${index}`}><span className={`notification-dot ${item.tone}`} /><div><strong>{item.title}</strong><small>{item.detail}</small></div></div>) : <p className="notification-empty">You&apos;re all caught up.</p>}<button className="notification-dismiss" onClick={() => setOpen(false)}>Mark as read</button></div>}
  </div>;
}

function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>; }
function BellIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>; }