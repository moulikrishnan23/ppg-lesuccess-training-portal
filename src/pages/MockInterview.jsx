import { useEffect, useMemo, useState } from "react";
import { callServer } from "../services/appsScript";
import { Empty, Loading } from "../components/Common";

export default function MockInterview({ token, user, onMessage }) {
  const trainer = user.role === "Trainer";
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [scores, setScores] = useState({});
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const res = await callServer("getMockInterviewData", token);
      console.log("Mock Interview response:", res);
      setData(res);
      const d = {};
      (res.records || []).forEach((r) => { d[r.row] = r.score ?? ""; });
      setScores(d);
    } catch (err) {
      console.error("Mock Interview load failed:", err);
      setError(err?.message || "Unable to load mock interview data.");
      onMessage(err?.message || "Unable to load mock interview data.", "error");
    }
  }

  useEffect(() => {
    if (!token) return;
    load();
  }, [token]);

  const rows = useMemo(
    () => (data?.records || []).filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [data, search]
  );

  async function save(row) {
    try {
      const res = await callServer("saveMockInterview", token, { row, score: scores[row] ?? "" });
      onMessage(res.message, res.success ? "success" : "error");
      if (res.success) load();
    } catch {
      onMessage("Unable to save mock interview score.", "error");
    }
  }

  return (
    <>
      <div className="toolbar">
        <div className="field search-box"><label>Search Student</label><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type a name..." /></div>
        {!trainer && <div className="readonly-note">View Only — Management</div>}
      </div>
      {error && !data && (
        <div className="empty-state" style={{ marginBottom: 12 }}>
          <div>{error}</div>
          <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={load}>Retry</button>
        </div>
      )}

      <div className="panel">
        {!data ? <Loading /> : (
          <>
            
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>S.No</th><th>Dept</th><th>Student Name</th><th>Total Score</th><th>Total Percentage</th>{trainer && <th />}</tr></thead>
                <tbody>
                  {rows.length ? rows.map((r) => (
                    <tr key={r.row}>
                      <td>{r.sNo}</td><td>{r.regNo}</td><td>{r.name}</td>
                      <td>{trainer ? <input className="mark-input" type="number" value={scores[r.row] ?? ""} onChange={(e) => setScores((prev) => ({ ...prev, [r.row]: e.target.value }))} /> : (r.score ?? "-")}</td>
                      <td>{r.percentage ?? 0}%</td>
                      {trainer && <td><button className="btn btn-outline" onClick={() => save(r.row)}>Save</button></td>}
                    </tr>
                  )) : <tr><td colSpan={trainer ? 6 : 5}><Empty>No records found.</Empty></td></tr>}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 10, paddingRight: 20, textAlign:"end", color: "var(--text-muted)", fontSize: 12.5 }}>
              <b>Average:</b> {data.average ?? "-"}%
            </div>
          </>
        )}
      </div>
    </>
  );
}
