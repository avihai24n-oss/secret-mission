import { useEffect } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DuoButton from "./DuoButton";
import type { DuoVariant } from "./DuoButton";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Bottom sheet with a dimmed backdrop. Closes on backdrop tap or Escape. */
export default function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-30 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="סגירה"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-ink-950/75 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="relative flex max-h-[86dvh] w-full max-w-[440px] flex-col rounded-t-[28px] border border-b-0 border-white/10 bg-ink-800 px-5 pt-3 shadow-[0_-24px_60px_-20px_rgba(0,0,0,0.9)]"
            style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
          >
            <span aria-hidden="true" className="mx-auto mb-3 h-1.5 w-11 shrink-0 rounded-full bg-white/15" />
            <h2 className="mb-3 shrink-0 text-xl font-black text-mist">{title}</h2>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel: string;
  variant?: DuoVariant;
}

export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  variant = "violet",
}: ConfirmSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <p className="mb-5 text-[16px] leading-relaxed text-mute">{body}</p>
      <div className="flex flex-col gap-3">
        <DuoButton
          variant={variant}
          full
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </DuoButton>
        <DuoButton variant="quiet" size="sm" full onClick={onClose}>
          ביטול
        </DuoButton>
      </div>
    </Sheet>
  );
}
