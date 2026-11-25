import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "../game/store";
import Avatar from "./ui/Avatar";
import DuoButton from "./ui/DuoButton";
import { IconCheck, IconEye, IconGavel, IconPencil, IconShare, LogoMark } from "./ui/icons";

const STEPS = [
  {
    icon: IconShare,
    title: "פותחים חדר ושולחים קוד",
    body: "עובד פנים מול פנים, וגם בשיחת טלפון כשאתם רחוקים.",
  },
  {
    icon: IconEye,
    title: "כל אחד מקבל משימה סודית",
    body: "מציצים, הופכים את הטלפון, וממשיכים בדייט כאילו כלום.",
  },
  {
    icon: IconCheck,
    title: "ביצעתם בלי שישימו לב?",
    body: 'לוחצים "הצלחתי" בשקט וגורפים נקודות.',
  },
  {
    icon: IconGavel,
    title: "חושדים? עליתי עליך!",
    body: "כותבים מה לדעתכם המשימה של הצד השני. שופט AI מכריע, וניחוש נכון גונב 100 נקודות.",
  },
] as const;

export default function HomeScreen() {
  const profile = useGame((s) => s.profile)!;
  const createRoom = useGame((s) => s.createRoom);
  const practice = useGame((s) => s.practice);
  const joinRoom = useGame((s) => s.joinRoom);
  const editProfile = useGame((s) => s.editProfile);
  const [joining, setJoining] = useState(false);
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (code.length === 4) joinRoom(code);
  };

  return (
    <main className="shell">
      <header className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => editProfile(true)}
          className="flex min-h-[48px] items-center gap-2.5 rounded-full border border-white/10 bg-ink-800/80 py-1 pe-4 ps-1.5 active:scale-95"
          aria-label="עריכת הפרופיל"
        >
          <Avatar id={profile.avatar} size={38} />
          <span className="max-w-[9rem] truncate text-[15px] font-bold text-mist">{profile.name}</span>
          <IconPencil size={16} className="text-faint" />
        </button>
      </header>

      <section className="relative mt-4 flex flex-col items-center text-center">
        <div className="relative flex h-[132px] w-[132px] items-center justify-center">
          <span className="absolute inset-0 animate-ping2 rounded-full border-2 border-violet/50" />
          <span
            className="absolute inset-0 animate-ping2 rounded-full border-2 border-violet/40"
            style={{ animationDelay: "1.2s" }}
          />
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="animate-floaty"
          >
            <LogoMark size={104} />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="display relative mt-1 text-[92px] text-mist"
        >
          מבצע סודי
          <motion.span
            initial={{ opacity: 0, scale: 2.2 }}
            animate={{ opacity: 0.92, scale: 1 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 300, damping: 16 }}
            className="stamp absolute -left-4 -top-4 !text-[19px]"
          >
            סודי ביותר
          </motion.span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-1 max-w-[19rem] text-[17px] leading-snug text-mute"
        >
          משחק הריגול לדייט שלכם. משימות סודיות, חשדות, והרבה צחוק.
        </motion.p>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-7 flex flex-col gap-3.5"
      >
        <DuoButton size="lg" full onClick={createRoom}>
          פתיחת חדר
        </DuoButton>

        <AnimatePresence mode="wait" initial={false}>
          {!joining ? (
            <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DuoButton
                variant="ghost"
                size="lg"
                full
                onClick={() => {
                  setJoining(true);
                  // Focus inside the tap so iOS opens the numeric keypad.
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
              >
                הצטרפות עם קוד
              </DuoButton>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card p-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <label htmlFor="join-code" className="eyebrow">
                הקוד בן 4 הספרות שקיבלת
              </label>
              <div className="relative mt-2.5" dir="ltr">
                <div className="grid grid-cols-4 gap-2.5" aria-hidden="true">
                  {[0, 1, 2, 3].map((i) => {
                    const active = i === Math.min(code.length, 3);
                    return (
                      <span
                        key={i}
                        className={`flex h-[68px] items-center justify-center rounded-2xl border-2 bg-ink-900 text-[38px] font-black leading-none tabular-nums text-mist ${
                          code[i] ? "border-violet" : active ? "border-violet/60" : "border-white/10"
                        }`}
                      >
                        {code[i] ?? (active ? <span className="h-8 w-0.5 animate-blink bg-violet-soft" /> : "")}
                      </span>
                    );
                  })}
                </div>
                <input
                  id="join-code"
                  ref={inputRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  enterKeyHint="go"
                  maxLength={4}
                  className="absolute inset-0 h-full w-full cursor-pointer rounded-2xl opacity-0"
                  style={{ caretColor: "transparent" }}
                />
              </div>
              <div className="mt-4 flex gap-3">
                <DuoButton type="submit" full disabled={code.length !== 4}>
                  כניסה לחדר
                </DuoButton>
                <DuoButton
                  variant="quiet"
                  onClick={() => {
                    setJoining(false);
                    setCode("");
                  }}
                >
                  ביטול
                </DuoButton>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={practice}
          className="mx-auto mt-1 min-h-[48px] rounded-2xl px-4 text-[15px] font-bold text-violet-hi underline decoration-violet/40 underline-offset-4"
        >
          רק רוצים לנסות? משחק אימון מול בוט
        </button>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mt-9 pb-4"
        aria-labelledby="how"
      >
        <div className="mb-4 flex items-center gap-3">
          <h2 id="how" className="display text-[34px] text-mist">
            איך משחקים
          </h2>
          <span className="dashed-rule flex-1" />
        </div>
        <ol className="flex flex-col gap-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card flex items-start gap-3.5 p-4">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet/20 text-violet-soft">
                <s.icon size={24} />
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[13px] font-black text-ink-950">
                  {i + 1}
                </span>
              </span>
              <div>
                <h3 className="text-[17px] font-black leading-snug text-mist">{s.title}</h3>
                <p className="mt-0.5 text-[15px] leading-snug text-mute">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </motion.section>
    </main>
  );
}
