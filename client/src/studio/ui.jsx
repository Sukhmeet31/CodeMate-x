import { useEffect, useRef } from 'react';
import { X, ArrowUpRight, Check, Circle, LoaderCircle } from 'lucide-react';

export function Dialog({ title, children, onClose, busy = false, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`studio-dialog ${wide ? 'wide' : ''}`}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-header">
        <h2 id="dialog-title">{title}</h2>
        <button className="icon-button" aria-label="Close dialog" onClick={onClose} disabled={busy}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Tag({ children, tone = '' }) {
  return <span className={`tag ${tone}`}>{children}</span>;
}
export function StatusIcon({ status, size = 17 }) {
  return status === 'done' ? (
    <Check size={size} />
  ) : status === 'in-progress' ? (
    <LoaderCircle size={size} />
  ) : (
    <Circle size={size} />
  );
}
export function Empty({ icon: Icon, title, children, action }) {
  return (
    <div className="empty-panel">
      <span className="empty-icon">
        <Icon size={27} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
export function TextLink({ children, onClick }) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowUpRight size={15} />
    </button>
  );
}
