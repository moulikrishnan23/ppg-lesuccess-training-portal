import { useEffect, useMemo, useState } from "react";
import { callServer } from "../services/appsScript";
import { KpiCard, Empty, Loading } from "../components/Common";

function display(value, suffix = "") {
  return value === "" || value === null || value === undefined ? "-" : `${value}${suffix}`;
}

export default function Performance({ token, onMessage }) {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!token) return;

    callServer("getStudents", token)
      .then((rows) => setStudents(Array.isArray(rows) ? rows : []))
      .catch(() => onMessage("Unable to load students.", "error"));
  }, [token]);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return students;

    return students.filter((s) => {
      const name = String(s.name || "").toLowerCase();
      const regNo = String(s.registerNumber || "").toLowerCase();
      return name.includes(q) || regNo.includes(q);
    });
  }, [students, query]);

  async function load(regNo) {
    try {
      setLoadingDetail(true);
      const data = await callServer("getStudentById", token, regNo);

      if (!data) {
        onMessage("Student not found.", "error");
        return;
      }

      setDetail(data);
    } catch (err) {
      onMessage(err?.message || "Unable to load student performance.", "error");
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <>
      <div className="toolbar">
        <div className="field search-box" style={{ flex: 1 }}>
          <label>Search by Register Number or Name</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student..."
          />
        </div>
      </div>

      <div className="panel">
        <h3>Student Performance</h3>

        {filteredStudents.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Register Number</th>
                  <th>Student Name</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr
                    key={s.registerNumber || `${s.sNo}-${s.name}`}
                    onClick={() => load(s.registerNumber)}
                    style={{ cursor: "pointer" }}
                    title="Click to view performance details"
                  >
                    <td>{s.sNo}</td>
                    <td>{s.registerNumber || "-"}</td>
                    <td>{s.name}</td>
                    <td>{s.department || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No students found.</Empty>
        )}
      </div>

      {loadingDetail && <div className="panel"><Loading /></div>}

      {detail && !loadingDetail && (
        <div className="panel">
          <h3>{detail.student.name}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {detail.student.department} · Reg. No: {detail.student.registerNumber}
          </p>

          <div className="kpi-grid">
            <KpiCard
              label="Attendance %"
              value={display(detail.attendance?.attendancePct, "%")}
            />
            <KpiCard label="Present" value={display(detail.attendance?.present)} />
            <KpiCard label="Absent" value={display(detail.attendance?.absent)} />
            <KpiCard label="Half Day" value={display(detail.attendance?.halfDay)} />
            <KpiCard label="Pre-Test Total" value={display(detail.preTest?.Total)} />
            <KpiCard
              label="Pre-Test %"
              value={display(detail.preTest?.Percentage, "%")}
            />
            <KpiCard
              label="Communication"
              value={display(detail.mockInterview?.communication)}
            />
            <KpiCard
              label="Confidence"
              value={display(detail.mockInterview?.confidence)}
            />
            <KpiCard
              label="Technical"
              value={display(detail.mockInterview?.technical)}
            />
            <KpiCard
              label="Analysis Total"
              value={display(detail.mockInterview?.total)}
            />
            <KpiCard
              label="Analysis %"
              value={display(detail.mockInterview?.percentage, "%")}
            />
            <KpiCard
              label="Post-Test %"
              value={display(detail.postTest?.percentage, "%")}
            />
            <KpiCard
              label="Mock Interview Score"
              value={display(detail.mockInterview?.total)}
            />
          </div>
        </div>
      )}
    </>
  );
}
