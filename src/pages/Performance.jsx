import { useEffect, useState } from "react";
import { callServer } from "../services/appsScript";
import { KpiCard, Empty, Loading } from "../components/Common";

export default function Performance({ token, onMessage }) {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    callServer("getStudents", token).then(setStudents).catch(() => onMessage("Unable to load students.", "error"));
  }, [token]);

  const matches = query.length < 2 ? [] : students
    .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || String(s.registerNumber).includes(query))
    .slice(0, 8);

  async function load(regNo) {
    try {
      const data = await callServer("getStudentById", token, regNo);
      if (!data) return onMessage("Student not found.", "error");
      setDetail(data);
    } catch {
      onMessage("Unable to load student performance.", "error");
    }
  }

  return (
    <>
      <div className="toolbar">
        <div className="field search-box" style={{ flex: 1 }}>
          <label>Search by Register Number or Name</label>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Start typing..." />
        </div>
      </div>

      {query.length >= 2 && (
        <div>
          {matches.map((s) => (
            <div key={s.registerNumber} className="panel" style={{ cursor: "pointer", padding: "12px 16px" }} onClick={() => load(s.registerNumber)}>
              <strong>{s.name}</strong> · {s.department} · {s.registerNumber}
            </div>
          ))}
          {!matches.length && <Empty>No matches found.</Empty>}
        </div>
      )}

      {detail && (
        <div className="panel">
          <h3>{detail.student.name}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {detail.student.department} · Reg. No: {detail.student.registerNumber}
          </p>
          <div className="student-card kpi-grid">
            <KpiCard label="Attendance %" value={`${detail.attendance.attendancePct}%`} />
            <KpiCard label="Present" value={detail.attendance.present} />
            <KpiCard label="Absent" value={detail.attendance.absent} />
            <KpiCard label="Pre-Test Total" value={detail.preTest?.Total ?? "-"} />
            <KpiCard label="Post-Test %" value={detail.postTest?.percentage ? `${detail.postTest.percentage}%` : "-"} />
            <KpiCard label="Mock Interview" value={detail.mockInterview?.score ?? "-"} />
          </div>
        </div>
      )}
    </>
  );
}
