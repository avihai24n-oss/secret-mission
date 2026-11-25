import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MAX_GUESS_LENGTH, POINTS } from "../../shared/protocol";
import type { PlayerView } from "../../shared/protocol";
import { useGame } from "../game/store";
import { g } from "../lib/copy";
import Avatar from "./ui/Avatar";
import DuoButton from "./ui/DuoButton";
import { IconCheck, IconGavel, IconX } from "./ui/icons";

const MIN_GUESS = 4;

/** Full-screen "עליתי עליך": type what you think the opponent's mission is. */
export default function AccuseSheet({ target }: { target: PlayerView }) {
  const send = useGame((s) => s.send);
  const close = useGame((s) => s.setAccuseOpen);
  const demo = useGame((s) => s.demo);
  const [guess, setGuess] = useState("");
  const [sent, setSent] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Demo screenshots stay keyboard-free; on a phone the keypad should be up at once.
    if (!demo) ref.current?.focus();
  }, [demo]);

  const text = guess.trim();
  const ok = text.length >= MIN_GUESS && !sent;
  const tg = target.gender;

  const submit = () => {
    if (!ok) return;
    setSent(true);
    send({ type: "accuse", guess: text.slice(0, MAX_GUESS_LENGTH) });
    // If the server never answers (offline), let the player try again.
    window.setTimeout(() => setSent(false), 4000);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`עליתי ${g(tg, "עליו", "עליה")}`}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 340, damping: 34 }}
      className="fixed inset-0 z-30 overflow-y-auto bg-[#1B0D1F]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(255,77,106,0.28),transparent)]"
      />
      <form
        className="shell relative"
        style={{ minHeight: "auto" }}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <header className="flex min-h-[48px] items-center justify-between">
          <span className="stamp">קריאת תיגר</span>
          <button
            type="button"
            onClick={() => close(false)}
            className="-me-2 flex h-12 w-12 items-center justify-center rounded-full text-mute active:bg-white/10"
            aria-label="ביטול"
          >
            <IconX />
          </button>
        </header>

        <div className="mt-2 flex items-center gap-3">
          <Avatar id={target.avatar} size={52} ring="#FF4D6A" />
          <h1 className="display text-[44px] text-mist">
            מה לדעתך המשימה הסודית {g(tg, "שלו", "שלה")}?
          </h1>
        </div>

        <label htmlFor="guess" className="sr-only">
          הניחוש שלך
        </label>
        <textarea
          id="guess"
          ref={ref}
          value={guess}
          onChange={(e) => setGuess(e.target.value.slice(0, MAX_GUESS_LENGTH))}
          maxLength={MAX_GUESS_LENGTH}
          rows={3}
          enterKeyHint="send"
          placeholder={g(tg, "למשל: הוא מנסה לגרום לי לספר על...", "למשל: היא מנסה לגרום לי לספר על...")}
          className="mt-4 w-full resize-none rounded-3xl border-2 border-coral/40 bg-ink-950/70 p-4 text-[19px] font-medium leading-snug text-mist placeholder:text-faint focus:border-coral focus:outline-none"
        />
        <div className="mt-1.5 flex items-center justify-between px-1 text-[13px]">
          <span className="flex items-center gap-1.5 text-mute">
            <IconGavel size={16} className="text-violet-soft" />
            שופט AI מכריע. מספיק לתפוס את הרעיון, לא חייבים מילה במילה.
          </span>
          <span className={`ltr shrink-0 ps-2 tabular-nums ${guess.length >= MAX_GUESS_LENGTH ? "text-coral-hi" : "text-faint"}`}>
            {guess.length}/{MAX_GUESS_LENGTH}
          </span>
        </div>

        <DuoButton type="submit" variant="coral" size="lg" full disabled={!ok} className="mt-4">
          {sent ? "נשלח לשופט..." : "שליחה לשופט"}
        </DuoButton>

        <ul className="mt-5 flex flex-col gap-2.5 pb-4">
          <li className="flex items-center gap-3 rounded-2xl bg-gold/10 px-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-ink-950">
              <IconCheck size={18} />
            </span>
            <p className="text-[15px] leading-snug text-mist">
              <b>ניחוש נכון:</b> גונבים {g(tg, "ממנו", "ממנה")}{" "}
              <b className="text-gold">{POINTS.STEAL} נקודות</b>
            </p>
          </li>
          <li className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-mist">
              <IconX size={18} />
            </span>
            <p className="text-[15px] leading-snug text-mist">
              <b>טעות:</b> {g(tg, "הוא מקבל", "היא מקבלת")}{" "}
              <b className="text-coral-hi">{POINTS.WRONG_GUESS_BONUS} נקודות</b>, והכפתור האדום ננעל לזמן קצר
            </p>
          </li>
        </ul>
      </form>
    </motion.div>
  );
}
