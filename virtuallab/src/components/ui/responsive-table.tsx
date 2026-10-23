"use client";

/**
 * Responsive Table Wrapper
 * Feature #75: Responsive Requirement
 *
 * Wraps tables with overflow handling and converts to card layout on mobile.
 * Prevents horizontal overflow and broken tables at all viewports.
 */

import React from "react";

// ============================================================
// ResponsiveTable — Wrapper with overflow handling
// ============================================================
interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}

export function ResponsiveTable({
  children,
  className = "",
  minWidth = "640px",
}: ResponsiveTableProps) {
  return (
    <div
      className={`w-full overflow-x-auto scrollbar-thin ${className}`}
      role="region"
      aria-label="Tabel data"
      tabIndex={0}
    >
      <div style={{ minWidth }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// MobileCard — Card layout for table rows on mobile
// ============================================================
interface MobileCardField {
  label: string;
  value: React.ReactNode;
}

interface MobileCardProps {
  fields: MobileCardField[];
  className?: string;
  onClick?: () => void;
}

export function MobileCard({ fields, className = "", onClick }: MobileCardProps) {
  return (
    <div
      className={`
        block sm:hidden p-4 bg-white border border-slate-200 rounded-lg space-y-2
        ${onClick ? 'cursor-pointer hover:bg-slate-50 active:bg-slate-100' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {fields.map((field, i) => (
        <div key={i} className="flex justify-between items-start gap-2">
          <span className="text-xs font-medium text-slate-500 shrink-0">{field.label}</span>
          <span className="text-sm text-slate-900 text-right">{field.value}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// ResponsiveTableWithCards — Auto-switch between table/cards
// ============================================================
interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface ResponsiveTableWithCardsProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function ResponsiveTableWithCards<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  className = "",
}: ResponsiveTableWithCardsProps<T>) {
  return (
    <div className={className}>
      {/* Desktop: Table */}
      <div className="hidden sm:block">
        <ResponsiveTable>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${col.className || ''}`}
                    scope="col"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className={`
                    ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}
                    transition-colors
                  `}
                  onClick={() => onRowClick?.(item)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(item); } : undefined}
                  role={onRowClick ? "button" : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTable>
      </div>

      {/* Mobile: Cards */}
      <div className="sm:hidden space-y-3">
        {data.map((item) => (
          <MobileCard
            key={keyExtractor(item)}
            fields={columns.map((col) => ({
              label: col.header,
              value: col.render(item),
            }))}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
