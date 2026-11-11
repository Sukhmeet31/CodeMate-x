import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Flag,
  Code2,
  Activity,
  Settings as SettingsIcon,
  Plus,
  Search,
  ChevronRight,
  ArrowUpRight,
  PanelLeftClose,
  Menu,
  X,
  CircleCheck,
  LoaderCircle,
  AlertCircle,
  FolderGit2,
  Sparkles,
  GitCompareArrows,
} from 'lucide-react';
import { useWorkspace } from './useWorkspace';
import Overview from './Overview';
import Plan from './Plan';
import Workspace from './Workspace';
import Changes from './Changes';
import Settings from './Settings';
import ImportDialog from './ImportDialog';
import { Empty } from './ui';
import { sampleProject } from './sample';
import { request, timeLabel } from './api';
import { rescanProject } from '../../../shared/project.js';
import { getChanges } from '../../../shared/changes.js';

const navigation = [
  ['overview', 'Overview', LayoutDashboard],
  ['plan', 'Rescue plan', Flag],
  ['workspace', 'Workspace', Code2],
  ['changes', 'Changes & export', GitCompareArrows],
  ['activity', 'Activity', Activity],
];

export default function RescueStudio() {
  const { workspace, update, ready, readOnly, saveState, error } = useWorkspace();
  const [view, setView] = useState('overview');
  const [sidebar, setSidebar] = useState(false);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [filePath, setFilePath] = useState('');
  const [missionId, setMissionId] = useState('');
  const [health, setHealth] = useState(null);
  const [notice, setNotice] = useState('');
  const [viewProjectId, setViewProjectId] = useState(null);
  const project =
    workspace.projects.find((p) => p.id === (viewProjectId || workspace.activeProjectId)) ||
    workspace.projects[0];
  const fontSize = workspace.settings?.fontSize || 14;
  const openMissions = project?.missions.filter((m) => m.status !== 'done').length || 0;
  const changedCount = project ? getChanges(project).length : 0;
  async function refreshHealth() {
    setHealth(null);
    try {
      setHealth(await request('/api/health'));
    } catch {
      setHealth({ offline: true, aiConfigured: false });
    }
  }
  useEffect(() => {
    refreshHealth();
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  function navigate(next) {
    setView(next);
    setSidebar(false);
    window.scrollTo(0, 0);
  }
  function openProject(id, next = 'plan') {
    setViewProjectId(id);
    update((w) => ({ ...w, activeProjectId: id }));
    setFilePath('');
    setMissionId('');
    navigate(next);
  }
  function addProject(p) {
    if (workspace.projects.length >= 20)
      throw new Error(
        'This workspace holds up to 20 projects. Export a backup and remove a project in Workspace settings before importing another.',
      );
    setViewProjectId(p.id);
    update((w) => ({ ...w, projects: [p, ...w.projects], activeProjectId: p.id }));
    setFilePath('');
    setMissionId('');
    navigate('plan');
    setNotice(`${p.name} is ready to explore.`);
  }
  function exploreSample() {
    const existing = workspace.projects.find((p) => p.source.type === 'sample');
    if (existing) {
      openProject(existing.id);
      return;
    }
    try {
      addProject(sampleProject());
    } catch (e) {
      setNotice(e.message);
    }
  }
  function changeProject(updater, text) {
    update((w) => ({
      ...w,
      projects: w.projects.map((p) => {
        if (p.id !== project.id) return p;
        const now = new Date().toISOString();
        let activity = p.activity || [];
        if (
          text &&
          !(activity[0]?.text === text && Date.now() - Date.parse(activity[0].at) < 30000)
        )
          activity = [{ id: crypto.randomUUID(), text, at: now }, ...activity].slice(0, 100);
        return { ...updater(p), updatedAt: now, activity };
      }),
    }));
  }
  function openWorkspace(path, mission) {
    setFilePath(path || '');
    setMissionId(mission || '');
    navigate('workspace');
  }
  const events = workspace.projects
    .flatMap((p) => (p.activity || []).map((a) => ({ ...a, project: p.name, projectId: p.id })))
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <div className="studio-root">
      {sidebar && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setSidebar(false)}
        />
      )}
      <aside id="studio-navigation" className={`sidebar ${sidebar ? 'visible' : ''}`}>
        <button className="brand" onClick={() => navigate('overview')} aria-label="CodeMate-X home">
          <span className="brand-mark">
            <Code2 size={23} />
          </span>
          <span>
            codemate<span className="brand-x">x</span>
            <small>PROJECT RESCUE STUDIO</small>
          </span>
        </button>
        <div className="workspace-switch">
          <span className="workspace-avatar">P</span>
          <div>
            <strong>Personal workspace</strong>
            <span>Local to this browser</span>
          </div>
          <span className="workspace-switch-dot" />
        </div>
        <span className="nav-label">STUDIO</span>
        <nav aria-label="Main navigation">
          {navigation.map(([id, label, Icon]) => (
            <button
              key={id}
              className={view === id ? 'active' : ''}
              onClick={() => navigate(id)}
              aria-current={view === id ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === 'plan' && openMissions > 0 && <small>{openMissions}</small>}
              {id === 'changes' && changedCount > 0 && <small>{changedCount}</small>}
            </button>
          ))}
        </nav>
        <div className="nav-label projects-label">
          <span>YOUR PROJECTS</span>
          <button
            className="icon-button"
            aria-label="Import project"
            onClick={() => setImporting(true)}
            disabled={readOnly}
          >
            <Plus size={15} />
          </button>
        </div>
        <div className="sidebar-projects">
          {workspace.projects.length ? (
            workspace.projects.map((p, i) => (
              <button
                key={p.id}
                onClick={() => openProject(p.id)}
                className={project?.id === p.id ? 'selected' : ''}
              >
                <span className={`project-indicator color-${i % 3}`} />
                <span>{p.name}</span>
              </button>
            ))
          ) : (
            <span className="sidebar-empty">A home for your next idea.</span>
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-symbol">✳</span>
            <h3>Still worth building.</h3>
            <p>
              Bring an unfinished idea.
              <br />
              Leave with a next step.
            </p>
            <button onClick={exploreSample} disabled={readOnly}>
              Try a sample project <ArrowUpRight size={14} />
            </button>
          </div>
          <button
            className={`settings-nav ${view === 'settings' ? 'active' : ''}`}
            onClick={() => navigate('settings')}
          >
            <SettingsIcon size={18} /> Workspace settings
          </button>
          <div className="sidebar-footer">
            <span className="live-dot" /> LOCAL WORKSPACE <span>v0.2</span>
          </div>
        </div>
      </aside>
      <div className="studio-main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={sidebar}
              aria-controls="studio-navigation"
              onClick={() => setSidebar(true)}
            >
              <Menu size={20} />
            </button>
            <span className="desktop-only">
              <PanelLeftClose size={17} />
            </span>
            <span>Studio</span>
            <ChevronRight size={13} />
            <strong>
              {view === 'settings' ? 'Settings' : navigation.find((n) => n[0] === view)?.[1]}
            </strong>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={15} />
              <input
                aria-label="Search projects"
                placeholder="Find a project…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setView('overview');
                }}
              />
            </label>
            <div className={`save-status ${saveState === 'error' ? 'error' : ''}`} role="status">
              {saveState === 'saving' || saveState === 'loading' ? (
                <LoaderCircle size={14} className="spin" />
              ) : saveState === 'error' ? (
                <AlertCircle size={14} />
              ) : (
                <CircleCheck size={14} />
              )}
              <span>
                {saveState === 'saving'
                  ? 'Saving…'
                  : saveState === 'loading'
                    ? 'Loading…'
                    : saveState === 'error'
                      ? 'Not saved'
                      : readOnly
                        ? 'Read-only'
                        : 'Saved locally'}
              </span>
            </div>
            <span className="user-avatar" title="Personal workspace">
              P
            </span>
          </div>
        </header>
        {error && (
          <div className="global-error" role="alert">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}
        {ready && readOnly && (
          <div className="readonly-banner">
            <AlertCircle size={16} /> Another tab is editing this workspace. You can browse here;
            editing unlocks when that tab closes.
          </div>
        )}
        <main>
          {!ready ? (
            <div className="page loading-page">
              {error ? (
                <>
                  <AlertCircle size={30} />
                  <h1>Your saved data needs attention.</h1>
                  <p>Enable browser storage and reload. No saved projects have been overwritten.</p>
                  <button className="button primary" onClick={() => window.location.reload()}>
                    Reload workspace
                  </button>
                </>
              ) : (
                <>
                  <LoaderCircle size={24} className="spin" />
                  <p>Opening your studio…</p>
                </>
              )}
            </div>
          ) : (
            <>
              {view === 'overview' && (
                <Overview
                  projects={workspace.projects}
                  activeProject={project}
                  search={search}
                  onImport={() => setImporting(true)}
                  onSample={exploreSample}
                  onOpen={openProject}
                  onNavigate={navigate}
                  readOnly={readOnly}
                />
              )}
              {view === 'plan' && (
                <Plan
                  key={project?.id}
                  project={project}
                  onImport={() => setImporting(true)}
                  onChange={changeProject}
                  onRescan={() => {
                    changeProject(rescanProject, 'Rescanned imported source files');
                    setNotice('Assessment refreshed. Matching mission progress was kept.');
                  }}
                  onWorkspace={openWorkspace}
                  readOnly={readOnly}
                />
              )}
              {view === 'workspace' && (
                <Workspace
                  key={project?.id}
                  project={project}
                  filePath={filePath}
                  setFilePath={setFilePath}
                  missionId={missionId}
                  setMissionId={setMissionId}
                  onChange={changeProject}
                  onImport={() => setImporting(true)}
                  health={health}
                  onSettings={() => navigate('settings')}
                  onChanges={() => navigate('changes')}
                  readOnly={readOnly}
                  fontSize={fontSize}
                />
              )}
              {view === 'changes' && (
                <Changes
                  key={project?.id}
                  project={project}
                  onChange={changeProject}
                  onWorkspace={openWorkspace}
                  onImport={() => setImporting(true)}
                  readOnly={readOnly}
                  fontSize={fontSize}
                />
              )}
              {view === 'activity' && (
                <div className="page">
                  <div className="page-heading">
                    <div>
                      <span className="eyebrow">A RECORD OF YOUR MOMENTUM</span>
                      <h1>
                        Small steps add up<span className="heading-dot">.</span>
                      </h1>
                      <p>
                        Real changes from your workspace. A useful place to pick things back up.
                      </p>
                    </div>
                  </div>
                  {events.length ? (
                    <div className="activity-list">
                      {events.map((event) => (
                        <div className="activity-row" key={`${event.projectId}:${event.id}`}>
                          <span className="activity-icon">
                            <Activity size={17} />
                          </span>
                          <div>
                            <h3>{event.text}</h3>
                            <button
                              className="text-link"
                              onClick={() => openProject(event.projectId)}
                            >
                              {event.project}
                            </button>
                          </div>
                          <time dateTime={event.at}>
                            {timeLabel(event.at)}
                            <span>
                              {new Date(event.at).toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </time>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty
                      icon={Activity}
                      title="Your story starts with one step"
                      action={
                        <button
                          className="button primary"
                          onClick={() => setImporting(true)}
                          disabled={readOnly}
                        >
                          Import your first project
                        </button>
                      }
                    >
                      Imports, edits, rescans, and completed missions will appear here.
                    </Empty>
                  )}
                </div>
              )}
              {view === 'settings' && (
                <Settings
                  workspace={workspace}
                  onRestore={(next) => {
                    setViewProjectId(null);
                    update(() => next);
                    setNotice('Backup loaded. Saving restored workspace…');
                  }}
                  onRemove={(id) => {
                    update((w) => {
                      const projects = w.projects.filter((p) => p.id !== id);
                      return { ...w, projects, activeProjectId: projects[0]?.id || null };
                    });
                    setViewProjectId(null);
                    setNotice(
                      'Project removed from this workspace. Original source files are unchanged.',
                    );
                  }}
                  readOnly={readOnly}
                  health={health}
                  onRefreshHealth={refreshHealth}
                  fontSize={fontSize}
                  setFontSize={(value) =>
                    update((w) => ({ ...w, settings: { ...w.settings, fontSize: value } }))
                  }
                />
              )}
            </>
          )}
        </main>
      </div>
      {importing && <ImportDialog onClose={() => setImporting(false)} onImport={addProject} />}
      {notice && (
        <div className="toast" role="status">
          <Sparkles size={17} />
          {notice}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice('')}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
