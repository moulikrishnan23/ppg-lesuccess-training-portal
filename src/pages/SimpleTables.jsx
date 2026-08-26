import { useEffect, useMemo, useState } from "react";
import { callServer } from "../services/appsScript";
import {
  Empty,
  Loading,
  FilterBar,
  departmentOptions,
  normalizeDepartmentLabel,
} from "../components/Common";

function Search({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="field search-box">
      <label>Search</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="empty-state">
      <div>{message}</div>
      {onRetry && (
        <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

function numeric(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function sortedRows(rows, sortKey, sortDir) {
  if (!sortKey) return rows;

  return [...rows].sort((a, b) => {
    const av = numeric(a[sortKey]);
    const bv = numeric(b[sortKey]);

    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;

    const result = av - bv;
    return sortDir === "asc" ? result : -result;
  });
}

function formatDateForInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function PrePost({ token, onMessage }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    return callServer("getPrePostComparison", token)
      .then(setRows)
      .catch((err) => {
        const message = err?.message || "Unable to load pre vs post comparison.";
        setError(message);
        onMessage?.(message, "error");
      });
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  if (error && !rows) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Loading />;

  return (
    <div className="panel">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Pre-Test Avg</th>
              <th>Post-Test Avg</th>
              <th>Improvement</th>
              <th>Avg Attendance</th>
              <th>Students Compared</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((r) => (
              <tr key={r.department}>
                <td>{normalizeDepartmentLabel(r.department)}</td>
                <td>{r.preTestAverage}%</td>
                <td>{r.postTestAverage}%</td>
                <td>{r.improvement}%</td>
                <td>{r.averageAttendance}%</td>
                <td>{r.studentsCompared}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6"><Empty>No data.</Empty></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Feedback({ token, onMessage }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [filters, setFilters] = useState({
    department: "All",
    faculty: "All",
  });
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState("desc");

  const load = () => {
    setError("");
    return callServer("getFeedback", token)
      .then(setRows)
      .catch((err) => {
        const message = err?.message || "Unable to load feedback.";
        setError(message);
        onMessage?.(message, "error");
      });
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const deptOpts = useMemo(
    () => departmentOptions((rows || []).map((r) => r.department)),
    [rows],
  );

  const facultyOpts = useMemo(() => {
    const set = new Set(
      (rows || [])
        .map((r) => String(r.faculty || "").trim())
        .filter(Boolean),
    );
    return Array.from(set).sort().map((value) => ({ value, label: value }));
  }, [rows]);

  const filtered = useMemo(() => {
    const result = (rows || []).filter((r) => {
      if (
        filters.department !== "All" &&
        normalizeDepartmentLabel(r.department) !== filters.department
      ) {
        return false;
      }

      if (filters.faculty !== "All" && r.faculty !== filters.faculty) return false;

      if (date) {
        const rowDate = formatDateForInput(r.date);
        if (rowDate !== date) return false;
      }

      return true;
    });

    return sortedRows(result, sortKey, sortDir);
  }, [rows, filters, date, sortKey, sortDir]);

  if (error && !rows) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Loading />;

  return (
    <>
      <div className="toolbar">
        <div className="field">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <FilterBar
          filters={[
            { key: "department", label: "Department", options: deptOpts },
            { key: "faculty", label: "Faculty", options: facultyOpts },
          ]}
          values={filters}
          onChange={(key, value) =>
            setFilters((prev) => ({ ...prev, [key]: value }))
          }
          sorts={[{ key: "rating", label: "Rating" }]}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={(key, dir) => {
            setSortKey(key);
            setSortDir(dir);
          }}
        />
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Department</th>
                <th>Faculty</th>
                <th>Rating</th>
                <th>Suggestion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((r, i) => (
                <tr key={`${r.registerNumber}-${r.date}-${i}`}>
                  <td>{r.date}</td>
                  <td>{r.studentName}</td>
                  <td>{normalizeDepartmentLabel(r.department)}</td>
                  <td>{r.faculty}</td>
                  <td>{r.rating ?? "-"}</td>
                  <td>{r.suggestion || "-"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6"><Empty>No feedback found.</Empty></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function Analysis({ token, onMessage }) {
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ department: "All" });
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    return callServer("getAnalysisData", token)
      .then(setRows)
      .catch((err) => {
        const message = err?.message || "Unable to load analysis.";
        setError(message);
        onMessage?.(message, "error");
      });
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const deptOpts = useMemo(
    () => departmentOptions((rows || []).map((r) => r.department)),
    [rows],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = (rows || []).filter((r) => {
      if (query && !String(r.name || "").toLowerCase().includes(query)) {
        return false;
      }

      if (
        filters.department !== "All" &&
        normalizeDepartmentLabel(r.department) !== filters.department
      ) {
        return false;
      }

      return true;
    });

    return sortedRows(result, sortKey, sortDir);
  }, [rows, search, filters, sortKey, sortDir]);

  if (error && !rows) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Loading />;

  return (
    <>
      <div className="toolbar">
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Search student name..."
        />

        <FilterBar
          filters={[
            { key: "department", label: "Department", options: deptOpts },
          ]}
          values={filters}
          onChange={(key, value) =>
            setFilters((prev) => ({ ...prev, [key]: value }))
          }
          sorts={[
            { key: "communication", label: "Communication" },
            { key: "confidence", label: "Confidence" },
            { key: "technical", label: "Technical" },
          ]}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={(key, dir) => {
            setSortKey(key);
            setSortDir(dir);
          }}
        />
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Department</th>
                <th>Communication (5)</th>
                <th>Confidence (5)</th>
                <th>Technical (40)</th>
                <th>Total (50)</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((r) => (
                <tr key={`${r.sNo}-${r.name}`}>
                  <td>{r.sNo}</td>
                  <td>{r.name}</td>
                  <td>{normalizeDepartmentLabel(r.department)}</td>
                  <td>{r.communication ?? "-"}</td>
                  <td>{r.confidence ?? "-"}</td>
                  <td>{r.technical ?? "-"}</td>
                  <td>{r.total ?? "-"}</td>
                  <td>
                    {r.percentage === "" ||
                    r.percentage === null ||
                    r.percentage === undefined
                      ? "-"
                      : `${r.percentage}%`}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8"><Empty>No data.</Empty></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function Reports({ token, onMessage }) {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ department: "All" });
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const res = await callServer("getReports", token, {
        department: filters.department === "All" ? "" : filters.department,
      });
      setData(res);
    } catch (err) {
      const message = err?.message || "Unable to load reports.";
      setError(message);
      onMessage?.(message, "error");
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const allReportRows = data?.preTestFull || [];

  const deptOpts = useMemo(
    () => departmentOptions(allReportRows.map((r) => r.department)),
    [allReportRows],
  );

  /*
   * The department filter is sent to Apps Script when Apply is pressed.
   * The local list is also normalized, so B.E CSE and B.E. CSE remain one
   * department option even if the source data contains both variants.
   */
  const reportRows = useMemo(() => {
    let result = allReportRows;

    if (filters.department !== "All") {
      result = result.filter(
        (r) => normalizeDepartmentLabel(r.department) === filters.department,
      );
    }

    return sortedRows(result, sortKey, sortDir);
  }, [allReportRows, filters.department, sortKey, sortDir]);

  if (error && !data) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <Loading />;

  return (
    <>
      <div className="toolbar">
        <FilterBar
          filters={[
            { key: "department", label: "Department", options: deptOpts },
          ]}
          values={filters}
          onChange={(key, value) =>
            setFilters((prev) => ({ ...prev, [key]: value }))
          }
          sorts={[
            { key: "java", label: "Java" },
            { key: "sql", label: "SQL" },
            { key: "dsa", label: "DSA" },
            { key: "frontEnd", label: "Front-End" },
            { key: "aptitude", label: "Aptitude" },
            { key: "coding", label: "Coding" },
            { key: "total", label: "Total" },
            { key: "percentage", label: "Percentage" },
          ]}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={(key, dir) => {
            setSortKey(key);
            setSortDir(dir);
          }}
        />

      </div>

      <div className="panel">
        <h3>Pre-Test Full Report</h3>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Department</th>
                <th>Reg. No</th>
                <th>Java /10</th>
                <th>SQL /10</th>
                <th>DSA /10</th>
                <th>Front End /15</th>
                <th>Aptitude /15</th>
                <th>Coding /40</th>
                <th>Total</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.length ? reportRows.map((r, i) => (
                <tr key={`${r.regNo}-${r.name}-${i}`}>
                  <td>{r.sNo}</td>
                  <td>{r.name}</td>
                  <td>{normalizeDepartmentLabel(r.department)}</td>
                  <td>{r.regNo || "-"}</td>
                  <td>{r.java ?? "-"}</td>
                  <td>{r.sql ?? "-"}</td>
                  <td>{r.dsa ?? "-"}</td>
                  <td>{r.frontEnd ?? "-"}</td>
                  <td>{r.aptitude ?? "-"}</td>
                  <td>{r.coding ?? "-"}</td>
                  <td>{r.total ?? "-"}</td>
                  <td>
                    {r.percentage === "" ||
                    r.percentage === null ||
                    r.percentage === undefined
                      ? "-"
                      : `${r.percentage}%`}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="12"><Empty>No records.</Empty></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* <div className="panel">
        <h3>Pre-Test vs Post-Test</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Pre-Test Avg</th>
                <th>Post-Test Avg</th>
                <th>Improvement</th>
                <th>Attendance</th>
                <th>Compared</th>
              </tr>
            </thead>
            <tbody>
              {data.prePost?.length ? data.prePost.map((r) => (
                <tr key={r.department}>
                  <td>{normalizeDepartmentLabel(r.department)}</td>
                  <td>{r.preTestAverage}%</td>
                  <td>{r.postTestAverage}%</td>
                  <td>{r.improvement}%</td>
                  <td>{r.averageAttendance}%</td>
                  <td>{r.studentsCompared}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6"><Empty>No comparison data.</Empty></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div> */}
    </>
  );
}
