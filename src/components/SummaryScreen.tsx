import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import type { PlayerView } from "../../shared/protocol";
import { me, opponent, useGame } from "../game/store";
import { g } from "../lib/copy";
import LogList from "./LogList";
import Avatar from "./ui/Avatar";
import DuoButton from "./ui/DuoButton";
import { IconCrown } from "./ui/icons";

const COLORS = ["#8B5CF6", "#C9B5FF", "#FFC44D", "#FF4D6A", "#F4EEFF"];

function celebrate(big: boolean) {
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 60 };
  void confetti({ ...base, particleCount: big ? 110 : 45, spread: 80, startVelocity: 42, origin: { y: 0.3 } });
  if (!big) return;
  window.setTimeout(() => {
    void confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.5 } });
    void confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.5 } });
  }, 350);
}

export default function SummaryScreen() {
  const room = useGame((s) => s.room)!;
  const send = useGame((s) => s.send);
  const leave = useGame((s) => s.leave);

  const self = me(room);
  const other = opponent(room);
  const winner = room.players.find((p) => p.id === room.winnerId) ?? null;
  const tie = !winner;
  const iWon = winner?.id === self.id;

  useEffect(() => {
    const t = window.setTimeout(() => celebrate(iWon || tie), 350);
    return () => window.clearTimeout(t);
  }, [iWon, tie]);

  const ordered = [...room.players].sort((a, b) => b.score - a.score);
  const stats = (p: PlayerView) => ({
    done: room.log.filter((e) => e.kind === "success" && e.actorId === p.id).length,
    caught: room.log.filter((e) => e.kind === "caught" && e.actorId === p.id).length,
  });

  return (
    <main className="shell">
      <section className="flex flex-col items-center pt-6 text-center">
        <span className="stamp">המבצע הסתיים</span>

        {tie ? (
          <div className="mt-6 flex items-center">
            {room.players.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ scale: 0, x: i === 0 ? 30 : -30 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 * i }}
                className={i === 1 ? "-ms-5" : "z-10"}
              >
                <Avatar id={p.avatar} size={96} ring="#FFC44D" />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 13 }}
            className="relative mt-9"
          >
            <motion.span
              initial={{ y: -30, opacity: 0, rotate: -30 }}
              animate={{ y: 0, opacity: 1, rotate: -12 }}
              transition={{ delay: 0.45, type: "spring", stiffness: 300, damping: 12 }}
              className="absolute -top-9 right-0 z-10 text-gold drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
            >
              <IconCrown size={50} />
            </motion.span>
            <span className="absolute inset-0 animate-ping2 rounded-full border-2 border-gold/50" />
            <Avatar id={winner!.avatar} size={116} ring="#FFC44D" />
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 text-[16px] font-bold text-gold"
        >
          {tie ? "תיקו מושלם" : g(winner!.gender, "הסוכן המצטיין של הדייט", "הסוכנת המצטיינת של הדייט")}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="display mt-1 max-w-full break-words text-[84px] text-mist"
        >
          {tie ? "שני סוכנים מצטיינים" : winner!.name}
        </motion.h1>
        <p className="mt-2 text-[16px] text-mute">
          {tie
            ? "אף אחד לא ויתר. חייבים משחק חוזר."
            : iWon
              ? "ניצחון! עכשיו אפשר להתגאות בזה עד הדייט הבא."
              : `הפעם ${other?.name ?? ""} ${g(winner!.gender, "לקח", "לקחה")}. משחק חוזר?`}
        </p>
      </section>

      <section className="mt-6 flex flex-col gap-2.5" aria-label="תוצאה סופית">
        {ordered.map((p, i) => {
          const s = stats(p);
          const top = !tie && i === 0;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.12 }}
              className={`flex items-center gap-3 rounded-3xl border px-4 py-3 ${
                top ? "border-gold/50 bg-gold/10" : "border-white/[0.08] bg-ink-800/80"
              }`}
            >
              <Avatar id={p.avatar} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[18px] font-black text-mist">
                  {p.name}
                  {p.id === self.id && <span className="ms-1.5 text-[13px] font-bold text-faint">(אני)</span>}
                </p>
                <p className="text-[13px] text-mute">
                  {s.done} משימות הושלמו · {s.caught} תפיסות
                </p>
              </div>
              <span className={`num text-[38px] leading-none ${top ? "text-gold" : "text-mist"}`}>
                {p.score}
              </span>
            </motion.div>
          );
        })}
      </section>

      <section className="mt-7" aria-labelledby="timeline">
        <div className="mb-3 flex items-center gap-3">
          <h2 id="timeline" className="display text-[34px] text-mist">
            יומן המבצעים
          </h2>
          <span className="dashed-rule flex-1" />
        </div>
        <p className="mb-3 text-[14px] text-faint">עכשיו הכול חשוף, כולל המשימות שלא נתפסו.</p>
        <LogList log={room.log} players={room.players} you={room.you} order="oldest" />
      </section>

      <div className="sticky bottom-0 mt-auto pt-6">
        <div className="pointer-events-none absolute inset-x-[-16px] bottom-[-16px] top-0 bg-[linear-gradient(180deg,transparent,#0D0616_40%)]" />
        <div className="relative flex flex-col gap-2">
          <DuoButton size="lg" full onClick={() => send({ type: "rematch" })}>
            משחק חוזר
          </DuoButton>
          <DuoButton variant="quiet" size="sm" full onClick={leave}>
            חזרה הביתה
          </DuoButton>
        </div>
      </div>
    </main>
  );
}
