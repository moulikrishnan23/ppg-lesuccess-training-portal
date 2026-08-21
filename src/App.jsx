import { useEffect, useState } from "react";
import { callServer } from "./services/appsScript";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Syllabus from "./pages/Syllabus";
import Tests from "./pages/Tests";
import PostTest from "./pages/PostTest";
import MockInterview from "./pages/MockInterview";
import Performance from "./pages/Performance";
import { PrePost, Feedback, Analysis, Reports } from "./pages/SimpleTables";

const SESSION_KEY = "ppg_session";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved).user || null : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved).token || null : null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState("dashboard");
  const [restoring, setRestoring] = useState(Boolean(token));
  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    if (!token) return;

    let active = true;

    callServer("validateSession", token, { cache: false })
      .then((result) => {
        if (!active) return;

        if (!result?.valid) {
          localStorage.removeItem(SESSION_KEY);
          setToken(null);
          setUser(null);
        } else if (result.user) {
          setUser(result.user);
          localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ token, user: result.user })
          );
        }
      })
      .catch(() => {
        // Keep the saved session on a temporary network failure.
      })
      .finally(() => {
        if (active) setRestoring(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  function login(result) {
    setToken(result.sessionToken);
    setUser(result.user);
    setPage("dashboard");

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token: result.sessionToken,
        user: result.user
      })
    );
  }

  async function logout() {
    try {
      if (token) {
        await callServer("logout", token, { cache: false });
      }
    } catch {
      // Local logout should still complete if the server is unreachable.
    } finally {
      localStorage.removeItem(SESSION_KEY);
      setToken(null);
      setUser(null);
      setPage("dashboard");
    }
  }

  function onMessage(message, type = "") {
    setToast({ message, type });
    window.clearTimeout(window.__ppgToast);
    window.__ppgToast = window.setTimeout(
      () => setToast({ message: "", type: "" }),
      3500
    );
  }

  if (restoring) {
    return (
      <div className="loading-overlay" style={{ display: "flex" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user || !token) return <Login onLogin={login} />;

  const common = { token, user, onMessage };

  let content;
  switch (page) {
    case "attendance":
      content = <Attendance {...common} />;
      break;
    case "syllabus":
      content = <Syllabus {...common} />;
      break;
    case "tests":
      content = <Tests {...common} />;
      break;
    case "posttest":
      content = <PostTest {...common} />;
      break;
    case "mock":
      content = <MockInterview {...common} />;
      break;
    case "performance":
      content = <Performance {...common} />;
      break;
    case "prepost":
      content = <PrePost token={token} onMessage={onMessage} />;
      break;
    case "feedback":
      content = <Feedback token={token} onMessage={onMessage} />;
      break;
    case "analysis":
      content = <Analysis token={token} onMessage={onMessage} />;
      break;
    case "reports":
      content = <Reports token={token} onMessage={onMessage} />;
      break;
    default:
      content = <Dashboard token={token} onMessage={onMessage} />;
      break;
  }

  return (
    <>
      <Layout
        user={user}
        page={page}
        setPage={setPage}
        onLogout={logout}
      >
        {content}
      </Layout>

      {toast.message && (
        <div className={`toast ${toast.type}`} style={{ display: "block" }}>
          {toast.message}
        </div>
      )}
    </>
  );
}
