import { useEffect, useMemo, useState } from "react";
import { callServer } from "../services/appsScript";
import {
  Empty,
  Loading,
  FilterBar,
} from "../components/Common";

const CATEGORY_OPTIONS = [
  { value: "Technical", label: "Technical" },
  { value: "Aptitude", label: "Aptitude" },
  { value: "Soft Skill", label: "Soft Skill" },
];

export default function Syllabus({ token, user, onMessage }) {
  const [blocks, setBlocks] = useState(null);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");

  async function load() {
    try {
      setError("");
      const res = await callServer("getSyllabus", token);
      setBlocks(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err?.message || "Unable to load syllabus.");
      onMessage(err?.message || "Unable to load syllabus.", "error");
    }
  }

  useEffect(() => {
    if (!token) return;
    load();
  }, [token]);

  async function edit(row, oldTopic, oldTrainer) {
    if (user.role !== "Trainer") return;

    const topic = window.prompt("Topic covered:", oldTopic || "");
    if (topic === null) return;

    const trainer = window.prompt("Trainer Name:", oldTrainer || "");
    if (trainer === null) return;

    try {
      const res = await callServer("saveSyllabusUpdate", token, {
        row,
        topic,
        trainer,
      });
      onMessage(res.message, res.success ? "success" : "error");
      if (res.success) load();
    } catch {
      onMessage("Unable to update syllabus.", "error");
    }
  }

  const filteredBlocks = useMemo(() => {
    if (category === "All") return blocks || [];

    return (blocks || [])
      .map((block) => ({
        ...block,
        days: (block.days || []).filter((day) => day.category === category),
      }))
      .filter((block) => block.days.length > 0);
  }, [blocks, category]);

  if (!blocks && error) return <div className="empty-state">{error}</div>;
  if (!blocks) return <Loading />;
  if (!blocks.length) return <Empty>No syllabus data found.</Empty>;

  return (
    <>
      <div className="toolbar">
        <FilterBar
          filters={[
            {
              key: "category",
              label: "Subject / Topic",
              options: CATEGORY_OPTIONS,
            },
          ]}
          values={{ category }}
          onChange={(_, value) => setCategory(value)}
        />
      </div>

      <div className="panel">
        {filteredBlocks.length ? (
          filteredBlocks.map((block, index) => (
            <div key={block.department}>
              <h3
                style={{
                  color: "var(--primary)",
                  margin: `${index ? 26 : 0}px 0 10px`,
                }}
              >
                {block.department}
              </h3>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Date</th>
                      <th>Topic</th>
                      <th>Category</th>
                      <th>Trainer</th>
                      <th>Status</th>
                      {user.role === "Trainer" && <th />}
                    </tr>
                  </thead>
                  <tbody>
                    {block.days.map((d) => {
                      const cls =
                        d.status === "Completed"
                          ? "pill-completed"
                          : d.status === "Planned"
                            ? "pill-planned"
                            : "pill-upcoming";

                      return (
                        <tr key={d.row}>
                          <td>{d.day}</td>
                          <td>{d.date || "-"}</td>
                          <td>{d.topic || "-"}</td>
                          <td>{d.category || "Technical"}</td>
                          <td>{d.trainer || "-"}</td>
                          <td>
                            <span className={`pill ${cls}`}>{d.status}</span>
                          </td>
                          {user.role === "Trainer" && (
                            <td>
                              <button
                                className="btn btn-outline"
                                onClick={() =>
                                  edit(d.row, d.topic, d.trainer)
                                }
                              >
                                Update
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <Empty>No topics found for this category.</Empty>
        )}
      </div>
    </>
  );
}
