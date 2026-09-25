import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { callServer } from "../services/appsScript";
import { KpiCard, Loading, Empty, normalizeDepartmentLabel } from "../components/Common";

/* ------------------------------------------------------------------ */
/*  Small local helpers (kept inside this file so no other files      */
/*  need to change)                                                    */
/* ------------------------------------------------------------------ */

function todayDateStr() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function pctLabel(value) {
  return value === "" || value === null || value === undefined ? "-" : `${value}%`;
}

/* ------------------------------------------------------------------ */
/*  Modal shell                                                        */
/* ------------------------------------------------------------------ */

function Modal({ title, subtitle, onClose, children }) {
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
        zIndex: 500,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          width: "100%",
          maxWidth: 620,
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>{title}</div>
            {subtitle && (
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 }}>{subtitle}</div>
            )}
          </div>
          <button
            className="btn btn-outline"
            style={{ padding: "4px 10px", fontSize: 12 }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div style={{ padding: 20, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function DeptTable({ columns, rows }) {
  if (!rows || !rows.length) return <Empty>No department-wise data found.</Empty>;
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.department || i}>
              {columns.map((c) => (
                <td key={c.key}>{row[c.key] ?? "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Student ranking table (used for both Top 10 and Least 10)          */
/* ------------------------------------------------------------------ */

function resolveTestColumns(students, explicitColumns) {
  if (Array.isArray(explicitColumns) && explicitColumns.length > 0) {
    return explicitColumns.filter(
      (c) => c.label !== "Test 1" && c.key !== "test1" && c.id !== "TEST_1",
    );
  }

  const cols = [];
  const hasPreTest = students.some(
    (s) => s.preTest1 !== undefined || s.preTest !== undefined,
  );
  if (hasPreTest) {
    cols.push({ key: "preTest1", altKey: "preTest", id: "PRE_TEST_1", label: "PreTest 1" });
  }

  const testNums = new Set();
  students.forEach((s) => {
    Object.keys(s).forEach((k) => {
      const m = k.match(/^TEST_(\d+)$/i) || k.match(/^test(\d+)$/i);
      if (m) {
        const num = parseInt(m[1], 10);
        if (num > 1) testNums.add(num);
      }
    });
    if (s.testScores) {
      Object.keys(s.testScores).forEach((k) => {
        const m = k.match(/^TEST_(\d+)$/i);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > 1) testNums.add(num);
        }
      });
    }
  });

  const sortedNums = Array.from(testNums).sort((a, b) => a - b);
  sortedNums.forEach((num) => {
    cols.push({
      key: `TEST_${num}`,
      altKey: `test${num}`,
      id: `TEST_${num}`,
      label: `Test ${num}`,
    });
  });

  return cols;
}

function getStudentTestScore(student, col) {
  if (
    col.id === "PRE_TEST_1" ||
    col.key === "preTest1" ||
    col.label === "PreTest 1"
  ) {
    if (student.preTest1 !== undefined && student.preTest1 !== null) {
      return student.preTest1;
    }
    if (student.preTest !== undefined && student.preTest !== null) {
      return student.preTest;
    }
    if (student.testScores?.PRE_TEST_1 !== undefined) {
      return student.testScores.PRE_TEST_1;
    }
    return "-";
  }

  if (student[col.key] !== undefined && student[col.key] !== null) {
    return student[col.key];
  }
  if (col.altKey && student[col.altKey] !== undefined && student[col.altKey] !== null) {
    return student[col.altKey];
  }
  if (col.id && student.testScores && student.testScores[col.id] !== undefined) {
    return student.testScores[col.id];
  }
  if (student.testScores && student.testScores[col.key] !== undefined) {
    return student.testScores[col.key];
  }
  return "-";
}

function StudentRankTable({ students, onSelect, testColumns }) {
  const hasPerformanceData = students.some(
    (s) =>
      s.total !== undefined ||
      s.percentage !== undefined ||
      s.preTest1 !== undefined ||
      s.preTest !== undefined ||
      s.communication !== undefined,
  );

  const hasDayWiseData =
    !hasPerformanceData &&
    students.some(
      (s) =>
        s.latestPercentage !== undefined ||
        s.improvementGrowth !== undefined ||
        s.compositeScore !== undefined,
    );

  const resolvedTestCols = hasPerformanceData
    ? resolveTestColumns(students, testColumns)
    : [];

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ whiteSpace: "nowrap" }}>Rank</th>
            <th style={{ whiteSpace: "nowrap" }}>Name</th>
            {hasPerformanceData ? (
              <>
                <th style={{ whiteSpace: "nowrap" }}>Roll No</th>
                <th style={{ whiteSpace: "nowrap", textAlign: "right" }}>Communication</th>
                <th style={{ whiteSpace: "nowrap", textAlign: "right" }}>Confidence</th>
                <th style={{ whiteSpace: "nowrap", textAlign: "right" }}>Technical</th>
                {resolvedTestCols.map((col) => (
                  <th
                    key={col.key || col.id}
                    style={{ whiteSpace: "nowrap", textAlign: "right" }}
                  >
                    {col.label}
                  </th>
                ))}
                <th style={{ whiteSpace: "nowrap", textAlign: "right" }}>Total</th>
                <th style={{ whiteSpace: "nowrap", textAlign: "right" }}>Percentage</th>
              </>
            ) : (
              <>
                <th style={{ whiteSpace: "nowrap" }}>Department</th>
                {hasDayWiseData && <th style={{ whiteSpace: "nowrap" }}>Latest Test</th>}
                {hasDayWiseData && <th style={{ whiteSpace: "nowrap" }}>Growth</th>}
                {hasDayWiseData && <th style={{ whiteSpace: "nowrap" }}>Rank Score</th>}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr
              key={`${s.rank}-${s.rollNo || s.registerNumber || s.name}`}
              onClick={() => onSelect(s)}
              style={{ cursor: "pointer" }}
              title="Click to view student details"
            >
              <td style={{ whiteSpace: "nowrap" }}>{s.rank}</td>
              <td style={{ whiteSpace: "nowrap", fontWeight: 600 }}>{s.name}</td>
              {hasPerformanceData ? (
                <>
                  <td style={{ whiteSpace: "nowrap" }}>{s.rollNo || s.registerNumber || "-"}</td>
                  <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                    {s.communication !== undefined && s.communication !== null ? s.communication : "-"}
                  </td>
                  <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                    {s.confidence !== undefined && s.confidence !== null ? s.confidence : "-"}
                  </td>
                  <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                    {s.technical !== undefined && s.technical !== null ? s.technical : "-"}
                  </td>
                  {resolvedTestCols.map((col) => (
                    <td
                      key={col.key || col.id}
                      style={{ whiteSpace: "nowrap", textAlign: "right" }}
                    >
                      {getStudentTestScore(s, col)}
                    </td>
                  ))}
                  <td style={{ whiteSpace: "nowrap", textAlign: "right", fontWeight: 600 }}>
                    {s.total !== undefined && s.total !== null ? s.total : "-"}
                  </td>
                  <td style={{ whiteSpace: "nowrap", textAlign: "right", fontWeight: 600, color: "var(--primary, #0B3D5C)" }}>
                    {s.percentage !== undefined && s.percentage !== null
                      ? typeof s.percentage === "number"
                        ? `${s.percentage.toFixed(2)}%`
                        : `${s.percentage}%`
                      : "-"}
                  </td>
                </>
              ) : (
                <>
                  <td>{s.department}</td>
                  {hasDayWiseData && (
                    <>
                      <td>
                        {s.latestPercentage === undefined
                          ? "-"
                          : `${s.latestPercentage}%`}
                      </td>
                      <td>
                        {s.improvementGrowth === undefined
                          ? "-"
                          : `${s.improvementGrowth}%`}
                      </td>
                      <td>
                        {s.compositeScore === undefined
                          ? "-"
                          : typeof s.compositeScore === "number"
                          ? `${s.compositeScore}%`
                          : s.compositeScore}
                      </td>
                    </>
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Student day-wise improvement popup body                            */
/* ------------------------------------------------------------------ */

function StudentTimeline({ detail }) {
  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const timeline = [
    { label: "Pre Test 1", value: toNumberOrNull(detail.preTest?.Total) },
    ...(detail.tests || []).map((t) => ({
      label: t.blockLabel,
      value: toNumberOrNull(t.Total),
    })),
  ];

  const max = Math.max(1, ...timeline.map((t) => t.value || 0));
  let previous = null;

  useEffect(() => {
    if (!chartCanvasRef.current) return;

    chartInstanceRef.current?.destroy();
    chartInstanceRef.current = new Chart(chartCanvasRef.current, {
      type: "line",
      data: {
        labels: timeline.map((t) => t.label),
        datasets: [
          {
            label: "Score",
            data: timeline.map((t) => t.value),
            spanGaps: true,
            tension: 0.3,
            fill: true,
            borderColor: "#0B3D5C",
            backgroundColor: "rgba(11, 61, 92, 0.12)",
            pointBackgroundColor: "#0B3D5C",
            pointRadius: 3,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true },
          x: { ticks: { maxRotation: 60, minRotation: 0 } },
        },
      },
    });

    return () => chartInstanceRef.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  return (
    <>
      <div className="kpi-grid" style={{ marginBottom: 18 }}>
        <KpiCard label="Attendance %" value={pctLabel(detail.attendance?.attendancePct)} />
        <KpiCard label="Present" value={detail.attendance?.present ?? "-"} />
        <KpiCard label="Absent" value={detail.attendance?.absent ?? "-"} />
        <KpiCard label="Half Day" value={detail.attendance?.halfDay ?? "-"} />
        <KpiCard label="On Duty" value={detail.attendance?.onDuty ?? "-"} />
        <KpiCard label="Pre-Test Total" value={detail.preTest?.Total ?? "-"} />
        <KpiCard
          label="Communication"
          value={detail.mockInterview?.communication ?? "-"}
        />
        <KpiCard
          label="Confidence"
          value={detail.mockInterview?.confidence ?? "-"}
        />
        <KpiCard
          label="Technical"
          value={detail.mockInterview?.technical ?? "-"}
        />
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
        Day-wise Improvement — Graph
      </div>
      <div style={{ marginBottom: 22 }}>
        <canvas ref={chartCanvasRef} height="200" />
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
        Day-wise Improvement — Detail
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {timeline.map((t, i) => {
          const hasValue = t.value !== null;
          const delta = hasValue && previous !== null ? t.value - previous : null;
          if (hasValue) previous = t.value;

          return (
            <div key={`${t.label}-${i}`}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12.5,
                  marginBottom: 3,
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>{t.label}</span>
                <span>
                  <strong>{hasValue ? t.value : "-"}</strong>
                  {delta !== null && (
                    <span
                      style={{
                        marginLeft: 8,
                        color: delta >= 0 ? "var(--success)" : "var(--danger)",
                        fontWeight: 600,
                      }}
                    >
                      {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}
                    </span>
                  )}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 6,
                  background: "var(--background)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: hasValue ? `${Math.max(4, (t.value / max) * 100)}%` : "0%",
                    background: "var(--primary)",
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                           */
/* ------------------------------------------------------------------ */

export default function Dashboard({ token, onMessage }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const attRef = useRef(null);
  const deptRef = useRef(null);
  const charts = useRef({});
  const rosterRef = useRef(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  const load = () => {
    if (loadingRef.current) return Promise.resolve();
    loadingRef.current = true;
    setError("");
    return callServer("getDashboardData", token, { cache: false })
      .then((result) => {
        if (mountedRef.current) setData(result);
        return result;
      })
      .catch((err) => {
        if (!mountedRef.current) return;
        const message = err?.message || "Unable to load dashboard.";
        setError(message);
        onMessage?.(message, "error");
      })
      .finally(() => {
        loadingRef.current = false;
      });
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    load();
    const interval = window.setInterval(load, 30_000);
    return () => {
      window.clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    if (!data?.kpis) return;

    Object.values(charts.current).forEach((chart) => chart?.destroy());

    if (attRef.current) {
      charts.current.att = new Chart(attRef.current, {
        type: "doughnut",
        data: {
          labels: ["Present", "Absent", "Half Day", "On Duty"],
          datasets: [{
            data: [
              data.kpis.presentToday,
              data.kpis.absentToday,
              data.kpis.halfDayToday,
              data.kpis.onDutyToday || 0,
            ],
            backgroundColor: ["#1B8A5A", "#DC2626", "#D97706", "#2563EB"],
          }],
        },
        options: { plugins: { legend: { display: true } } },
      });
    }

    if (deptRef.current) {
      charts.current.dept = new Chart(deptRef.current, {
        type: "bar",
        data: {
          labels: data.departmentSummary.map((x) => x.department),
          datasets: [{
            data: data.departmentSummary.map((x) => x.count),
            backgroundColor: "#0B3D5C",
            borderRadius: 6,
          }],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    return () => Object.values(charts.current).forEach((chart) => chart?.destroy());
  }, [data]);

  /* ---------------------------------------------------------------- */
  /*  Data fetchers used by the popups                                 */
  /* ---------------------------------------------------------------- */

  async function getRoster() {
    if (rosterRef.current) return rosterRef.current;
    const roster = await callServer("getStudents", token);
    rosterRef.current = roster || [];
    return rosterRef.current;
  }

  async function fetchAttendanceDeptBreakdown(status) {
    const targetDate = data?.kpis?.attendanceDateKey || todayDateStr();
    const res = await callServer("getAttendance", token, targetDate);
    const records = res?.records || [];
    const map = new Map();

    records.forEach((r) => {
      const dept = normalizeDepartmentLabel(r.department || "Unassigned");
      if (!map.has(dept)) map.set(dept, { department: dept, total: 0, count: 0 });
      const entry = map.get(dept);
      entry.total += 1;
      const recStatus = (r.status || "").trim().toLowerCase();
      const targetStatus = status.trim().toLowerCase();
      const isMatch =
        recStatus === targetStatus ||
        (targetStatus === "on duty" && (recStatus === "od" || recStatus === "onduty" || recStatus === "on-duty")) ||
        (targetStatus === "half day" && (recStatus === "half-day" || recStatus === "halfday" || recStatus === "hd"));
      if (isMatch) entry.count += 1;
    });

    return Array.from(map.values())
      .sort((a, b) => a.department.localeCompare(b.department))
      .map((e) => ({
        department: e.department,
        count: e.count,
        deptTotal: e.total,
        pct: e.total ? `${Math.round((e.count / e.total) * 1000) / 10}%` : "0%",
      }));
  }

  async function fetchPrePostComparison() {
    const rows = await callServer("getPrePostComparison", token);
    return rows || [];
  }

  async function fetchMockInterviewDeptBreakdown() {
    const [roster, mock] = await Promise.all([
      getRoster(),
      callServer("getMockInterviewData", token),
    ]);

    const regToDept = new Map(roster.map((s) => [String(s.registerNumber), s.department]));
    const nameToDept = new Map(
      roster.map((s) => [String(s.name || "").trim().toUpperCase(), s.department])
    );

    const map = new Map();
    (mock.records || []).forEach((r) => {
      const rawDept =
        regToDept.get(String(r.regNo)) ||
        nameToDept.get(String(r.name || "").trim().toUpperCase()) ||
        "Unassigned";
      const dept = normalizeDepartmentLabel(rawDept);

      if (!map.has(dept)) map.set(dept, { department: dept, attended: 0, sum: 0 });
      const entry = map.get(dept);

      const hasScore = r.score !== "" && r.score !== null && r.score !== undefined;
      if (hasScore) {
        entry.attended += 1;
        entry.sum += Number(r.percentage) || 0;
      }
    });

    return Array.from(map.values())
      .sort((a, b) => a.department.localeCompare(b.department))
      .map((e) => ({
        department: e.department,
        attended: e.attended,
        avgScore: e.attended ? `${Math.round((e.sum / e.attended) * 100) / 100}%` : "-",
      }));
  }

  /* ---------------------------------------------------------------- */
  /*  Modal openers                                                    */
  /* ---------------------------------------------------------------- */

  function openDeptModal({ title, subtitle, columns, fetcher }) {
    setModal({ kind: "dept", title, subtitle, columns, rows: [], loading: true, error: "" });

    fetcher()
      .then((rows) => {
        if (!mountedRef.current) return;
        setModal((prev) => (prev && prev.kind === "dept" && prev.title === title ? { ...prev, rows, loading: false } : prev));
      })
      .catch((err) => {
        if (!mountedRef.current) return;
        const message = err?.message || "Unable to load this breakdown.";
        setModal((prev) => (prev && prev.kind === "dept" && prev.title === title ? { ...prev, loading: false, error: message } : prev));
      });
  }

  function openTotalStudentsModal() {
    openDeptModal({
      title: "Total Students — Department-wise",
      columns: [
        { key: "department", label: "Department" },
        { key: "count", label: "Total Students" },
      ],
      fetcher: async () => (data.departmentSummary || []).map((d) => ({ department: d.department, count: d.count })),
    });
  }

  function openPresentTodayModal() {
    openDeptModal({
      title: "Present Today — Department-wise",
      columns: [
        { key: "department", label: "Department" },
        { key: "count", label: "Present" },
        { key: "deptTotal", label: "Dept. Total" },
        { key: "pct", label: "% Present" },
      ],
      fetcher: () => fetchAttendanceDeptBreakdown("Present"),
    });
  }

  function openAbsentTodayModal() {
    openDeptModal({
      title: "Absent Today — Department-wise",
      columns: [
        { key: "department", label: "Department" },
        { key: "count", label: "Absent" },
        { key: "deptTotal", label: "Dept. Total" },
        { key: "pct", label: "% Absent" },
      ],
      fetcher: () => fetchAttendanceDeptBreakdown("Absent"),
    });
  }

  function openHalfDayTodayModal() {
    openDeptModal({
      title: "Half Day Today — Department-wise",
      columns: [
        { key: "department", label: "Department" },
        { key: "count", label: "Half Day" },
        { key: "deptTotal", label: "Dept. Total" },
        { key: "pct", label: "% Half Day" },
      ],
      fetcher: () => fetchAttendanceDeptBreakdown("Half Day"),
    });
  }

  function openOnDutyTodayModal() {
    openDeptModal({
      title: "On Duty Today — Department-wise",
      columns: [
        { key: "department", label: "Department" },
        { key: "count", label: "On Duty" },
        { key: "deptTotal", label: "Dept. Total" },
        { key: "pct", label: "% On Duty" },
      ],
      fetcher: () => fetchAttendanceDeptBreakdown("On Duty"),
    });
  }

  function openOverallAttendanceModal() {
    openDeptModal({
      title: "Overall Attendance % — Department-wise",
      columns: [
        { key: "department", label: "Department" },
        { key: "attendancePct", label: "Attendance %" },
      ],
      fetcher: async () => {
        const rows = await callServer(
          "getDashboardDepartmentAnalytics",
          token
        );

        return (rows || []).map((d) => ({
          department: d.department,
          attendancePct: pctLabel(d.attendancePct),
        }));
      },
    });
  }

  function openAvgPreTestModal() {
    openDeptModal({
      title: "Avg Overall Test — Department-wise",
      columns: [
        { key: "department", label: "Department" },
        { key: "testAverage", label: "Average Test %" },
      ],
      fetcher: async () => {
        const rows = await callServer(
          "getDashboardDepartmentAnalytics",
          token
        );

        return (rows || []).map((d) => ({
          department: d.department,
          testAverage: pctLabel(d.testAverage),
        }));
      },
    });
  }

  function openAvgImprovementModal() {
    openDeptModal({
      title: "Avg Improvement - Daily % — Department-wise",
      columns: [
        { key: "department", label: "Department" },
        { key: "improvementPct", label: "Avg Improvement %" },
      ],
      fetcher: async () => {
        const rows = await callServer(
          "getDashboardDepartmentAnalytics",
          token
        );

        return (rows || []).map((d) => ({
          department: d.department,
          improvementPct: pctLabel(d.improvement),
        }));
      },
    });
  }

  function openMockInterviewModal() {
    openDeptModal({
      title: "Mock Interview Avg — Department-wise",
      columns: [
        { key: "department", label: "Department" },
        { key: "avgScore", label: "Communication + Confidence + Technical" },
      ],
      fetcher: async () => {
        const rows = await callServer(
          "getDashboardDepartmentAnalytics",
          token
        );

        return (rows || []).map((d) => ({
          department: d.department,
          avgScore: pctLabel(d.mockAverage),
        }));
      },
    });
  }

  function openStudentModal(student) {
    setModal({
      kind: "student",
      title: student.name,
      subtitle: student.rollNo || student.registerNumber || student.department,
      loading: true,
      error: "",
      detail: null,
    });

    (async () => {
      try {
        let registerNumber = student.rollNo || student.registerNumber || null;

        if (!registerNumber) {
          const roster = await getRoster();
          const target = String(student.name || "").trim().toUpperCase();
          const match = roster.find((s) => String(s.name || "").trim().toUpperCase() === target);
          if (!match) {
            throw new Error("Student record not found in the student roster.");
          }
          registerNumber = match.registerNumber;
        }

        const detail = await callServer("getStudentById", token, registerNumber);
        if (!detail) throw new Error("Unable to load student performance.");

        if (!mountedRef.current) return;
        setModal((prev) =>
          prev && prev.kind === "student" && prev.title === student.name
            ? { ...prev, loading: false, detail }
            : prev
        );
      } catch (err) {
        if (!mountedRef.current) return;
        const message = err?.message || "Unable to load student data.";
        setModal((prev) =>
          prev && prev.kind === "student" && prev.title === student.name
            ? { ...prev, loading: false, error: message }
            : prev
        );
      }
    })();
  }

  function closeModal() {
    setModal(null);
  }

  /* ---------------------------------------------------------------- */

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
  if (!data) return <Loading />;

  const k = data.kpis;
  const cards = [
    { label: "Total Students", value: k.totalStudents, onClick: openTotalStudentsModal },
    { label: "Present Today", value: k.presentToday, onClick: openPresentTodayModal },
    { label: "Absent Today", value: k.absentToday, onClick: openAbsentTodayModal },
    { label: "Half Day Today", value: k.halfDayToday, onClick: openHalfDayTodayModal },
    { label: "On Duty Today", value: k.onDutyToday ?? 0, onClick: openOnDutyTodayModal },
    { label: "Overall Attendance %", value: `${k.overallAttendancePct}%`, onClick: openOverallAttendanceModal },
    { label: "Training Day", value: `${k.trainingDay} / ${k.totalTrainingDays}` },
    { label: "Completed Days", value: k.completedDays },
    { label: "Remaining Days", value: k.remainingDays },
    { label: "Avg Overall Test", value: `${k.preTestAverage}%`, onClick: openAvgPreTestModal },
    // { label: "Avg Post-Test", value: `${k.postTestAverage}%` },
    { label: "Avg Improvement - Daily %", value: `${k.averageImprovement}%`, onClick: openAvgImprovementModal },
    { label: "Mock Interview Avg", value: `${k.mockInterviewAvgScore}%`, onClick: openMockInterviewModal },
  ];

  const leastStudents = Array.isArray(data.leastStudents) ? data.leastStudents : null;

  return (
    <>
      <div className="kpi-grid">
        {cards.map((c) => (
          <div
            key={c.label}
            onClick={c.onClick}
            style={c.onClick ? { cursor: "pointer" } : undefined}
            title={c.onClick ? "Click for department-wise breakdown" : undefined}
          >
            <KpiCard label={c.label} value={c.value} />
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <h3>Least 10 Performance</h3>
        {leastStudents?.length ? (
          <StudentRankTable
            students={leastStudents}
            onSelect={openStudentModal}
            testColumns={data.testColumns}
          />
        ) : (
          <Empty>No least-performing student data found.</Empty>
        )}
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <h3>Top 10 Performance</h3>
        {data.topStudents?.length ? (
          <StudentRankTable
            students={data.topStudents}
            onSelect={openStudentModal}
            testColumns={data.testColumns}
          />
        ) : (
          <Empty>No top-student data found.</Empty>
        )}
      </div>

      <div className="chart-grid">
        <div className="panel">
          <h3>Today's Attendance</h3>
          <canvas ref={attRef} height="220" />
        </div>
        <div className="panel">
          <h3>Department-wise Students</h3>
          <canvas ref={deptRef} height="220" />
        </div>
      </div>

      

      {modal?.kind === "dept" && (
        <Modal title={modal.title} subtitle={modal.subtitle} onClose={closeModal}>
          {modal.loading ? (
            <Loading />
          ) : modal.error ? (
            <Empty>{modal.error}</Empty>
          ) : (
            <DeptTable columns={modal.columns} rows={modal.rows} />
          )}
        </Modal>
      )}

      {modal?.kind === "student" && (
        <Modal title={modal.title} subtitle={modal.subtitle} onClose={closeModal}>
          {modal.loading ? (
            <Loading />
          ) : modal.error ? (
            <Empty>{modal.error}</Empty>
          ) : (
            <StudentTimeline detail={modal.detail} />
          )}
        </Modal>
      )}
    </>
  );
}
