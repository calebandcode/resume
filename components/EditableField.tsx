'use client';

import { useEffect, useRef } from 'react';

interface EditableFieldProps {
  value: string;
  onCommit: (next: string) => void;
  as?: 'span' | 'div' | 'p' | 'h1';
  className?: string;
  markClass?: string;
  dataEditableType?: 'summary' | 'experience_bullet' | 'project_highlight';
  dataParentId?: string;
  dataTargetId?: string;
  onClick?: () => void;
}

export function EditableField({
  value,
  onCommit,
  as: Tag = 'span',
  className = '',
  markClass = '',
  dataEditableType,
  dataParentId,
  dataTargetId,
  onClick,
}: EditableFieldProps) {
  const outerRef = useRef<HTMLElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);

  // Sync external state -> DOM without React reconciling/duplicating text nodes on Ctrl+Z
  useEffect(() => {
    const outer = outerRef.current;
    const target = markClass ? innerRef.current : outer;
    if (!outer || !target) return;
    if (document.activeElement === outer) return;
    if (target.textContent !== value) {
      target.textContent = value;
    }
  }, [value, markClass]);

  return (
    <Tag
      ref={outerRef as React.RefObject<never>}
      contentEditable
      suppressContentEditableWarning
      data-editable-type={dataEditableType}
      data-parent-id={dataParentId}
      data-target-id={dataTargetId}
      onClick={onClick}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const next = e.currentTarget.textContent;
        if (next !== null) {
          const trimmed = next.trim();
          if (trimmed && trimmed !== value) {
            onCommit(trimmed);
          } else if (!trimmed) {
            const target = markClass ? innerRef.current : e.currentTarget;
            if (target) target.textContent = value;
          }
        }
      }}
      className={`focus:outline-none focus:bg-neutral-100/70 rounded-[3px] transition-colors ${className}`}
    >
      {markClass ? <span ref={innerRef} className={markClass} /> : null}
    </Tag>
  );
}
