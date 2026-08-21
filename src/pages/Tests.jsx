import { useEffect, useMemo, useState } from "react";
import { callServer } from "../services/appsScript";
import { Empty, Loading } from "../components/Common";

const OPTIONS = [
  { id: "PRE_TEST_1", label: "Pre Test 1" },
  ...Array.from({ length: 16 }, (_, i) => ({ id: `TEST_${i + 2}`, label: `Test ${i + 2}` })),
];

export default function Tests({ token, user, onMessage }) {
  const trainer = user.role === "Trainer";
  const [blockId, setBlockId] = useState("PRE_TEST_1");
  const [search, setSearch] = useState("");
  const [data, setData] = useState(null);
  const [drafts, setDrafts] = useState({});

  const load = () => {
    setData(null);
    callServer("getTestData", token, blockId)
      .then((res) => {
        setData(res);
        const next = {};
        (res.records || []).forEach((r) => { next[r.row] = { ...(r.scores || {}) }; });
        setDrafts(next);
      })
      .catch(() => onMessage("Unable to load assessment.", "error"));
  };

  useEffect(() => {
    if (!token) return;
    load();
  }, [token, blockId]);

  const records = useMemo(
    () => (data?.records || []).filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [data, search]
  );

  async function saveRow(row) {
    try {
      const res = await callServer("saveTestMarks", token, blockId, { row, scores: drafts[row] || {} });
      onMessage(res.message, res.success ? "success" : "error");
      if (res.success) load();
    } catch {
      onMessage("Unable to save marks.", "error");
    }
  }

  return (
    <>
      <div className="toolbar">
        <div className="field">
          <label>Assessment</label>
          <select value={blockId} onChange={(e) => setBlockId(e.target.value)}>
            {OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
        <div className="field search-box">
          <label>Search Student</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type a name..." />
        </div>
        {!trainer && <div className="readonly-note">View Only — Management</div>}
      </div>

      <div className="panel">
        {!data ? <Loading /> : !data.block ? <Empty>No assessment data available.</Empty> : (
          <>
            <div style={{ marginBottom: 10, color: "var(--text-muted)", fontSize: 12.5 }}>
              Date: {data.dateInfo?.date || "-"} · Total Mark: {data.dateInfo?.totalMark ?? "-"}
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.No</th><th>Department</th><th>Student Name</th>
                    {data.block.cols.map((c) => <th key={c}>{c}</th>)}
                    {trainer && <th />}
                  </tr>
                </thead>
                <tbody>
                  {records.length ? records.map((r) => (
                    <tr key={r.row}>
                      <td>{r.sNo}</td><td>{r.department}</td><td>{r.name}</td>
                      {data.block.cols.map((col) => {
                        const editable = trainer && data.block.editableCols.includes(col);
                        const value = drafts[r.row]?.[col] ?? "";
                        return (
                          <td key={col}>
                            {editable ? (
                              <input
                                className="mark-input"
                                type="number"
                                min="0"
                                value={value}
                                onChange={(e) =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [r.row]: {
                                      ...(prev[r.row] || {}),
                                      [col]: e.target.value,
                                    },
                                  }))
                                }
                              />
                            ) : (value === "" ? "-" : value)}
                          </td>
                        );
                      })}
                      {trainer && <td><button className="btn btn-outline" onClick={() => saveRow(r.row)}>Save</button></td>}
                    </tr>
                  )) : <tr><td colSpan={3 + data.block.cols.length + (trainer ? 1 : 0)}><Empty>No records found.</Empty></td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
