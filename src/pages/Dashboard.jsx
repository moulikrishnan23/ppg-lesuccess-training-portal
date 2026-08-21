import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { callServer } from "../services/appsScript";
import { KpiCard, Loading } from "../components/Common";

export default function Dashboard({ token, onMessage }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const attRef = useRef(null);
  const deptRef = useRef(null);
  const charts = useRef({});

  const load = () => {
    setError("");
    return callServer("getDashboardData", token, { cache: false })
      .then(setData)
      .catch((err) => {
        const message = err?.message || "Unable to load dashboard.";
        setError(message);
        onMessage?.(message, "error");
      });
  };

  useEffect(() => {
    if (!token) return;
    load();
    const interval = window.setInterval(load, 10_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [token]);

  useEffect(() => {
    if (!data?.kpis) return;

    Object.values(charts.current).forEach((chart) => chart?.destroy());

    if (attRef.current) {
      charts.current.att = new Chart(attRef.current, {
        type: "doughnut",
        data: {
          labels: ["Present", "Absent", "Half Day"],
          datasets: [{
            data: [
              data.kpis.presentToday,
              data.kpis.absentToday,
              data.kpis.halfDayToday,
            ],
            backgroundColor: ["#1B8A5A", "#DC2626", "#D97706"],
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
    ["Total Students", k.totalStudents],
    ["Present Today", k.presentToday],
    ["Absent Today", k.absentToday],
    ["Half Day Today", k.halfDayToday],
    ["Overall Attendance %", `${k.overallAttendancePct}%`],
    ["Training Day", `${k.trainingDay} / ${k.totalTrainingDays}`],
    ["Completed Days", k.completedDays],
    ["Remaining Days", k.remainingDays],
    ["Avg Pre-Test", `${k.preTestAverage}%`],
    ["Avg Post-Test", `${k.postTestAverage}%`],
    ["Avg Improvement - Daily %", `${k.averageImprovement}%`],
    ["Mock Interview Avg", k.mockInterviewAvgScore],
  ];

  return (
    <>
      <div className="kpi-grid">
        {cards.map(([label, value]) => (
          <KpiCard key={label} label={label} value={value} />
        ))}
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

      <div className="panel">
        <h3>Top 10 Students</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Rank</th><th>Name</th><th>Department</th></tr></thead>
            <tbody>
              {data.topStudents?.map((s) => (
                <tr key={`${s.rank}-${s.name}`}>
                  <td>{s.rank}</td>
                  <td>{s.name}</td>
                  <td>{s.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
