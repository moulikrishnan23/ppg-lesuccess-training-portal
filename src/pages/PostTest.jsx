import { useEffect, useMemo, useState } from "react";
import { callServer } from "../services/appsScript";
import { Empty, Loading } from "../components/Common";

export default function PostTest({ token, user, onMessage }) {
  const trainer = user.role === "Trainer";
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const res = await callServer("getPostTestData", token);
      console.log("Post-Test response:", res);
      setData(res);
      const d = {};
      (res.records || []).forEach((r) => {
        d[r.row] = {
          mcq: r.mcq ?? "",
          twoMarks: r.twoMarks ?? "",
          coding: r.coding ?? ""
        };
      });
      setDrafts(d);
    } catch (err) {
      console.error("Post-Test load failed:", err);
      setError(err?.message || "Unable to load post-test.");
      onMessage(err?.message || "Unable to load post-test.", "error");
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
      const res = await callServer("savePostTest", token, { row, ...(drafts[row] || {}) });
      onMessage(res.message, res.success ? "success" : "error");
      if (res.success) load();
    } catch {
      onMessage("Unable to save post-test.", "error");
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
            <div style={{ marginBottom: 10, color: "var(--text-muted)", fontSize: 12.5 }}>
              Date: {data.dateInfo?.date || "-"} · Total Mark: {data.dateInfo?.totalMark ?? "-"}
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>S.No</th><th>Reg. No</th><th>Student Name</th><th>MCQ</th><th>2 Marks</th><th>Coding</th><th>Total</th><th>%</th>{trainer && <th />}</tr></thead>
                <tbody>
                  {rows.length ? rows.map((r) => (
                    <tr key={r.row}>
                      <td>{r.sNo}</td><td>{r.regNo}</td><td>{r.name}</td>
                      {["mcq", "twoMarks", "coding"].map((field) => (
                        <td key={field}>
                          {trainer ? (
                            <input className="mark-input" type="number" value={drafts[r.row]?.[field] ?? ""} onChange={(e) => setDrafts((prev) => ({
                            ...prev,
                            [r.row]: {
                              ...(prev[r.row] || {}),
                              [field]: e.target.value,
                            },
                          }))} />
                          ) : (r[field] === "" ? "-" : r[field])}
                        </td>
                      ))}
                      <td>{r.total ?? "-"}</td><td>{r.percentage ?? 0}%</td>
                      {trainer && <td><button className="btn btn-outline" onClick={() => save(r.row)}>Save</button></td>}
                    </tr>
                  )) : <tr><td colSpan={trainer ? 9 : 8}><Empty>No records found.</Empty></td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
