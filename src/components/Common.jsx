export function KpiCard({ label, value }) {
  return (
    <div className="kpi-card">
      <div className="label">{label}</div>
      <div className="value">{value ?? "-"}</div>
    </div>
  );
}

export function Panel({ title, children }) {
  return (
    <div className="panel">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}

export function Loading() {
  return <div className="empty-state">Loading...</div>;
}

export function Empty({ children = "No data found." }) {
  return <div className="empty-state">{children}</div>;
}

export function formatValue(value) {
  return value === undefined || value === null || value === "" ? "-" : value;
}

export function escapeHtml(value) {
  return String(value ?? "");
}
