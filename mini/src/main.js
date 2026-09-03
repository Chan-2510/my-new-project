const navItems = document.querySelectorAll('.nav-item[data-view]');
const currentView = document.querySelector('#current-view');
const newTransactionButton = document.querySelector('#new-transaction');
const toast = document.querySelector('#toast');
const overviewView = document.querySelector('#overview-view');
const moduleView = document.querySelector('#module-view');
let toastTimer;

const modulePages = {
  Sales: {
    label: 'Sales pipeline',
    title: 'Sales',
    description: 'Track opportunities from first contact to closed deal.',
    action: 'New opportunity',
    stats: [['Pipeline value', '$248,600', '↑ 14.2% this month'], ['Open opportunities', '32', '8 added this week'], ['Win rate', '68%', '↑ 6.4% vs. last month']],
    heading: 'Active opportunities',
    columns: ['Opportunity', 'Account owner', 'Stage', 'Expected close', 'Value'],
    rows: [['Website redesign', 'Northstar Co.', 'Proposal', 'Sep 18, 2026', '$42,000'], ['Brand refresh', 'Lumina Studio', 'Negotiation', 'Sep 24, 2026', '$18,500'], ['Analytics setup', 'Vertex Labs', 'Discovery', 'Oct 02, 2026', '$27,800'], ['Campaign strategy', 'Juniper & Co.', 'Closed won', 'Sep 05, 2026', '$31,200']]
  },
  Invoices: {
    label: 'Accounts receivable', title: 'Invoices', description: 'Create, send, and follow up on every invoice.', action: 'Create invoice',
    stats: [['Total outstanding', '$19,430', '7 invoices due this week'], ['Paid this month', '$64,860', '↑ 11.8% vs. August'], ['Overdue', '$1,890', '1 invoice needs attention']], heading: 'Invoice register',
    columns: ['Invoice', 'Customer', 'Issued', 'Due date', 'Status', 'Amount'], rows: [['INV-1051', 'Northstar Co.', 'Sep 03, 2026', 'Oct 03, 2026', 'Pending', '$5,800.00'], ['INV-1050', 'Juniper & Co.', 'Sep 02, 2026', 'Oct 02, 2026', 'Paid', '$3,250.00'], ['INV-1049', 'Vertex Labs', 'Sep 01, 2026', 'Sep 15, 2026', 'Overdue', '$1,890.00'], ['INV-1048', 'Lumina Studio', 'Aug 29, 2026', 'Sep 29, 2026', 'Paid', '$2,400.00']]
  },
  Inventory: {
    label: 'Stock control', title: 'Inventory', description: 'Know what is available, reserved, and running low.', action: 'Add item',
    stats: [['Inventory value', '$126,840.50', '412 total items'], ['In stock', '394', '95.6% healthy stock'], ['Low stock', '18', '4 items need reorder']], heading: 'Item catalogue',
    columns: ['SKU', 'Item', 'Category', 'On hand', 'Reorder point', 'Status'], rows: [['SKU-2204', 'Canvas Tote', 'Accessories', '12', '25', 'Low stock'], ['SKU-1140', 'Desk Organizer', 'Office', '86', '30', 'In stock'], ['SKU-3341', 'Travel Mug', 'Accessories', '44', '20', 'In stock'], ['SKU-0982', 'Notebook Set', 'Stationery', '8', '15', 'Low stock']]
  },
  Customers: {
    label: 'Relationship management', title: 'Customers', description: 'Keep customer records and account activity in one place.', action: 'Add customer',
    stats: [['All customers', '284', '↑ 38 this month'], ['Active accounts', '218', '76.8% of customer base'], ['Average value', '$4,280', '↑ 9.2% this quarter']], heading: 'Customer directory',
    columns: ['Customer', 'Industry', 'Last activity', 'Open invoices', 'Lifetime value'], rows: [['Northstar Co.', 'Technology', 'Today, 09:42', '1', '$42,800'], ['Lumina Studio', 'Creative services', 'Yesterday', '0', '$31,240'], ['Vertex Labs', 'Technology', 'Sep 01, 2026', '1', '$28,900'], ['Juniper & Co.', 'Marketing', 'Aug 30, 2026', '0', '$18,650']]
  },
  Settings: {
    label: 'Workspace administration', title: 'Settings', description: 'Manage your workspace preferences and account defaults.', action: 'Save changes',
    stats: [['Workspace', 'Mini NetSuite', 'Practice environment'], ['Currency', 'USD ($)', 'Default transaction currency'], ['Time zone', 'UTC +09:00', 'Japan Standard Time (Tokyo)']], heading: 'Workspace preferences',
    columns: ['Preference', 'Current value', 'Description'], rows: [['Company name', 'Mini NetSuite', 'Shown on invoices and reports'], ['Default payment terms', 'Net 30', 'Applied to new invoices'], ['Fiscal year starts', 'January', 'Used for reporting periods']]
  }
};

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((navItem) => navItem.classList.remove('active'));
    item.classList.add('active');
    const view = item.dataset.view;
    currentView.textContent = view;
    renderView(view);
  });
});

newTransactionButton.addEventListener('click', () => showToast('Transaction draft started'));

function renderView(view) {
  if (view === 'Overview') {
    overviewView.hidden = false;
    moduleView.hidden = true;
    return;
  }

  const page = modulePages[view];
  overviewView.hidden = true;
  moduleView.hidden = false;
  moduleView.innerHTML = `<section class="page-intro module-intro"><div><p class="eyebrow">${page.label}</p><h1>${page.title}<span class="accent-dot">.</span></h1><p class="muted">${page.description}</p></div><button class="primary-button module-action"><span>+</span> ${page.action}</button></section><section class="metric-grid module-metrics">${page.stats.map(([label, value, note]) => `<article class="metric-card"><div class="card-label"><span>${label}</span><span class="trend positive">●</span></div><strong>${value}</strong><small>${note}</small></article>`).join('')}</section><section class="panel module-table"><div class="panel-heading"><div><p class="eyebrow">${page.label}</p><h2>${page.heading}</h2></div><button class="text-button">Export <span>↓</span></button></div><div class="table-wrap"><table><thead><tr>${page.columns.map((column) => `<th>${column}</th>`).join('')}</tr></thead><tbody>${page.rows.map((row) => `<tr>${row.map((cell, index) => `<td class="${index === row.length - 1 ? 'amount' : ''}">${cell}${(cell === 'Pending' || cell === 'Paid' || cell === 'Overdue' || cell === 'Low stock' || cell === 'In stock') ? `<span class="pill ${cell.toLowerCase().replace(' ', '-')}">${cell}</span>` : ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
  moduleView.querySelector('.module-action').addEventListener('click', () => showToast(`${page.action} form started`));

  if (view === 'Settings') {
    moduleView.querySelector('.module-table').insertAdjacentHTML('beforeend', '<div class="settings-options"><label><span><strong>Email notifications</strong><small>Receive updates about invoices and stock alerts</small></span><input type="checkbox" checked></label><label><span><strong>Compact table view</strong><small>Show more records in less space</small></span><input type="checkbox"></label><label><span><strong>Two-step approval</strong><small>Require approval before sending invoices</small></span><input type="checkbox"></label></div>');
    moduleView.querySelectorAll('input[type="checkbox"]').forEach((input) => input.addEventListener('change', () => showToast(`${input.checked ? 'Enabled' : 'Disabled'} setting`)));
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}
