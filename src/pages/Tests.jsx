import { useEffect, useMemo, useState } from "react";
import { callServer } from "../services/appsScript";
import { Empty, Loading } from "../components/Common";

const DEFAULT_OPTION = {
  id: "PRE_TEST_1",
  label: "Pre Test 1",
};

function formatPercentage(value) {
  if (value === "" || value === null || value === undefined) {
    return "-";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "-";
  }

  const percentage = number > 0 && number <= 1 ? number * 100 : number;

  return `${Math.round(percentage * 100) / 100}%`;
}

function StudentPopup({ student, onClose, totalMark }) {
  if (!student) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          width: "100%",
          maxWidth: 600,
          maxHeight: "85vh",
          overflow: "auto",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "var(--primary)",
              }}
            >
              {student.name}
            </div>

            <div
              style={{
                fontSize: 12.5,
                color: "var(--text-muted)",
                marginTop: 4,
              }}
            >
              {student.department || "-"}
            </div>
          </div>

          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <div className="kpi-grid">
            <div>
              <div className="kpi-card">
                <div className="kpi-label">Percentage</div>
                <div className="kpi-value">
                  {formatPercentage(student.percentage)}
                </div>
              </div>
            </div>

            <div>
              <div className="kpi-card">
                <div className="kpi-label">Total</div>
                <div className="kpi-value">
                  {student.total + " / " + totalMark ?? "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Mark</th>
                </tr>
              </thead>

              <tbody>
                {student.mcq !== undefined && (
                  <tr>
                    <td>MCQ</td>
                    <td>{student.mcq ?? "-"}</td>
                  </tr>
                )}

                <tr>
                  <td>2 Marks</td>
                  <td>{student.twoMarks ?? "-"}</td>
                </tr>

                <tr>
                  <td>Coding</td>
                  <td>{student.coding ?? "-"}</td>
                </tr>

                <tr>
                  <td>Total</td>
                  <td>
                    {student.total ?? "-"}
                    {totalMark != null && ` / ${totalMark}`}
                  </td>
                </tr>

                <tr>
                  <td>Percentage</td>
                  <td>{formatPercentage(student.percentage)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankingTable({ title, students, totalMark, onSelect }) {
  return (
    <div className="panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3>{title}</h3>

        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          Click a student to view details
        </span>
      </div>

      {!students?.length ? (
        <Empty>No student data available.</Empty>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Department</th>
                <th>Total</th>
                <th>Percentage</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr
                  key={`${student.rank}-${student.name}`}
                  onClick={() => onSelect(student)}
                  style={{
                    cursor: "pointer",
                  }}
                  title="Click to view student details"
                >
                  <td>{student.rank}</td>

                  <td>{student.name}</td>

                  <td>{student.department || "-"}</td>

                  <td>{student.total + " / " + totalMark ?? "-"}</td>

                  <td>{formatPercentage(student.percentage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function downloadExcel(data, records) {
  if (!data?.block) return;

  const headers = ["S.No", "Department", "Student Name", ...data.block.cols];

  const rows = records.map((record) => [
    record.sNo,
    record.department,
    record.name,
    ...data.block.cols.map((column) => {
      const value = record.scores?.[column] ?? "";

      if (column === "Percentage") {
        return formatPercentage(value);
      }

      return value;
    }),
  ]);

  const escapeCell = (value) => {
    const text = value === null || value === undefined ? "" : String(value);

    return `"${text.replace(/"/g, '""')}"`;
  };

  const htmlRows = [headers, ...rows]
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td>${String(cell ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          ${htmlRows}
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel",
  });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;

  anchor.download = `${data.block.label}-${data.dateInfo?.date || "Report"}.xls`;

  document.body.appendChild(anchor);

  anchor.click();

  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}

function downloadPdf(data, records) {
  if (!data?.block) return;

  const rows = records
    .map(
      (record) => `
        <tr>
          <td>${record.sNo ?? ""}</td>
          <td>${record.department ?? ""}</td>
          <td>${record.name ?? ""}</td>
          ${data.block.cols
            .map((column) => {
              const value = record.scores?.[column] ?? "";

              return `
                <td>
                  ${column === "Percentage" ? formatPercentage(value) : value}
                </td>
              `;
            })
            .join("")}
        </tr>
      `,
    )
    .join("");

  const headers = `
    <th>S.No</th>
    <th>Department</th>
    <th>Student Name</th>
    ${data.block.cols.map((column) => `<th>${column}</th>`).join("")}
  `;

  const printWindow = window.open("", "_blank", "width=1200,height=800");

  if (!printWindow) {
    alert("Please allow popups to download the PDF.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${data.block.label}</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 25px;
          }

          h1 {
            margin-bottom: 5px;
          }

          .meta {
            margin-bottom: 20px;
            color: #555;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            border: 1px solid #999;
            padding: 8px;
            text-align: left;
          }

          th {
            background: #f1f1f1;
          }

          @media print {
            body {
              padding: 10px;
            }
          }
        </style>
      </head>

      <body>
        <h1>${data.block.label} -  </h1>

        <div class="meta">
          Students Attended:
          ${records.length}
        </div>

        <table>
          <thead>
            <tr>
              ${headers}
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

export default function Tests({ token, user, onMessage }) {
  const trainer = user?.role === "Trainer";

  const [options, setOptions] = useState([DEFAULT_OPTION]);

  const [creatingTest, setCreatingTest] = useState(false);

  const [testDate, setTestDate] = useState("");

  const [testTotalMark, setTestTotalMark] = useState("");

  const [blockId, setBlockId] = useState("PRE_TEST_1");

  const [search, setSearch] = useState("");

  const [data, setData] = useState(null);

  const [drafts, setDrafts] = useState({});

  const [analytics, setAnalytics] = useState(null);

  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [creatingPreTest, setCreatingPreTest] = useState(false);

  const [preTestDate, setPreTestDate] = useState("");

  const [totalMark, setTotalMark] = useState("");

  const load = async () => {
    if (!token || !blockId) {
      setData(null);
      return;
    }

    setData(null);
    setAnalytics(null);

    try {
      const res = await callServer("getTestData", token, blockId);

      if (!res || !res.block) {
        setData(null);
        setDrafts({});
        return;
      }

      setData(res);

      const next = {};

      (res.records || []).forEach((record) => {
        next[record.row] = {
          ...(record.scores || {}),
        };
      });

      setDrafts(next);
    } catch (error) {
      console.error(`Unable to load ${blockId}:`, error);

      setData(null);
      setDrafts({});

      onMessage?.(error?.message || "Unable to load assessment.", "error");
    }
  };

  const loadAnalytics = async () => {
    if (!token || !blockId) {
      setAnalytics(null);
      return;
    }

    setAnalyticsLoading(true);

    try {
      let result = null;

      if (/^PRE_TEST_\d+$/.test(blockId)) {
        result = await callServer("getPreTestAnalytics", token, blockId);
      } else if (/^TEST_\d+$/.test(blockId)) {
        result = await callServer("getTestAnalytics", token, blockId);
      }

      setAnalytics(result || null);
    } catch (error) {
      console.error(`Unable to load analytics for ${blockId}:`, error);

      setAnalytics(null);

      onMessage?.(error?.message || "Unable to load test analytics.", "error");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    loadAvailableTests();

    const interval = window.setInterval(loadAvailableTests, 10000);

    const handleFocus = () => {
      loadAvailableTests();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(interval);

      window.removeEventListener("focus", handleFocus);
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;

    loadAvailableTests();
  }, [token]);

  useEffect(() => {
    if (!token || !blockId) return;

    load();
    loadAnalytics();
  }, [token, blockId]);

  const records = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return data?.records || [];
    }

    return (data?.records || []).filter((record) =>
      record.name.toLowerCase().includes(value),
    );
  }, [data, search]);

  async function saveRow(row) {
    try {
      const res = await callServer("saveTestMarks", token, blockId, {
        row,
        scores: drafts[row] || {},
      });

      onMessage?.(res.message, res.success ? "success" : "error");

      if (res.success) {
        await load();
        await loadAnalytics();
      }
    } catch (error) {
      onMessage?.(error?.message || "Unable to save marks.", "error");
    }
  }

  async function createNextPreTest() {
    if (!trainer) return;

    if (!preTestDate) {
      onMessage?.("Please select the Pre-Test date.", "error");
      return;
    }

    if (!totalMark || Number(totalMark) <= 0) {
      onMessage?.("Please enter a valid total mark.", "error");
      return;
    }

    setCreatingPreTest(true);

    try {
      const result = await callServer("createNextPreTest", token, {
        date: preTestDate,
        totalMark: Number(totalMark),
      });

      if (!result.success) {
        onMessage?.(result.message || "Unable to create Pre-Test.", "error");
        return;
      }

      onMessage?.(
        result.message || "Pre-Test created successfully.",
        "success",
      );

      setPreTestDate("");
      setTotalMark("");

      /*
       * The new block is returned from Apps Script.
       * Select it immediately.
       */
      if (result.block?.id) {
        setBlockId(result.block.id);

        /*
         * Immediately load the newly-created Test.
         */
        await load();
      }
    } catch (error) {
      onMessage?.(error?.message || "Unable to create Pre-Test.", "error");
    } finally {
      setCreatingPreTest(false);
    }
  }

  const isPreTest = /^PRE_TEST_\d+$/.test(blockId);

  async function loadAvailableTests() {
    if (!token) return;

    try {
      const result = await callServer("getAvailableTests", token);

      if (Array.isArray(result) && result.length) {
        setOptions(result);

        /*
         * If currently selected test no longer
         * exists, select the first available one.
         */
        const exists = result.some((item) => item.id === blockId);

        if (!exists) {
          setBlockId(result[0].id);
        }
      }
    } catch (error) {
      onMessage?.(error?.message || "Unable to load tests.", "error");
    }
  }

  async function createNextTest() {
    if (!trainer) return;

    if (!testDate) {
      onMessage?.("Please select the Test date.", "error");
      return;
    }

    const mark = Number(testTotalMark);

    if (!isFinite(mark) || mark <= 0) {
      onMessage?.("Please enter a valid total mark.", "error");
      return;
    }

    setCreatingTest(true);

    try {
      const result = await callServer("createNextTest", token, {
        date: testDate,
        totalMark: mark,
      });

      if (!result?.success) {
        onMessage?.(result?.message || "Unable to create Test.", "error");

        return;
      }

      onMessage?.(result.message || "Test created successfully.", "success");

      /*
       * Clear form
       */
      setTestDate("");
      setTestTotalMark("");

      /*
       * Refresh from Google Sheet.
       *
       * This is important:
       * the Sheet remains the source of truth.
       */
      await loadAvailableTests();

      /*
       * Select the newly created Test.
       */
      if (result.block?.id) {
        setBlockId(result.block.id);
      }
    } catch (error) {
      onMessage?.(error?.message || "Unable to create Test.", "error");
    } finally {
      setCreatingTest(false);
    }
  }

  return (
    <>
      <div className="toolbar">
        <div className="field">
          <label>Assessment</label>

          <select value={blockId} onChange={(e) => setBlockId(e.target.value)}>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field search-box">
          <label>Search Student</label>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a name..."
          />
        </div>

        {trainer && (
          <>
            <div className="field">
              <label>Next Test Date</label>

              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Total Mark</label>

              <input
                type="number"
                min="1"
                value={testTotalMark}
                onChange={(e) => setTestTotalMark(e.target.value)}
                placeholder="Total mark"
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <button
                className="btn"
                disabled={creatingTest}
                onClick={createNextTest}
              >
                {creatingTest ? "Creating..." : "Add Next Test"}
              </button>
            </div>
          </>
        )}

        {!trainer && (
          <div className="readonly-note">View Only — Management</div>
        )}
      </div>

      <div className="panel">
        {!data ? (
          <Loading />
        ) : !data.block ? (
          <Empty>No assessment data available.</Empty>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 15,
              }}
            >
              <button
                className="btn btn-outline"
                onClick={() => downloadExcel(data, records)}
              >
                Download Excel
              </button>

              <button
                className="btn btn-outline"
                onClick={() => downloadPdf(data, records)}
              >
                Download PDF
              </button>
            </div>

            {data?.block && analytics && (
              <div
                className="kpi-grid"
                style={{
                  marginBottom: 18,
                }}
              >
                <div>
                  <div className="kpi-card">
                    <div className="kpi-label">Students Attended</div>

                    <div className="kpi-value">
                      {analyticsLoading
                        ? "..."
                        : (analytics?.attendedCount ?? 0)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                marginBottom: 15,
                color: "var(--text-muted)",
                fontSize: 12.5,
              }}
            >
              {/* Date: {data.dateInfo?.date || "-"}
              {" · "}
              Total Mark: {data.dateInfo?.totalMark ?? "-"} */}
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Department</th>
                    <th>Student Name</th>

                    {data.block.cols.map((column) => (
                      <th key={column}>{column}</th>
                    ))}

                    {trainer && <th>Action</th>}
                  </tr>
                </thead>

                <tbody>
                  {records.length ? (
                    records.map((record) => (
                      <tr key={record.row}>
                        <td>{record.sNo}</td>

                        <td>{record.department}</td>

                        <td>{record.name}</td>

                        {data.block.cols.map((column) => {
                          const editable =
                            trainer && data.block.editableCols.includes(column);

                          const value = drafts[record.row]?.[column] ?? "";

                          return (
                            <td key={column}>
                              {editable ? (
                                <input
                                  className="mark-input"
                                  type="number"
                                  min="0"
                                  value={
                                    value === "-" ||
                                    value === "A" ||
                                    value === null ||
                                    value === undefined
                                      ? ""
                                      : value
                                  }
                                  onChange={(e) =>
                                    setDrafts((previous) => ({
                                      ...previous,
                                      [record.row]: {
                                        ...(previous[record.row] || {}),
                                        [column]: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              ) : column === "Percentage" ? (
                                formatPercentage(value)
                              ) : value === "" ? (
                                "-"
                              ) : (
                                value
                              )}
                            </td>
                          );
                        })}

                        {trainer && (
                          <td>
                            <button
                              className="btn btn-outline"
                              onClick={() => saveRow(record.row)}
                            >
                              Save
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3 + data.block.cols.length + (trainer ? 1 : 0)}
                      >
                        <Empty>No records found.</Empty>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {data?.block && analytics && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: 18,
            marginTop: 18,
          }}
        >
          <RankingTable
            title={`${data.block.label} - Top 10 Performers`}
            students={analytics.top10 || []}
            totalMark={
              analytics?.dateInfo?.totalMark ??
              analytics?.totalMark ??
              data?.block?.totalMark ??
              0
            }
            onSelect={setSelectedStudent}
          />

          <RankingTable
            title={`${data.block.label} - Least 10 Performers`}
            students={analytics.least10 || []}
            totalMark={
              analytics?.dateInfo?.totalMark ??
              analytics?.totalMark ??
              data?.block?.totalMark ??
              0
            }
            onSelect={setSelectedStudent}
          />
        </div>
      )}

      <StudentPopup
        student={selectedStudent}
        totalMark={
          analytics?.dateInfo?.totalMark ?? analytics?.totalMark ?? null
        }
        onClose={() => setSelectedStudent(null)}
      />
    </>
  );
}
