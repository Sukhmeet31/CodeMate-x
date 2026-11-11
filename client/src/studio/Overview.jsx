import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  FolderGit2,
  CheckCheck,
  Flag,
  GitBranch,
  FileCode2,
  CircleDot,
  Sparkles,
  ScanLine,
  Route,
  Code2,
  Play,
  FolderOpen,
} from 'lucide-react';
import { progress } from '../../../shared/project.js';
import { SectionTitle, Tag, TextLink } from './ui';
import { timeLabel } from './api';

function RescueIllustration() {
  return (
    <div className="rescue-illustration" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="illustration-tag">
        <span className="live-dot" /> THE RESCUE LOOP
      </div>
      <div className="rescue-node node-one">
        <ScanLine size={19} />
        <div>
          <small>01 / UNDERSTAND</small>
          <strong>Find the starting point</strong>
        </div>
        <span className="node-check">✓</span>
      </div>
      <div className="rescue-node node-two">
        <Route size={19} />
        <div>
          <small>02 / MAKE A PLAN</small>
          <strong>One mission at a time</strong>
        </div>
        <span className="node-check">✓</span>
      </div>
      <div className="rescue-node node-three">
        <Code2 size={19} />
        <div>
          <small>03 / BUILD AGAIN</small>
          <strong>Make something happen.</strong>
        </div>
        <ArrowUpRight size={20} />
      </div>
      <span className="star star-one">+</span>
      <span className="star star-two">+</span>
    </div>
  );
}

export default function Overview({
  projects,
  activeProject,
  search,
  onImport,
  onSample,
  onOpen,
  onNavigate,
  readOnly,
}) {
  const open = projects.reduce(
    (n, p) => n + p.missions.filter((m) => m.status !== 'done').length,
    0,
  );
  const done = projects.reduce((n, p) => n + progress(p).done, 0);
  const shown = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const next =
    activeProject?.missions.find((m) => m.status === 'in-progress') ||
    activeProject?.missions.find((m) => m.status === 'todo');
  return (
    <div className="page overview-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR IDEAS, BACK IN MOTION</span>
          <h1>
            The rescue studio<span className="heading-dot">.</span>
          </h1>
          <p>A little clarity. A next step. A project worth coming back to.</p>
        </div>
        <button className="button primary" onClick={onImport} disabled={readOnly}>
          <Plus size={17} /> Import project
        </button>
      </div>
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="pill">
            <span className="live-dot" /> A FRESH START FOR YOUR CODE
          </span>
          <h2>
            Pick up where
            <br />
            you <span>left off.</span>
          </h2>
          <p>
            Your unfinished projects still have potential.
            <br className="desktop-only" /> Understand the code, find your next mission, and move it
            forward.
          </p>
          <div className="hero-actions">
            <button
              className="button primary"
              disabled={readOnly}
              onClick={next ? () => onNavigate('plan') : onImport}
            >
              {next ? 'Continue your rescue' : 'Rescue a project'}
              <ArrowRight size={17} />
            </button>
            <button className="button ghost" disabled={readOnly} onClick={onSample}>
              <Play size={14} /> Explore a sample
            </button>
          </div>
        </div>
        <RescueIllustration />
      </section>
      <div className="stats-row">
        {[
          [FolderGit2, projects.length, 'Projects in your studio', 'Every idea has a home'],
          [Flag, open, 'Open missions', 'A clear next step'],
          [CheckCheck, done, 'Missions completed', 'Marked complete by you'],
        ].map(([Icon, value, title, caption]) => (
          <div className="stat" key={title}>
            <span className="stat-icon">
              <Icon size={20} />
            </span>
            <div>
              <span className="stat-title">{title}</span>
              <div className="stat-bottom">
                <strong>{String(value).padStart(2, '0')}</strong>
                <span>{caption}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="overview-columns">
        <section>
          <SectionTitle
            title="Your projects"
            eyebrow="FROM SOMEDAY TO TODAY"
            action={
              <button
                className="icon-button outlined"
                aria-label="Import another project"
                onClick={onImport}
                disabled={readOnly}
              >
                <Plus size={18} />
              </button>
            }
          />
          {shown.length ? (
            <div className="project-grid">
              {shown.map((p, index) => {
                const stats = progress(p);
                return (
                  <button
                    key={p.id}
                    className={`project-card project-color-${index % 3}`}
                    onClick={() => onOpen(p.id, 'plan')}
                  >
                    <div className="project-card-art">
                      <span className="project-symbol">
                        <FolderGit2 size={36} />
                      </span>
                      <span className="mini-code">{'</>'}</span>
                      <span className="project-open">
                        <ArrowUpRight size={18} />
                      </span>
                      <span className="project-kind">
                        {p.source.type === 'sample'
                          ? 'SAMPLE PROJECT'
                          : p.source.type === 'github'
                            ? 'GITHUB REPOSITORY'
                            : 'LOCAL WORKSPACE'}
                      </span>
                    </div>
                    <div className="project-card-body">
                      <div className="project-title-row">
                        <h3>{p.name}</h3>
                        <span className="project-dot" />
                      </div>
                      <p>
                        {p.assessment.stack.join(' · ') || 'Source project'}
                        <span> · {p.files.length} files</span>
                      </p>
                      <div className="project-progress">
                        <span>
                          {stats.done} of {stats.total} missions complete
                        </span>
                        <span>{stats.percent}%</span>
                      </div>
                      <div className="progress-track">
                        <div style={{ width: `${stats.percent}%` }} />
                      </div>
                      <div className="project-card-footer">
                        <span>
                          <GitBranch size={13} />
                          {p.source.branch || 'Local copy'}
                        </span>
                        <span>Updated {timeLabel(p.updatedAt)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="project-empty">
              <div className="empty-folder-art">
                <FolderOpen size={40} />
                <span>+</span>
              </div>
              <h3>{search ? 'No matching projects' : 'Your next chapter starts here'}</h3>
              <p>
                {search
                  ? 'Try a different project name.'
                  : 'Import a repository or a local folder. We’ll turn the loose ends into a plan.'}
              </p>
              {!search && (
                <button className="button secondary" onClick={onImport} disabled={readOnly}>
                  <Plus size={16} /> Add your first project
                </button>
              )}
            </div>
          )}
        </section>
        <aside className="next-column">
          <SectionTitle title="Your next move" eyebrow="SMALL STEPS. REAL PROGRESS." />
          {next ? (
            <div className="next-card">
              <div className="card-topline">
                <span className="accent-icon">
                  <Flag size={18} />
                </span>
                <Tag tone={next.priority}>{next.priority} priority</Tag>
              </div>
              <small>{activeProject.name}</small>
              <h3>{next.title}</h3>
              <p>{next.description}</p>
              <button className="button secondary full" onClick={() => onNavigate('plan')}>
                Open rescue plan <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="next-card">
              <div className="card-topline">
                <span className="accent-icon">
                  <Sparkles size={19} />
                </span>
                <Tag>START HERE</Tag>
              </div>
              <h3>Clarity comes first.</h3>
              <p>
                Every rescue starts with a look at what’s already there. Your first mission will
                appear here after import.
              </p>
              <div className="mini-steps">
                <span>
                  <ScanLine size={15} /> Understand the project
                </span>
                <span>
                  <CircleDot size={15} /> Choose a small mission
                </span>
                <span>
                  <FileCode2 size={15} /> Get back to building
                </span>
              </div>
            </div>
          )}
          <div className="local-callout">
            <span className="live-dot" />
            <div>
              <strong>Your work, your browser.</strong>
              <p>Projects are saved locally. Export a backup whenever you need one.</p>
              <TextLink onClick={() => onNavigate('settings')}>Workspace settings</TextLink>
            </div>
          </div>
        </aside>
      </div>
      <footer className="page-footer">
        <span>Built for the projects you haven’t given up on.</span>
        <span>
          CODEMATE-X <span className="footer-cross">✳</span> RESCUE STUDIO
        </span>
      </footer>
    </div>
  );
}
