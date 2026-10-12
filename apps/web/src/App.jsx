import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, BriefcaseBusiness, CheckCircle2, CircleAlert, Code2, Database, Users } from "lucide-react";
import { apiHealthSchema } from "@hireflow/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function App() {
  const [health, setHealth] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function checkApi() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal });
        if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
        const parsed = apiHealthSchema.safeParse(await response.json());
        if (!parsed.success) throw new Error("API returned an unexpected health response");
        setHealth(parsed.data);
        setApiError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setHealth(null);
        setApiError(error instanceof Error ? error.message : "Unable to reach API");
      }
    }
    checkApi();
    return () => controller.abort();
  }, []);

  const roadmap = [
    ["01", "Project foundation", "Workspace, JavaScript, API health checks", true],
    ["02", "MongoDB connection", "Atlas connectivity and readiness endpoint", false],
    ["03", "Recruiter dashboard", "Shared layout and pipeline interface", false],
    ["04", "Jobs and applications", "First complete candidate-to-recruiter workflow", false],
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><BriefcaseBusiness size={21} /></div><div><strong>HireFlow AI</strong><span>Recruitment Suite</span></div></div>
        <div className="nav-label">WORKSPACE</div>
        <div className="nav-item active"><Activity size={18} /> Overview</div>
        <div className="nav-item"><Users size={18} /> Candidates <span className="nav-soon">Soon</span></div>
        <div className="nav-item"><BriefcaseBusiness size={18} /> Jobs <span className="nav-soon">Soon</span></div>
        <div className="nav-item"><Database size={18} /> Pipeline <span className="nav-soon">Soon</span></div>
        <div className="sidebar-bottom"><span className="avatar">HF</span><div><strong>HireFlow Workspace</strong><span>Stage 1 foundation</span></div></div>
      </aside>
      <section className="main-panel">
        <header className="topbar"><div className="search-placeholder">Search candidates, jobs...</div><div className="topbar-right"><span className="environment-pill">Development</span><span className="avatar">HF</span></div></header>
        <div className="content">
          <div className="eyebrow">RECRUITER WORKSPACE / FOUNDATION</div>
          <div className="heading-row"><div><h1>Good things start with a great team.</h1><p className="subtitle">HireFlow AI is taking shape. The foundation is running; recruitment workflows are next.</p></div><div className="heading-icon"><BriefcaseBusiness size={26} /></div></div>
          <div className={`api-status ${health ? "healthy" : "unavailable"}`}>{health ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}<div><strong>{health ? "API connected" : "API connection needs attention"}</strong><p>{health ? `Service: ${health.service} · Environment: ${health.environment}` : apiError || "Checking API..."}</p></div><span className="status-dot" /></div>
          <div className="section-heading"><div><h2>Foundation status</h2><p>Initial platform components</p></div><span className="muted-label">STAGE 1</span></div>
          <div className="stats-grid">
            <article className="stat-card"><div className="stat-icon teal"><Code2 size={20} /></div><span className="stat-label">Frontend</span><strong>Ready</strong><small>React + JavaScript + Vite</small></article>
            <article className="stat-card"><div className="stat-icon blue"><Activity size={20} /></div><span className="stat-label">API</span><strong>{health ? "Connected" : "Pending"}</strong><small>Express REST API</small></article>
            <article className="stat-card"><div className="stat-icon purple"><Database size={20} /></div><span className="stat-label">Database</span><strong>Atlas connection</strong><small>MongoDB + Mongoose</small></article>
            <article className="stat-card"><div className="stat-icon amber"><Users size={20} /></div><span className="stat-label">Hiring workflow</span><strong>Planned</strong><small>Jobs, applications and pipeline</small></article>
          </div>
          <div className="section-heading"><div><h2>Build roadmap</h2><p>Small, verifiable milestones</p></div></div>
          <div className="roadmap">{roadmap.map(([number, title, description, done]) => <div className="roadmap-row" key={number}><span className={`roadmap-number ${done ? "done" : ""}`}>{done ? <CheckCircle2 size={17} /> : number}</span><div className="roadmap-copy"><strong>{title}</strong><span>{description}</span></div><span className={`roadmap-status ${done ? "complete" : ""}`}>{done ? "In progress" : "Upcoming"}</span><ArrowUpRight size={17} className="roadmap-arrow" /></div>)}</div>
          <footer>HireFlow AI · Built for better hiring decisions.</footer>
        </div>
      </section>
    </main>
  );
}
