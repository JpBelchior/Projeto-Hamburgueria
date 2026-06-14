import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * TooltipPopover — popover de dica com botão "?"
 * Usa position:fixed para escapar de overflow-hidden ancestrais.
 *
 * Props:
 *   text  {string}  conteúdo do popover
 */
export default function TooltipPopover({ text }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, left: 0, alignRight: false });
  const btnRef = useRef(null);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const popoverWidth = 208; // w-52 = 13rem = 208px
      const spaceRight = window.innerWidth - rect.left;
      const alignRight = spaceRight < popoverWidth + 16;
      setPos({
        top:        rect.bottom + 6,
        left:       alignRight ? rect.right - popoverWidth : rect.left,
        alignRight,
      });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const closeOnClick  = (e) => { if (!btnRef.current?.contains(e.target)) setOpen(false); };
    const closeOnScroll = () => setOpen(false);
    document.addEventListener("mousedown", closeOnClick);
    document.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("mousedown", closeOnClick);
      document.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [open]);

  return (
    <span className="relative inline-flex">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-500 border border-slate-600 hover:text-amber-400 hover:border-amber-500/50 transition-colors leading-none"
      >
        ?
      </button>

      {open && createPortal(
        <div
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
          className="w-52 bg-slate-700 border border-slate-600/80 rounded-xl px-3 py-2.5 shadow-2xl"
        >
          <div
            className={`absolute -top-1.5 w-3 h-3 bg-slate-700 border-l border-t border-slate-600/80 rotate-45 ${pos.alignRight ? "right-2" : "left-2"}`}
          />
          <p className="text-xs text-slate-200 leading-relaxed normal-case tracking-normal font-normal">
            {text}
          </p>
        </div>,
        document.body
      )}
    </span>
  );
}
