import { useState } from "react";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "■" },
  { id: "attendance", label: "Attendance", icon: "✓" },
  { id: "syllabus", label: "Syllabus", icon: "☷" },
  { id: "tests", label: "Pre-Test / Tests", icon: "✎" },
  { id: "posttest", label: "Post-Test", icon: "✎" },
  { id: "mock", label: "Mock Interview", icon: "●" },
  { id: "performance", label: "Student Performance", icon: "★" },
  { id: "prepost", label: "Pre vs Post", icon: "⇆" },
  { id: "feedback", label: "Feedback", icon: "✉" },
  { id: "analysis", label: "Analysis", icon: "☷" },
  { id: "reports", label: "Reports", icon: "▣" },
];

export default function Layout({ user, page, setPage, onLogout, children }) {
  const [open, setOpen] = useState(false);

  const navigate = (id) => {
    setPage(id);
    setOpen(false);
  };

  return (
    <div id="app" style={{ display: "block" }}>
      <div className="shell">
        <aside className={`sidebar ${open ? "open" : ""}`}>
          <div className="sidebar-brand">
            <img
              src="/ppg-logo.jpg"
              alt="logo"
              style={{background: "white", padding:"3px 4px 3px 4px", borderRadius:"5px"}}
            />
            <div className="name">
              PPG Training
              <small>Management Portal</small>
            </div>
          </div>

          <div className="nav">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => navigate(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 10 }}>
              Welcome, <strong>{user.name}</strong>
              <br />
              {user.role} · {user.employeeId}
            </div>
            <button onClick={onLogout}>Logout</button>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                className="mobile-nav-toggle"
                onClick={() => setOpen((v) => !v)}
              >
                ☰
              </button>
              <h2>
                {NAV_ITEMS.find((item) => item.id === page)?.label || "Dashboard"}
              </h2>
            </div>

            <div className="user-chip">
              <span className="role-badge">{user.role}</span>
              <div className="avatar">
                {(user.name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{user.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 11.5 }}>
                  ID: {user.employeeId}
                </div>
              </div>
            </div>
          </div>

          <div className="content">{children}</div>
        </main>
      </div>
    </div>
  );
}
