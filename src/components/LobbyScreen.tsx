import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";
import { TARGET_OPTIONS } from "../../shared/protocol";
import type { DateLocation, PlayerView, Settings, Vibe } from "../../shared/protocol";
import { me, opponent, useGame } from "../game/store";
import { LOCATION_LABEL, VIBE_LABEL, g, targetLabel } from "../lib/copy";
import { inviteLink } from "../lib/profile";
import Avatar from "./ui/Avatar";
import DuoButton from "./ui/DuoButton";
import type { IconProps } from "./ui/icons";
import {
  IconBack,
  IconBolt,
  IconCheck,
  IconCopy,
  IconGlass,
  IconHeart,
  IconHome,
  IconInfinity,
  IconLock,
  IconPhone,
  IconShare,
  IconSmile,
  IconTarget,
  IconTree,
  IconWhatsApp,
} from "./ui/icons";

type Icon = ComponentType<IconProps>;

const LOCATIONS: { value: DateLocation; icon: Icon }[] = [
  { value: "cafe", icon: IconGlass },
  { value: "walk", icon: IconTree },
  { value: "home", icon: IconHome },
  { value: "phone", icon: IconPhone },
];

const VIBES: { value: Vibe; icon: Icon }[] = [
  { value: "light", icon: IconSmile },
  { value: "flirty", icon: IconHeart },
  { value: "bold", icon: IconBolt },
];

export default function LobbyScreen() {
  const room = useGame((s) => s.room)!;
  const send = useGame((s) => s.send);
  const leave = useGame((s) => s.leave);
  const intent = useGame((s) => s.intent);
  const showToast = useGame((s) => s.showToast);
  const [copied, setCopied] = useState(false);

  const self = me(room);
  const other = opponent(room);
  const host = room.players.find((p) => p.isHost) ?? self;
  const isHost = self.isHost;
  const canStart = isHost && room.players.length === 2 && room.players.every((p) => p.connected);

  const link = inviteLink(room.code);
  const message = `הזמנה למבצע סודי, משחק הריגול לדייט שלנו. קוד החדר: ${room.code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast(`לא הצלחנו להעתיק. הקוד הוא ${room.code}`, "error");
    }
  };

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "מבצע סודי", text: message, url: link });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return; // the share sheet was dismissed
      }
    }
    void copy();
  };

  const update = (patch: Partial<Settings>) => {
    if (!isHost) return;
    send({ type: "settings", settings: { ...room.settings, ...patch } });
  };

  return (
    <main className="shell">
      <header className="flex min-h-[48px] items-center justify-between">
        <button
          type="button"
          onClick={leave}
          className="-ms-2 flex h-12 w-12 items-center justify-center rounded-full text-mute active:bg-white/10"
          aria-label="יציאה מהחדר"
        >
          <IconBack />
        </button>
        <span className="eyebrow">חדר המבצעים</span>
        <span className="w-10" />
      </header>

      {/* Room code + invite */}
      <section className="card relative mt-2 overflow-hidden p-5 text-center">
        <p className="eyebrow">קוד החדר</p>
        <div className="mt-2 flex justify-center gap-2.5" dir="ltr" aria-label={`קוד החדר ${room.code.split("").join(" ")}`}>
          {room.code.split("").map((d, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              initial={{ y: 18, opacity: 0, rotate: -6 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.06 * i, type: "spring", stiffness: 320, damping: 18 }}
              className="flex h-[76px] w-[62px] items-center justify-center rounded-2xl border border-violet/40 bg-ink-950/70 text-[46px] font-black leading-none tabular-nums text-mist shadow-[inset_0_-6px_0_0_rgba(139,92,246,0.25)]"
            >
              {d}
            </motion.span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2.5">
          <DuoButton size="sm" onClick={share}>
            <IconShare size={19} />
            שליחת הזמנה
          </DuoButton>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${message}\n${link}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="שליחה בוואטסאפ"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-700 text-[#5BE38B] shadow-[0_5px_0_0_#120920,inset_0_0_0_1.5px_rgba(201,181,255,0.22)] active:translate-y-[5px] active:shadow-none"
          >
            <IconWhatsApp size={24} />
          </a>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "הקישור הועתק" : "העתקת הקישור"}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-700 text-mist shadow-[0_5px_0_0_#120920,inset_0_0_0_1.5px_rgba(201,181,255,0.22)] active:translate-y-[5px] active:shadow-none"
          >
            {copied ? <IconCheck size={22} className="text-gold" /> : <IconCopy size={22} />}
          </button>
        </div>
        <p className="mt-3 h-5 text-[13px] text-faint" aria-live="polite">
          {copied ? "הקישור הועתק. מדביקים ושולחים." : "הקישור פותח את החדר ישר אצל הצד השני"}
        </p>
      </section>

      {/* Players */}
      <section className="mt-3 grid grid-cols-2 gap-3" aria-label="הסוכנים בחדר">
        <PlayerCard player={self} you />
        {other ? <PlayerCard player={other} /> : <WaitingCard />}
      </section>
      {!other && intent === "join" && (
        <p className="mt-2 rounded-2xl bg-gold/10 px-3.5 py-2.5 text-[14px] leading-snug text-gold-hi">
          אין כאן אף אחד כרגע. אם ציפית למצוא מישהו, כדאי לבדוק שהקוד נכון.
        </p>
      )}

      {/* Settings */}
      <section className="mt-5">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="display text-[32px] text-mist">תדריך</h2>
          <span className="dashed-rule flex-1" />
          {!isHost && (
            <span className="flex items-center gap-1.5 text-[13px] font-bold text-faint">
              <IconLock size={15} />
              {host.name} {g(host.gender, "בוחר", "בוחרת")}
            </span>
          )}
        </div>

        <Group label="איפה הדייט?">
          <div className="grid grid-cols-2 gap-2.5">
            {LOCATIONS.map((o) => (
              <Chip
                key={o.value}
                icon={o.icon}
                label={LOCATION_LABEL[o.value]}
                on={room.settings.location === o.value}
                readOnly={!isHost}
                onClick={() => update({ location: o.value })}
              />
            ))}
          </div>
        </Group>

        <Group label="רמת תעוזה">
          <div className="grid grid-cols-3 gap-2.5">
            {VIBES.map((o) => (
              <Chip
                key={o.value}
                icon={o.icon}
                label={VIBE_LABEL[o.value]}
                on={room.settings.vibe === o.value}
                readOnly={!isHost}
                stacked
                onClick={() => update({ vibe: o.value })}
              />
            ))}
          </div>
        </Group>

        <Group label="משחקים עד">
          <div className="grid grid-cols-4 gap-2.5">
            {TARGET_OPTIONS.map((t) => (
              <Chip
                key={t}
                icon={t === 0 ? IconInfinity : IconTarget}
                label={targetLabel(t)}
                on={room.settings.target === t}
                readOnly={!isHost}
                stacked
                numeric={t !== 0}
                onClick={() => update({ target: t })}
              />
            ))}
          </div>
        </Group>
      </section>

      <div className="sticky bottom-0 mt-auto pt-5" style={{ paddingBottom: 4 }}>
        <div className="pointer-events-none absolute inset-x-[-16px] bottom-[-16px] top-0 bg-[linear-gradient(180deg,transparent,#0D0616_45%)]" />
        <div className="relative">
          {isHost ? (
            <>
              <DuoButton size="lg" full disabled={!canStart} onClick={() => send({ type: "start" })}>
                התחל מבצע
              </DuoButton>
              {!canStart && (
                <p className="mt-2.5 text-center text-[14px] text-faint">
                  {other ? `מחכים ש${other.name} ${g(other.gender, "יתחבר", "תתחבר")} מחדש` : "מחכים לסוכן השני כדי להתחיל"}
                </p>
              )}
            </>
          ) : (
            <div className="card flex min-h-[64px] items-center justify-center gap-3 px-4 text-center">
              <span className="h-2.5 w-2.5 animate-blink rounded-full bg-violet-hi" />
              <p className="text-[16px] font-bold text-mist">
                מחכים ש{host.name} {g(host.gender, "יתחיל", "תתחיל")} את המבצע
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function PlayerCard({ player, you = false }: { player: PlayerView; you?: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card flex flex-col items-center gap-1.5 px-3 py-3 text-center"
    >
      <div className="relative">
        <Avatar id={player.avatar} size={56} ring={you ? "#8B5CF6" : "#3B2759"} />
        <span
          className={`absolute bottom-0 left-0 h-4 w-4 rounded-full border-[3px] border-ink-800 ${
            player.connected ? "bg-[#5BE38B]" : "bg-faint"
          }`}
          title={player.connected ? "מחובר" : "לא מחובר"}
        />
      </div>
      <p className="max-w-full truncate text-[17px] font-black text-mist">{player.name}</p>
      <p className="text-[13px] font-bold text-faint">
        {you ? "זה אני" : player.connected ? g(player.gender, "מוכן למבצע", "מוכנה למבצע") : "התנתקות זמנית"}
        {player.isHost ? " · מארח" : ""}
      </p>
    </motion.div>
  );
}

function WaitingCard() {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-3xl border-2 border-dashed border-white/15 px-3 py-3 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping2 rounded-full border-2 border-violet/60" />
        <span className="absolute inset-0 animate-ping2 rounded-full border-2 border-violet/40" style={{ animationDelay: "1.2s" }} />
        <span className="h-3 w-3 rounded-full bg-violet-hi" />
      </div>
      <p className="text-[17px] font-black text-mute">מחכים...</p>
      <p className="text-[13px] font-bold text-faint">שלחו את הקוד לדייט</p>
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="mb-4">
      <legend className="eyebrow mb-2">{label}</legend>
      {children}
    </fieldset>
  );
}

interface ChipProps {
  icon: Icon;
  label: string;
  on: boolean;
  readOnly: boolean;
  stacked?: boolean;
  numeric?: boolean;
  onClick: () => void;
}

function Chip({ icon: IconC, label, on, readOnly, stacked, numeric, onClick }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={readOnly}
      onClick={onClick}
      className={[
        "flex min-h-[56px] items-center justify-center rounded-2xl border-2 px-2 font-bold leading-tight transition",
        stacked ? "flex-col gap-1 py-2.5 text-[14px]" : "gap-2.5 text-[15px]",
        on
          ? "border-violet bg-violet/25 text-white shadow-[0_10px_24px_-14px_rgba(139,92,246,0.9)]"
          : readOnly
            ? "border-white/[0.06] bg-ink-800/50 text-faint opacity-60"
            : "border-white/10 bg-ink-800 text-mute active:scale-[0.97]",
      ].join(" ")}
    >
      <IconC size={22} className={on ? "text-gold" : ""} />
      <span className={numeric ? "num text-[19px] leading-none" : ""}>{label}</span>
    </button>
  );
}
