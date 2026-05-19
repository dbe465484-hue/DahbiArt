"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

export type StatusMenuOption = {
  label: string;
  onSelect: () => void;
  active?: boolean;
};

type Props = {
  viewHref?: string;
  editHref?: string;
  isDeleted?: boolean;
  statusOptions?: StatusMenuOption[];
  statusMenuLabel?: string;
  statusLoading?: boolean;
  onRestore?: () => void;
  restoreLoading?: boolean;
  onDelete?: () => void;
  deleteLoading?: boolean;
};

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
    </svg>
  );
}

function IconUndo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 10h10a5 5 0 015 5v1M3 10l4-4M3 10l4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuItemButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-50 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function MenuItemLink({
  href,
  external,
  children,
  onNavigate,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
  onNavigate: () => void;
}) {
  const className =
    "flex w-full items-center gap-3 px-3 py-2 text-sm text-stone-700 transition hover:bg-stone-50";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onNavigate}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}

export function AdminRowActionsMenu({
  viewHref,
  editHref,
  isDeleted = false,
  statusOptions = [],
  statusMenuLabel = "Changer le statut",
  statusLoading = false,
  onRestore,
  restoreLoading = false,
  onDelete,
  deleteLoading = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setStatusOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setStatusOpen(false);
  }

  const busy = statusLoading || deleteLoading || restoreLoading;

  return (
    <div ref={ref} className="relative inline-flex justify-end">
      <button
        type="button"
        aria-label="Actions"
        aria-expanded={open}
        disabled={busy}
        onClick={() => {
          setOpen((v) => !v);
          setStatusOpen(false);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 disabled:opacity-50"
      >
        <span className="text-lg leading-none tracking-widest" aria-hidden>
          ···
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[220px] overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
          {isDeleted ? (
            onRestore && (
              <MenuItemButton
                disabled={restoreLoading}
                onClick={() => {
                  onRestore();
                  close();
                }}
                className="text-emerald-800 hover:bg-emerald-50"
              >
                <IconUndo />
                {restoreLoading ? "Restauration…" : "Restaurer"}
              </MenuItemButton>
            )
          ) : (
            <>
          {viewHref && (
            <MenuItemLink href={viewHref} external onNavigate={close}>
              <IconEye />
              Voir
            </MenuItemLink>
          )}

          {editHref && (
            <MenuItemLink href={editHref} onNavigate={close}>
              <IconPencil />
              Modifier
            </MenuItemLink>
          )}

          {statusOptions.length > 0 && (
            <>
              <button
                type="button"
                disabled={statusLoading}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
                onClick={() => setStatusOpen((v) => !v)}
              >
                <IconFile />
                <span className="flex-1">{statusMenuLabel}</span>
                <IconChevron open={statusOpen} />
              </button>

              {statusOpen && (
                <div className="border-t border-stone-100 bg-stone-50/80 py-1">
                  {statusOptions.map((opt) => (
                    <MenuItemButton
                      key={opt.label}
                      disabled={statusLoading || opt.active}
                      onClick={() => {
                        opt.onSelect();
                        close();
                      }}
                      className={`pl-9 ${opt.active ? "font-medium text-stone-900" : ""}`}
                    >
                      {opt.label}
                      {opt.active && <span className="ml-auto text-xs text-stone-400">actuel</span>}
                    </MenuItemButton>
                  ))}
                </div>
              )}
            </>
          )}

          {onDelete && (
            <>
              <div className="my-1 border-t border-stone-100" />

              <MenuItemButton
                disabled={deleteLoading}
                onClick={() => {
                  close();
                  onDelete();
                }}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <IconTrash />
                {deleteLoading ? "Suppression…" : "Mettre à la corbeille"}
              </MenuItemButton>
            </>
          )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
