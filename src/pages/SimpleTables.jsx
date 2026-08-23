import { useEffect, useMemo, useState } from "react";
import { callServer } from "../services/appsScript";
import { Empty, Loading } from "../components/Common";

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

export function PrePost({ token, onMessage }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    return callServer("getPrePostComparison", token)
      .then(setRows)
      .catch((err) => {
        setError(err?.message || "Unable to load pre vs post comparison.");
        onMessage?.(err?.message || "Unable to load pre vs post comparison.", "error");
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
                <td>{r.department}</td>
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
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    return callServer("getFeedback", token)
      .then(setRows)
      .catch((err) => {
        setError(err?.message || "Unable to load feedback.");
        onMessage?.(err?.message || "Unable to load feedback.", "error");
      });
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows || [];

    return (rows || []).filter((r) =>
      `${r.studentName} ${r.faculty} ${r.department}`
        .toLowerCase()
        .includes(query)
    );
  }, [rows, search]);

  if (error && !rows) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Loading />;

  return (
    <>
      <div className="toolbar">
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Student, department or faculty..."
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
                  <td>{r.department}</td>
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
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    return callServer("getAnalysisData", token)
      .then(setRows)
      .catch((err) => {
        setError(err?.message || "Unable to load analysis.");
        onMessage?.(err?.message || "Unable to load analysis.", "error");
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
              <th>S.No</th>
              <th>Name</th>
              <th>Department</th>
              <th>Location</th>
              <th>Communication</th>
              <th>Confidence</th>
              <th>Technical</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((r) => (
              <tr key={`${r.sNo}-${r.name}`}>
                <td>{r.sNo}</td>
                <td>{r.name}</td>
                <td>{r.department}</td>
                <td>{r.location}</td>
                <td>{r.communication ?? "-"}</td>
                <td>{r.confidence ?? "-"}</td>
                <td>{r.technical ?? "-"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7"><Empty>No data.</Empty></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Reports({ token, onMessage }) {
  const [dept, setDept] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    return callServer("getReports", token, { department: dept })
      .then(setData)
      .catch((err) => {
        console.error("Reports load failed", err);
        const message = err?.message || "Unable to load reports.";
        setError(message);
        onMessage?.(message, "error");
      });
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  if (error && !data) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <Loading />;

  return (
    <>
      <div className="toolbar">
        <div className="field">
          <label>Department</label>
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">All</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="AIML">AIML</option>
            <option value="AIDS">AIDS</option>
            <option value="ECE">ECE</option>
          </select>
        </div>

        <button className="btn btn-save" onClick={load}>
          Apply Filter
        </button>
      </div>

      <div className="panel">
        <h3>Pre-Test Full Report</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Reg. No</th>
                <th>Total</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.preTestFull?.length ? data.preTestFull.map((r, i) => (
                <tr key={`${r.regNo}-${i}`}>
                  <td>{r.name}</td>
                  <td>{r.department}</td>
                  <td>{r.regNo}</td>
                  <td>{r.total ?? "-"}</td>
                  <td>{r.percentage ?? 0}%</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5"><Empty>No records.</Empty></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
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
                  <td>{r.department}</td>
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
      </div>
    </>
  );
}
