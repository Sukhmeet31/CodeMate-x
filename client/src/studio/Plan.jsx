import { useState } from 'react';
import {
  Flag,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  Circle,
  FileCode2,
  ListChecks,
  Info,
} from 'lucide-react';
import { Empty, Tag, StatusIcon } from './ui';
import { progress } from '../../../shared/project.js';

export default function Plan({ project, onImport, onChange, onRescan, onWorkspace, readOnly }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  if (!project)
    return (
      <div className="page">
        <Empty
          icon={Flag}
          title="A plan begins with a project"
          action={
            <button className="button primary" onClick={onImport} disabled={readOnly}>
              Import a project <ArrowRight size={16} />
            </button>
          }
        >
          Bring in your source code to find actionable next steps.
        </Empty>
      </div>
    );
  const missions = project.missions.filter(
    (m) => filter === 'all' || (filter === 'open' ? m.status !== 'done' : m.status === 'done'),
  );
  const mission = missions.find((m) => m.id === selected) || missions[0];
  const stats = progress(project);
  function updateMission(values) {
    onChange(
      (p) => ({
        ...p,
        missions: p.missions.map((m) => (m.id === mission.id ? { ...m, ...values } : m)),
      }),
      values.status
        ? `Mission ${values.status === 'done' ? 'marked complete' : values.status === 'in-progress' ? 'started' : 'reopened'}: ${mission.title}`
        : null,
    );
  }
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ONE MISSION AT A TIME</span>
          <h1>
            Your rescue plan<span className="heading-dot">.</span>
          </h1>
          <p>
            A practical path forward for <strong>{project.name}</strong>.
          </p>
        </div>
        <button className="button secondary" onClick={onRescan} disabled={readOnly}>
          <RotateCw size={16} /> Rescan files
        </button>
      </div>
      <div className="plan-summary">
        <div className="progress-ring" style={{ '--progress': `${stats.percent}%` }}>
          <span>
            {stats.percent}
            <small>%</small>
          </span>
        </div>
        <div>
          <h3>
            {stats.done} of {stats.total} missions completed
          </h3>
          <p>Progress is marked by you. Builds and tests have not been run here.</p>
        </div>
        <div className="assessment-label">
          <span className="live-dot" /> STATIC SOURCE ASSESSMENT
          <br />
          <small>
            {project.files.length} imported files · {project.excluded || 0} excluded
          </small>
        </div>
      </div>
      <div className="plan-layout">
        <section className="mission-list">
          <div className="segmented small">
            {[
              ['all', 'All missions'],
              ['open', 'Open'],
              ['done', 'Completed'],
            ].map(([v, label]) => (
              <button
                key={v}
                className={filter === v ? 'selected' : ''}
                onClick={() => setFilter(v)}
              >
                {label}
              </button>
            ))}
          </div>
          {missions.length ? (
            missions.map((m, i) => (
              <button
                key={m.id}
                className={`mission-row ${m.id === mission?.id ? 'active' : ''} ${m.status === 'done' ? 'complete' : ''}`}
                onClick={() => setSelected(m.id)}
              >
                <span className={`mission-state ${m.status}`}>
                  <StatusIcon status={m.status} />
                </span>
                <div>
                  <small>
                    MISSION {String(i + 1).padStart(2, '0')}{' '}
                    <span>· {m.priority.toUpperCase()}</span>
                  </small>
                  <h3>{m.title}</h3>
                  <span className="mission-status-text">
                    {m.status === 'todo'
                      ? 'Ready to start'
                      : m.status === 'in-progress'
                        ? 'In progress'
                        : 'Marked complete'}
                  </span>
                </div>
                <ArrowRight size={16} />
              </button>
            ))
          ) : (
            <div className="subtle-empty">
              <CheckCircle2 size={28} />
              <h3>{filter === 'done' ? 'Your first win is ahead.' : 'You’re clear for now.'}</h3>
              <p>
                {filter === 'done'
                  ? 'Complete a mission to see it here.'
                  : 'No matching missions. Rescan after your next edit.'}
              </p>
            </div>
          )}
        </section>
        <section className="mission-detail" aria-label="Mission details">
          {mission ? (
            <>
              <div className="detail-top">
                <Tag tone={mission.priority}>{mission.priority} priority</Tag>
                <Tag>
                  {mission.status === 'done'
                    ? 'MARKED COMPLETE'
                    : mission.status === 'in-progress'
                      ? 'IN PROGRESS'
                      : 'READY WHEN YOU ARE'}
                </Tag>
              </div>
              <h2>{mission.title}</h2>
              <p className="detail-description">{mission.description}</p>
              <h4>
                <FileCode2 size={16} /> What we found
              </h4>
              {mission.evidence.length ? (
                mission.evidence.map((e) => (
                  <button
                    key={`${e.path}:${e.line}`}
                    className="evidence"
                    onClick={() => onWorkspace(e.path, mission.id)}
                  >
                    <span>
                      {e.path}
                      <small> : {e.line}</small>
                      <ArrowRight size={13} />
                    </span>
                    <code>{e.detail}</code>
                  </button>
                ))
              ) : (
                <div className="absence-evidence">
                  <Info size={15} />
                  <p>
                    This item was not found among the imported source files. Excluded files and
                    external services are outside this scan.
                  </p>
                </div>
              )}
              <h4>
                <ListChecks size={16} /> A way forward
              </h4>
              <ol className="mission-steps">
                {mission.steps.map((step, i) => (
                  <li key={step}>
                    <span>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <label className="field-label" htmlFor="mission-note">
                Your notes <span>· saved with this project</span>
              </label>
              <textarea
                id="mission-note"
                className="text-input note-input"
                placeholder="What did you try? What should future-you know?"
                value={mission.note}
                maxLength={10000}
                onChange={(e) => updateMission({ note: e.target.value })}
                disabled={readOnly}
              />
              <div className="mission-actions">
                <button
                  className="button primary"
                  onClick={() => onWorkspace(mission.evidence[0]?.path, mission.id)}
                >
                  Open workspace <ArrowRight size={16} />
                </button>
                {mission.status !== 'done' ? (
                  <>
                    <button
                      className="button secondary"
                      onClick={() => updateMission({ status: 'done' })}
                      disabled={readOnly}
                    >
                      <CheckCircle2 size={16} /> Mark complete
                    </button>
                    {mission.status === 'todo' && (
                      <button
                        className="text-link"
                        onClick={() => updateMission({ status: 'in-progress' })}
                        disabled={readOnly}
                      >
                        Start mission
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    className="button secondary"
                    onClick={() => updateMission({ status: 'todo' })}
                    disabled={readOnly}
                  >
                    <Circle size={15} /> Reopen
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="subtle-empty">
              <Flag size={30} />
              <p>Select a mission to explore it.</p>
            </div>
          )}
        </section>
      </div>
      <section className="foundation-panel">
        <h3>Project foundations</h3>
        <p>Presence checks from the latest scan. These do not verify correctness.</p>
        <div className="foundation-grid">
          {project.assessment.checks.map((c) => (
            <div key={c.id} className={c.found ? 'found' : ''}>
              {c.found ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              <div>
                <strong>{c.label}</strong>
                <span>{c.found ? 'Found in source' : 'Not found in imported files'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
