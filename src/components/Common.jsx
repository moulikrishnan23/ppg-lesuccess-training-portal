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

/* ------------------------------------------------------------------ */
/*  Shared Filter / Sort bar                                           */
/*                                                                      */
/*  A single reusable "Filter" toggle button + dropdown panel used by  */
/*  Attendance, Syllabus, Tests, Mock Interview, and SimpleTables so   */
/*  every table gets the same filter/sort look and behaviour.          */
/*                                                                      */
/*  filters: [{ key, label, options: [{ value, label }] }]             */
/*  sorts (optional): [{ key, label }] — rendered as a "Sort by" +     */
/*    Highest→Lowest / Lowest→Highest direction toggle.                */
/* ------------------------------------------------------------------ */

export function FilterBar({
  filters = [],
  values = {},
  onChange,
  sorts = null,
  sortKey = "",
  sortDir = "desc",
  onSortChange,
}) {
  function clearAll() {
    filters.forEach((f) => onChange(f.key, "All"));
    if (onSortChange) onSortChange("", "desc");
  }

  return (
    <div
      className="filter-bar"
      style={{
        display: "flex",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      {filters.map((f) => (
        <div className="field" key={f.key}>
          <label>{f.label}</label>
          <select
            value={values[f.key] || "All"}
            onChange={(e) => onChange(f.key, e.target.value)}
          >
            <option value="All">All</option>
            {(f.options || []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {sorts && sorts.length > 0 && (
        <>
          <div className="field">
            <label>Sort by</label>
            <select
              value={sortKey}
              onChange={(e) => onSortChange?.(e.target.value, sortDir)}
            >
              <option value="">-- None --</option>
              {sorts.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Direction</label>
            <select
              value={sortDir}
              disabled={!sortKey}
              onChange={(e) => onSortChange?.(sortKey, e.target.value)}
            >
              <option value="desc">Highest → Lowest</option>
              <option value="asc">Lowest → Highest</option>
            </select>
          </div>
        </>
      )}

      {(filters.length > 0 || (sorts && sorts.length > 0)) && (
        <button
          type="button"
          className="btn btn-outline"
          onClick={clearAll}
        >
          Clear
        </button>
      )}
    </div>
  );
}

/**
 * Groups department strings into their canonical form so variants
 * like "B.E CSE" / "B.E. CSE" / "B.E IT" / "B.Tech IT" collapse into
 * the canonical B.E IT bucket instead of listing near-duplicates. Mirrors
 * normalizeDepartment_() on the backend so labels match exactly.
 */
export function normalizeDepartmentLabel(raw) {
  const value = String(raw ?? "")
    .toUpperCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!value) return "Unassigned";

  const hasAI = value.indexOf("AI") !== -1;
  const hasML = value.indexOf("ML") !== -1;
  const hasDS = value.indexOf("DS") !== -1;
  const hasECE = value.indexOf("ECE") !== -1;
  const hasCSE = value.indexOf("CSE") !== -1;
  const hasIT = value.indexOf("IT") !== -1;

  if (hasAI && hasML) return "B.E CSE (AI & ML)";
  if (hasAI && hasDS) return "B.Tech (AI & DS)";
  if (hasECE) return "B.E ECE";
  if (hasCSE) return "B.E CSE";
  if (hasIT) return "B.E IT";

  return String(raw ?? "").trim();
}

/** "B.E CSE" -> "B.E", "B.Tech IT" -> "B.Tech" */
export function courseFromDepartment(department) {
  const label = normalizeDepartmentLabel(department);
  return label.split(" ")[0] || "";
}

/** Unique {value,label} option list for a set of raw department strings. */
export function departmentOptions(rawValues) {
  const set = new Map();
  (rawValues || []).forEach((raw) => {
    const label = normalizeDepartmentLabel(raw);
    if (label && label !== "Unassigned") set.set(label, label);
  });
  return Array.from(set.values())
    .sort()
    .map((label) => ({ value: label, label }));
}

/** Unique {value,label} option list for the B.E / B.Tech course filter. */
export function courseOptions(rawValues) {
  const set = new Set();
  (rawValues || []).forEach((raw) => {
    const course = courseFromDepartment(raw);
    if (course) set.add(course);
  });
  return Array.from(set.values())
    .sort()
    .map((c) => ({ value: c, label: c }));
}
