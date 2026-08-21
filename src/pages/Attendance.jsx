import { useEffect, useMemo, useState } from "react";
import { callServer } from "../services/appsScript";
import { Empty, Loading } from "../components/Common";

export default function Attendance({ token, user, onMessage }) {
  const trainer = user.role === "Trainer";
  const [date, setDate] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
  });
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", registerNumber: "", department: "" });

  const load = () => {
    setRecords(null);
    callServer("getAttendance", token, date)
      .then((res) => setRecords(res))
      .catch(() => onMessage("Unable to load attendance.", "error"));
  };

  useEffect(() => {
    if (!token) return;
    load();
  }, [token, date]);

  const filtered = useMemo(
    () => (records?.records || []).filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase())
    ),
    [records, search]
  );

  function updateStatus(row, status) {
    setRecords((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        records: prev.records.map((r) =>
          r.row === row ? { ...r, status } : r
        ),
      };
    });
  }

  async function save() {
    const selected = (records?.records || [])
      .filter((r) => r.status)
      .map((r) => ({ row: r.row, status: r.status }));

    if (!selected.length) {
      onMessage("Please mark attendance for at least one student.", "error");
      return;
    }

    try {
      const res = await callServer("saveAttendance", token, { date, records: selected });
      onMessage(res.message, res.success ? "success" : "error");
      if (res.success) load();
    } catch {
      onMessage("Unable to save attendance.", "error");
    }
  }

  async function addStudent() {
    if (!newStudent.name.trim() || !newStudent.registerNumber.trim()) {
      onMessage("Student Name and Register Number are required.", "error");
      return;
    }
    try {
      const res = await callServer("addStudent", token, newStudent);
      onMessage(res.message, res.success ? "success" : "error");
      if (res.success) {
        setAddOpen(false);
        setNewStudent({ name: "", registerNumber: "", department: "" });
        load();
      }
    } catch {
      onMessage("Unable to add student.", "error");
    }
  }

  return (
    <>
      <div className="toolbar">
        <div className="field">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field search-box">
          <label>Search Student</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type a name..." />
        </div>

        {trainer ? (
          <>
            <button className="btn btn-outline" onClick={() => setAddOpen((v) => !v)}>+ Add Student</button>
            <button className="btn btn-save" onClick={save}>Save Attendance</button>
          </>
        ) : (
          <div className="readonly-note">View Only — Management</div>
        )}
      </div>

      {addOpen && (
        <div className="panel">
          <h3>Add New Student</h3>
          <div className="toolbar">
            {[
              ["name", "Student Name", "Full name"],
              ["registerNumber", "Register Number", "Register number"],
              ["department", "Department", "e.g. B.E CSE"],
            ].map(([key, label, placeholder]) => (
              <div className="field" key={key}>
                <label>{label}</label>
                <input
                  value={newStudent[key]}
                  placeholder={placeholder}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
            <button className="btn btn-save" onClick={addStudent}>Add Student</button>
            <button className="btn btn-outline" onClick={() => setAddOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="panel">
        {!records ? <Loading /> : !records.withinTrainingPeriod ? (
          <Empty>Selected date is outside the training period for this batch.</Empty>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>S.No</th><th>Department</th><th>Student Name</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.length ? filtered.map((r) => (
                  <tr key={r.row}>
                    <td>{r.sNo}</td><td>{r.department}</td><td>{r.name}</td>
                    <td>
                      {trainer ? (
                        <select className="status-select" value={r.status || ""} onChange={(e) => updateStatus(r.row, e.target.value)}>
                          <option value="">-- Select --</option>
                          <option>Present</option>
                          <option>Absent</option>
                          <option>Half Day</option>
                        </select>
                      ) : <span className={`status-${(r.status || "").replace(" ", "")}`}>{r.status || "-"}</span>}
                    </td>
                  </tr>
                )) : <tr><td colSpan="4"><Empty>No students found.</Empty></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
