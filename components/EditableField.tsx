'use client';

interface EditableFieldProps {
  value: string;
  onCommit: (next: string) => void;
  as?: 'span' | 'div' | 'p' | 'h1';
  className?: string;
}

export function EditableField({
  value,
  onCommit,
  as: Tag = 'span',
  className = '',
}: EditableFieldProps) {
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const next = e.currentTarget.textContent;
        if (next !== null) {
          const trimmed = next.trim();
          if (trimmed !== value) {
            onCommit(trimmed || value);
          }
        }
      }}
      className={`focus:outline-none focus:bg-neutral-100/70 rounded-[3px] transition-colors ${className}`}
    >
      {value}
    </Tag>
  );
}
