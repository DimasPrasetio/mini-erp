import { ReactNode, useState, useEffect, useRef } from "react";

export type Tone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent";

type ButtonProps = {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onClick?: () => void;
};

type BadgeProps = {
  children: ReactNode;
  tone?: Tone;
  subtle?: boolean;
};

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
};

type SectionCardProps = {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

type SummaryCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
  footer?: ReactNode;
  onClick?: () => void;
};

type EmptyStateProps = {
  title: string;
  description: ReactNode;
  action?: ReactNode;
};

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  onConfirm: () => void;
  onCancel: () => void;
};

type NoticeProps = {
  title?: string;
  children: ReactNode;
  tone?: Tone;
};

type AppShellProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
};

type ToastProps = {
  id: string;
  title: string;
  description?: string;
  tone?: Tone;
};

export type DataColumn<T> = {
  header: string;
  width?: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  rowHref?: (row: T) => string | undefined;
  onRowClick?: (row: T) => void;
};

export function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className,
  style,
  disabled,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={["button", `button-${variant}`, `button-${size}`, className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral", subtle = false }: BadgeProps) {
  return (
    <span className={["badge", `badge-${tone}`, subtle ? "badge-subtle" : ""].join(" ")}>
      {children}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <header className="page-header animate-fade-in">
      <div className="page-header-copy">
        {breadcrumbs ? <div className="breadcrumbs">{breadcrumbs}</div> : null}
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <div className="page-header-row">
          <div>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="page-header-actions">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: SectionCardProps) {
  return (
    <section className={["card animate-fade-in", className].filter(Boolean).join(" ")}>
      {(title || description || actions) && (
        <div className="card-header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="card-actions">{actions}</div> : null}
        </div>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}

export function SummaryCard({
  label,
  value,
  hint,
  tone = "neutral",
  footer,
  onClick,
}: SummaryCardProps) {
  return (
    <button
      className={["summary-card", `summary-card-${tone}`].join(" ")}
      onClick={onClick}
      type="button"
    >
      <div className="summary-label">{label}</div>
      <div className="summary-value">{value}</div>
      {hint ? <div className="summary-hint">{hint}</div> : null}
      {footer ? <div className="summary-footer">{footer}</div> : null}
    </button>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="filter-bar">{children}</div>;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-mark">0</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function Notice({ title, children, tone = "info" }: NoticeProps) {
  return (
    <div className={["notice", `notice-${tone}`].join(" ")}>
      {title ? <strong>{title}</strong> : null}
      <div>{children}</div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  tone = "warning",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-overlay" role="presentation">
      <div className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-header">
          <Badge tone={tone}>{title}</Badge>
          <h2 id="dialog-title">{title}</h2>
        </div>
        <p className="dialog-copy">{description}</p>
        <div className="dialog-actions">
          <Button onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} variant={tone === "danger" ? "danger" : "primary"}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ sidebar, topbar, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">{sidebar}</aside>
      <div className="app-main">
        <div className="app-topbar">{topbar}</div>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

export function ToastViewport({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="toast-viewport">
      {toasts.map((toast) => (
        <div className={["toast", `toast-${toast.tone ?? "info"}`].join(" ")} key={toast.id}>
          <strong>{toast.title}</strong>
          {toast.description ? <p>{toast.description}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowHref,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                style={{
                  textAlign: column.align ?? "left",
                  width: column.width,
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const href = rowHref?.(row);
            return (
              <tr
                className={href || onRowClick ? "table-clickable-row" : ""}
                key={rowKey(row)}
                onClick={() => {
                  if (onRowClick) {
                    onRowClick(row);
                  }
                }}
              >
                {columns.map((column) => (
                  <td key={column.header} style={{ textAlign: column.align ?? "left" }}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export type SelectOption = { label: string; value: string };

export function SearchableSelect({
  options,
  value,
  defaultValue,
  onChange,
  name,
  id,
  placeholder = "-- Pilih --",
  className,
  allowCreate,
}: {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (val: string) => void;
  name?: string;
  id?: string;
  placeholder?: string;
  className?: string;
  allowCreate?: boolean;
}) {
  const SEARCH_BAR_HEIGHT = 44;
  const GAP = 4;
  const MIN_LIST_HEIGHT = 120;

  type PopoverPos = {
    left: number;
    width: number;
    listMaxHeight: number;
  } & ({ top: number; bottom?: never } | { bottom: number; top?: never });

  const [internalValue, setInternalValue] = useState(defaultValue ?? value ?? "");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopoverPos | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  function calcPos(): PopoverPos | null {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom - GAP - 8;
    const spaceAbove = rect.top - GAP - 8;
    const openUpward = spaceAbove > spaceBelow && spaceBelow < MIN_LIST_HEIGHT + SEARCH_BAR_HEIGHT;

    if (openUpward) {
      return {
        bottom: vh - rect.top + GAP,
        left: rect.left,
        width: rect.width,
        listMaxHeight: Math.max(MIN_LIST_HEIGHT, spaceAbove - SEARCH_BAR_HEIGHT),
      };
    }
    return {
      top: rect.bottom + GAP,
      left: rect.left,
      width: rect.width,
      listMaxHeight: Math.max(MIN_LIST_HEIGHT, spaceBelow - SEARCH_BAR_HEIGHT),
    };
  }

  useEffect(() => {
    function handleClose(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleReposition() {
      if (open) setPos(calcPos());
    }
    document.addEventListener("mousedown", handleClose);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handleClose);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open) setPos(calcPos());
    setOpen((o) => !o);
  };

  const handleSelect = (val: string) => {
    setInternalValue(val);
    if (onChange) onChange(val);
    setOpen(false);
    setSearch("");
  };

  const isExactSearchMatch = options.some(o => o.label.toLowerCase() === search.toLowerCase());
  const selectedLabel = options.find((o) => o.value === internalValue)?.label || (allowCreate && internalValue ? internalValue : placeholder);
  const filteredOptions = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={["searchable-select", className].filter(Boolean).join(" ")} ref={containerRef}>
      {name ? <input type="hidden" name={name} id={id} value={internalValue} /> : null}

      <button
        type="button"
        className="input searchable-select-trigger"
        onClick={handleToggle}
      >
        <span className="searchable-select-label" data-empty={!internalValue ? "true" : "false"}>
          {selectedLabel}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="searchable-select-chevron" style={{ transform: open ? "rotate(180deg)" : undefined }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && pos ? (
        <div
          className="searchable-select-popover"
          style={{
            position: "fixed",
            top: pos.top,
            bottom: pos.bottom,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
          }}
        >
          <div className="searchable-select-search">
            <input
              autoFocus
              className="input searchable-select-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari..."
            />
          </div>
          <div className="searchable-select-list" style={{ maxHeight: pos.listMaxHeight }}>
            {filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`searchable-select-item ${opt.value === internalValue ? "active" : ""}`}
                onClick={() => handleSelect(opt.value)}
              >
                <span style={{ whiteSpace: "normal", wordBreak: "break-word", display: "block" }}>{opt.label}</span>
                {opt.value === internalValue ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: "8px" }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : null}
              </button>
            ))}

            {allowCreate && search.trim() !== "" && !isExactSearchMatch && (
              <button
                key="create-new"
                type="button"
                className="searchable-select-item"
                onClick={() => handleSelect(search.trim())}
                style={{ color: "var(--color-primary)", fontWeight: 500, borderTop: filteredOptions.length > 0 ? "1px dashed var(--border-subtle)" : undefined, marginTop: filteredOptions.length > 0 ? "4px" : "0", paddingTop: filteredOptions.length > 0 ? "8px" : undefined }}
              >
                <span style={{ whiteSpace: "normal", wordBreak: "break-word", display: "block" }}>+ Tambah "{search.trim()}"</span>
              </button>
            )}

            {filteredOptions.length === 0 && (!allowCreate || search.trim() === "") ? (
              <div className="searchable-select-empty">Tidak ada pilihan</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
