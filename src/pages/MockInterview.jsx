import { useEffect, useMemo, useState } from "react";
import { callServer } from "../services/appsScript";
import {
  Empty,
  Loading,
  FilterBar,
  departmentOptions,
  courseOptions,
  courseFromDepartment,
  normalizeDepartmentLabel,
} from "../components/Common";

function numberValue(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function MockInterview({ token, user, onMessage }) {
  const trainer = user.role === "Trainer";
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [scores, setScores] = useState({});
  const [remarks, setRemarks] = useState({});
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ department: "All", course: "All" });
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState("desc");

  async function load() {
    try {
      setError("");
      const res = await callServer("getMockInterviewData", token);
      setData(res);

      const draft = {};
      const remarkDraft = {};
      (res.records || []).forEach((r) => {
        draft[r.row] = r.score ?? "";
        remarkDraft[r.row] = r.remarks ?? "";
      });
      setScores(draft);
      setRemarks(remarkDraft);
    } catch (err) {
      setError(err?.message || "Unable to load mock interview data.");
      onMessage(err?.message || "Unable to load mock interview data.", "error");
    }
  }

  useEffect(() => {
    if (!token) return;
    load();
  }, [token]);

  const rawRecords = data?.records || [];

  const deptOptions = useMemo(
    () => departmentOptions(rawRecords.map((r) => r.department)),
    [rawRecords],
  );

  const courseOpts = useMemo(
    () => courseOptions(rawRecords.map((r) => r.department)),
    [rawRecords],
  );

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = rawRecords.filter((r) => {
      const name = String(r.name || "").toLowerCase();
      const regNo = String(r.regNo || "").toLowerCase();
      const department = normalizeDepartmentLabel(r.department);

      if (query && !name.includes(query) && !regNo.includes(query)) return false;
      if (filters.department !== "All" && department !== filters.department) return false;
      if (
        filters.course !== "All" &&
        courseFromDepartment(department) !== filters.course
      ) {
        return false;
      }

      return true;
    });

    if (!sortKey) return filtered;

    return [...filtered].sort((a, b) => {
      const av = numberValue(a[sortKey]);
      const bv = numberValue(b[sortKey]);

      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;

      const result = av - bv;
      return sortDir === "asc" ? result : -result;
    });
  }, [rawRecords, search, filters, sortKey, sortDir]);

  async function save(row) {
    try {
      const res = await callServer("saveMockInterview", token, {
        row,
        score: scores[row] ?? "",
        remarks: remarks[row] ?? "",
      });
      onMessage(res.message, res.success ? "success" : "error");
      if (res.success) load();
    } catch {
      onMessage("Unable to save mock interview score.", "error");
    }
  }

  if (error && !data) {
    return (
      <div className="empty-state">
        <div>{error}</div>
        <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={load}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        <div className="field search-box">
          <label>Search Student</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or register number..."
          />
        </div>

        <FilterBar
          filters={[
            { key: "department", label: "Department", options: deptOptions },
            { key: "course", label: "Course", options: courseOpts },
          ]}
          values={filters}
          onChange={(key, value) =>
            setFilters((prev) => ({ ...prev, [key]: value }))
          }
          sorts={[
            { key: "score", label: "Total Score" },
            { key: "percentage", label: "Total Percentage" },
          ]}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={(key, dir) => {
            setSortKey(key);
            setSortDir(dir);
          }}
        />

        {!trainer && <div className="readonly-note">View Only — Management</div>}
      </div>

      <div className="panel">
        {!data ? (
          <Loading />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Department</th>
                    <th>Student Name</th>
                    <th>Total Score</th>
                    <th>Total Percentage</th>
                    <th>Remarks</th>
                    {trainer && <th />}
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((r) => (
                      <tr key={r.row}>
                        <td>{r.sNo}</td>
                        <td>{normalizeDepartmentLabel(r.department)}</td>
                        <td>{r.name}</td>
                        <td>
                          {trainer ? (
                            <input
                              className="mark-input"
                              type="number"
                              value={scores[r.row] ?? ""}
                              onChange={(e) =>
                                setScores((prev) => ({
                                  ...prev,
                                  [r.row]: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            r.score ?? "-"
                          )}
                        </td>
                        <td>
                          {r.percentage === "" ||
                          r.percentage === null ||
                          r.percentage === undefined
                            ? "-"
                            : `${r.percentage}%`}
                        </td>
                        <td>
                          {trainer ? (
                            <input
                              className="mark-input"
                              type="text"
                              value={remarks[r.row] ?? ""}
                              onChange={(e) =>
                                setRemarks((prev) => ({
                                  ...prev,
                                  [r.row]: e.target.value,
                                }))
                              }
                              placeholder="Enter remarks"
                            />
                          ) : (
                            r.remarks || "-"
                          )}
                        </td>
                        {trainer && (
                          <td>
                            <button
                              className="btn btn-outline"
                              onClick={() => save(r.row)}
                            >
                              Save
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={trainer ? 7 : 6}>
                        <Empty>No records found.</Empty>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: 10,
                paddingRight: 20,
                textAlign: "end",
                color: "var(--text-muted)",
                fontSize: 12.5,
              }}
            >
              <b>Average:</b> {data.average ?? "-"}%
            </div>
          </>
        )}
      </div>
    </>
  );
}
