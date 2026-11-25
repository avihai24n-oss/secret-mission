import { motion } from "framer-motion";
import type { RoomView } from "../../shared/protocol";
import { useGame } from "../game/store";
import { g } from "../lib/copy";
import Avatar from "./ui/Avatar";
import DuoButton from "./ui/DuoButton";
import { IconGavel } from "./ui/icons";

/** Shown to BOTH players while `state.judging` is set. */
export default function JudgingOverlay({ room }: { room: RoomView }) {
  const send = useGame((s) => s.send);
  const j = room.judging!;
  const accuser = room.players.find((p) => p.id === j.accuserId);
  const target = room.players.find((p) => p.id === j.targetId);
  const iAmTarget = j.targetId === room.you;
  const iAmAccuser = j.accuserId === room.you;
  const manual = j.needsManualRuling;
  const tg = target?.gender ?? "m";
  const ag = accuser?.gender ?? "m";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label="השופט בודק"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 overflow-y-auto bg-[#12081C]"
    >
      <div className="shell items-center text-center">
        <span className="stamp mt-3">{manual ? "הכרעה ידנית" : "בבדיקה"}</span>

        {/* Radar */}
        <div className="relative mt-6 flex h-[208px] w-[208px] shrink-0 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-coral/30" />
          <span className="absolute inset-[30px] rounded-full border border-coral/25" />
          <span className="absolute inset-[60px] rounded-full border border-coral/20" />
          <span className="absolute inset-x-0 top-1/2 h-px bg-coral/15" />
          <span className="absolute inset-y-0 left-1/2 w-px bg-coral/15" />
          {!manual && <span className="radar-sweep absolute inset-0 animate-sweep rounded-full" />}
          <span className="absolute inset-0 animate-ping2 rounded-full border-2 border-coral/50" />
          <span className="absolute inset-0 animate-ping2 rounded-full border-2 border-coral/40" style={{ animationDelay: "1.2s" }} />
          <motion.span
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <Avatar id={target?.avatar ?? "fedora"} size={84} ring="#FF4D6A" />
          </motion.span>
        </div>

        <h1 className="display mt-6 text-[60px] text-mist">
          {manual ? "השופט לא זמין" : "השופט בודק..."}
        </h1>

        <p className="mt-2 text-[16px] text-mute">
          {iAmAccuser
            ? `הניחוש שלך על המשימה של ${target?.name ?? ""}:`
            : `${accuser?.name ?? ""} ${g(ag, "טוען שעלה עליך", "טוענת שעלתה עליך")}. הניחוש:`}
        </p>

        <motion.blockquote
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-3 w-full rounded-3xl border border-coral/35 bg-ink-800 px-5 py-4 text-[21px] font-bold leading-snug text-mist"
        >
          {j.guess}
        </motion.blockquote>

        <div className="mt-auto w-full pt-6">
          {manual ? (
            iAmTarget ? (
              <>
                <p className="mb-4 text-[18px] font-bold leading-snug text-mist">
                  תכריעו ביושר: הניחוש נכון?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <DuoButton variant="coral" size="lg" onClick={() => send({ type: "manualRuling", correct: true })}>
                    כן, נתפסתי
                  </DuoButton>
                  <DuoButton variant="ghost" size="lg" onClick={() => send({ type: "manualRuling", correct: false })}>
                    לא, זה לא זה
                  </DuoButton>
                </div>
                <p className="mt-3.5 text-[13px] text-faint">מספיק שהרעיון נכון. אין צורך במילים המדויקות.</p>
              </>
            ) : (
              <Waiting text={`מחכים ש${target?.name ?? ""} ${g(tg, "יכריע", "תכריע")} ביושר אם צדקת`} />
            )
          ) : (
            <Waiting
              icon
              text={iAmTarget ? "פני פוקר. עוד רגע יש הכרעה." : "מחזיקים אצבעות. עוד רגע יש הכרעה."}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Waiting({ text, icon = false }: { text: string; icon?: boolean }) {
  return (
    <div className="flex min-h-[64px] items-center justify-center gap-3 rounded-3xl bg-white/[0.06] px-4 py-3">
      {icon ? (
        <motion.span
          className="text-violet-soft"
          animate={{ rotate: [0, -24, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
        >
          <IconGavel size={24} />
        </motion.span>
      ) : (
        <span className="h-2.5 w-2.5 shrink-0 animate-blink rounded-full bg-coral" />
      )}
      <p className="text-[16px] font-bold text-mist">{text}</p>
    </div>
  );
}
