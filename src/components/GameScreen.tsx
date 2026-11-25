import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACCUSE_COOLDOWN_MS } from "../../shared/protocol";
import type { PlayerView, RoomView } from "../../shared/protocol";
import { me, opponent, useGame } from "../game/store";
import { g } from "../lib/copy";
import AccuseSheet from "./AccuseSheet";
import JudgingOverlay from "./JudgingOverlay";
import LogList, { logHeadline } from "./LogList";
import MissionCard from "./MissionCard";
import { SuccessBurst } from "./Overlays";
import Avatar from "./ui/Avatar";
import CountdownRing from "./ui/CountdownRing";
import { duoVariant } from "./ui/DuoButton";
import HoldButton from "./ui/HoldButton";
import ProgressBar from "./ui/ProgressBar";
import Sheet, { ConfirmSheet } from "./ui/Sheet";
import { IconCheck, IconFlag, IconInfinity, IconScroll, IconSiren, IconSwap, IconX } from "./ui/icons";

/** Ticks while `active`, for the cooldown countdown. */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

export default function GameScreen() {
  const room = useGame((s) => s.room)!;
  const send = useGame((s) => s.send);
  const clockOffset = useGame((s) => s.clockOffset);
  const accuseOpen = useGame((s) => s.accuseOpen);
  const setAccuseOpen = useGame((s) => s.setAccuseOpen);
  const missed = useGame((s) => s.missed);
  const dismissMissed = useGame((s) => s.dismissMissed);
  const [sheet, setSheet] = useState<"skip" | "end" | "log" | null>(null);

  const self = me(room);
  const other = opponent(room);
  const og = other?.gender ?? "m";

  const coolingDown = room.accuseCooldownUntil > 0;
  const now = useNow(coolingDown);
  const cooldownLeft = coolingDown ? Math.max(0, room.accuseCooldownUntil - (now + clockOffset)) : 0;
  const locked = cooldownLeft > 0;

  return (
    <main className="shell" style={{ height: "100dvh" }}>
      <Scoreboard room={room} self={self} other={other} />

      <AnimatePresence>
        {other && !other.connected && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            role="status"
          >
            <span className="mt-2.5 flex items-center gap-2.5 rounded-2xl bg-white/[0.07] px-3.5 py-2.5 text-[14px] leading-snug text-mute">
              <span className="h-2.5 w-2.5 shrink-0 animate-blink rounded-full bg-gold" />
              {other.name} {g(og, "התנתק", "התנתקה")} לרגע. המשחק ממשיך {g(og, "כשיחזור", "כשתחזור")}.
            </span>
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {missed && missed.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mt-2.5 rounded-2xl border border-violet/40 bg-ink-700 px-3.5 py-3"
            role="status"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-black text-violet-soft">מה פספסת</h2>
              <button
                type="button"
                onClick={dismissMissed}
                aria-label="סגירה"
                className="-m-2 flex h-11 w-11 items-center justify-center text-mute"
              >
                <IconX size={18} />
              </button>
            </div>
            <ul className="mt-0.5 flex flex-col gap-0.5 text-[14px] text-mist">
              {missed.slice(-3).map((e) => (
                <li key={e.id} className="truncate">
                  {logHeadline(e, room.players, room.you)}
                  {e.kind === "success" && e.missionText ? `: ${e.missionText}` : ""}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                dismissMissed();
                setSheet("log");
              }}
              className="mt-1 min-h-[36px] text-[14px] font-bold text-violet-soft underline underline-offset-4"
            >
              לכל היומן
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        {room.myMission ? (
          <MissionCard mission={room.myMission} />
        ) : (
          <div className="card flex flex-1 items-center justify-center p-6 text-center text-mute">
            המשימה הבאה בדרך...
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3.5">
        <HoldButton onConfirm={() => send({ type: "success" })} hint="לוחצים ומחזיקים" disabled={!room.myMission}>
          <IconCheck size={26} />
          הצלחתי!
        </HoldButton>

        <button
          type="button"
          disabled={locked || !other}
          onClick={() => setAccuseOpen(true)}
          className={[
            "no-select relative flex min-h-[68px] w-full items-center justify-center gap-2.5 rounded-[22px] px-4 text-[22px] font-black leading-tight transition-[transform,box-shadow] duration-100",
            locked
              ? "bg-ink-700 text-mute shadow-[0_5px_0_0_#120920,inset_0_0_0_1.5px_rgba(255,77,106,0.35)]"
              : `${duoVariant.coral} active:translate-y-[5px] active:shadow-none`,
          ].join(" ")}
        >
          {locked ? (
            <>
              <CountdownRing
                fraction={cooldownLeft / ACCUSE_COOLDOWN_MS}
                seconds={Math.ceil(cooldownLeft / 1000)}
                color="#FF7088"
              />
              <span className="text-[17px]">הכפתור האדום נעול לרגע</span>
            </>
          ) : (
            <>
              <IconSiren size={26} />
              עליתי {g(og, "עליו", "עליה")}!
            </>
          )}
        </button>
      </div>

      <nav className="mt-2.5 grid grid-cols-3 gap-1" aria-label="פעולות נוספות">
        <SmallAction
          icon={<IconSwap size={19} />}
          label="החלף משימה"
          badge={room.skipsLeft}
          disabled={room.skipsLeft <= 0 || !room.myMission}
          onClick={() => setSheet("skip")}
        />
        <SmallAction
          icon={<IconScroll size={19} />}
          label="יומן מבצעים"
          badge={room.log.length || undefined}
          onClick={() => setSheet("log")}
        />
        <SmallAction icon={<IconFlag size={19} />} label="סיום משחק" onClick={() => setSheet("end")} />
      </nav>

      <ConfirmSheet
        open={sheet === "skip"}
        onClose={() => setSheet(null)}
        onConfirm={() => send({ type: "skip" })}
        title="להחליף משימה?"
        body={
          room.skipsLeft === 1
            ? "זו ההחלפה האחרונה שלך במשחק הזה. המשימה הנוכחית תיעלם ותגיע חדשה."
            : `נשארו לך ${room.skipsLeft} החלפות במשחק הזה. המשימה הנוכחית תיעלם ותגיע חדשה.`
        }
        confirmLabel="כן, משימה חדשה"
      />
      <ConfirmSheet
        open={sheet === "end"}
        onClose={() => setSheet(null)}
        onConfirm={() => send({ type: "endGame" })}
        title="לסיים את המשחק?"
        body="המשחק ייגמר לשניכם ונעבור למסך הסיכום, עם כל המשימות והניחושים חשופים."
        confirmLabel="סיימנו, לסיכום"
        variant="coral"
      />
      <Sheet open={sheet === "log"} onClose={() => setSheet(null)} title="יומן מבצעים">
        <div className="scroll-y -mx-1 min-h-0 flex-1 px-1 pb-2">
          <LogList log={room.log} players={room.players} you={room.you} />
        </div>
      </Sheet>

      <AnimatePresence>
        {accuseOpen && other && !room.judging && <AccuseSheet key="accuse" target={other} />}
      </AnimatePresence>
      <AnimatePresence>{room.judging && <JudgingOverlay key="judging" room={room} />}</AnimatePresence>
      <SuccessBurst />
    </main>
  );
}

function Scoreboard({ room, self, other }: { room: RoomView; self: PlayerView; other: PlayerView | null }) {
  const target = room.settings.target;
  return (
    <section className="card px-3.5 py-3" aria-label="ניקוד">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <ScoreSide player={self} label="אני" target={target} tone="violet" />
        <div className="flex flex-col items-center px-1 text-faint">
          {target > 0 ? (
            <>
              <span className="text-[11px] font-bold">יעד</span>
              <span className="num text-[19px] leading-none text-mute">{target}</span>
            </>
          ) : (
            <IconInfinity size={26} />
          )}
        </div>
        <ScoreSide player={other} label={other?.name ?? "..."} target={target} tone="coral" flip />
      </div>
    </section>
  );
}

function ScoreSide({
  player,
  label,
  target,
  tone,
  flip = false,
}: {
  player: PlayerView | null;
  label: string;
  target: number;
  tone: "violet" | "coral";
  flip?: boolean;
}) {
  const score = player?.score ?? 0;
  return (
    <div className="min-w-0">
      <div className={`flex items-center gap-2.5 ${flip ? "flex-row-reverse" : ""}`}>
        <span className="relative shrink-0">
          <Avatar id={player?.avatar ?? "fedora"} size={42} ring={tone === "violet" ? "#8B5CF6" : "#FF4D6A"} />
          {flip && player && (
            <span
              className={`absolute -bottom-0.5 -left-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-ink-800 ${
                player.connected ? "bg-[#5BE38B]" : "animate-blink bg-gold"
              }`}
              role="img"
              aria-label={player.connected ? "מחובר" : "מנותק"}
            />
          )}
        </span>
        <div className={`min-w-0 flex-1 ${flip ? "text-end" : ""}`}>
          <p className="truncate text-[13px] font-bold text-mute">{label}</p>
          <motion.p
            key={score}
            initial={{ scale: 1.35, color: "#FFC44D" }}
            animate={{ scale: 1, color: "#F4EEFF" }}
            transition={{ duration: 0.5 }}
            className={`num text-[36px] leading-[0.95] ${flip ? "origin-left" : "origin-right"}`}
          >
            {score}
          </motion.p>
        </div>
      </div>
      {target > 0 && (
        <div className="mt-2" dir={flip ? "ltr" : "rtl"}>
          <ProgressBar value={score / target} tone={tone} />
        </div>
      )}
    </div>
  );
}

function SmallAction({
  icon,
  label,
  badge,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  badge?: number;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl px-1 text-[13px] font-bold transition ${
        disabled ? "text-faint/60" : "text-mute active:bg-white/10"
      }`}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
      {badge !== undefined && (
        <span className="ltr flex h-5 min-w-5 items-center justify-center rounded-full bg-white/10 px-1 text-[12px] tabular-nums text-mist">
          {badge}
        </span>
      )}
    </button>
  );
}
