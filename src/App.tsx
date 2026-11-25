import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "./game/store";
import GameScreen from "./components/GameScreen";
import HomeScreen from "./components/HomeScreen";
import LobbyScreen from "./components/LobbyScreen";
import { IntelOverlay, VerdictOverlay } from "./components/Overlays";
import ProfileScreen from "./components/ProfileScreen";
import SummaryScreen from "./components/SummaryScreen";
import DuoButton from "./components/ui/DuoButton";
import { IconUsers, IconWifiOff, LogoMark } from "./components/ui/icons";

type Screen = "boot" | "profile" | "full" | "home" | "connecting" | "lobby" | "playing" | "ended";

export default function App() {
  const profile = useGame((s) => s.profile);
  const editingProfile = useGame((s) => s.editingProfile);
  const roomCode = useGame((s) => s.roomCode);
  const room = useGame((s) => s.room);
  const roomFull = useGame((s) => s.roomFull);
  const overlay = useGame((s) => s.overlay);
  const conn = useGame((s) => s.conn);
  const demo = useGame((s) => s.demo);

  let screen: Screen;
  if (!profile || editingProfile) screen = "profile";
  else if (roomFull) screen = "full";
  else if (!roomCode) screen = "home";
  else if (!room) screen = "connecting";
  else screen = room.phase;

  // Each screen starts at the top (the game screen never scrolls).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {screen === "profile" && <ProfileScreen />}
          {screen === "full" && <RoomFullScreen />}
          {screen === "home" && <HomeScreen />}
          {screen === "connecting" && <ConnectingScreen />}
          {screen === "lobby" && <LobbyScreen />}
          {screen === "playing" && <GameScreen />}
          {screen === "ended" && <SummaryScreen />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {room && overlay?.kind === "verdict" && <VerdictOverlay key="verdict" room={room} ev={overlay.ev} />}
        {room && overlay?.kind === "intel" && (
          <IntelOverlay key="intel" room={room} missionText={overlay.missionText} points={overlay.points} />
        )}
      </AnimatePresence>

      <ReconnectPill show={conn === "reconnecting" && !!room} />
      <ToastHost />
      {demo && (
        <span className="pointer-events-none fixed bottom-1 left-1 z-[70] rounded bg-black/50 px-1.5 text-[10px] text-white/60">
          demo: {demo}
        </span>
      )}
    </>
  );
}

function ReconnectPill({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 z-[65] flex justify-center"
          style={{ top: "max(8px, env(safe-area-inset-top))" }}
        >
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-700/95 px-3.5 py-1.5 text-[13px] font-bold text-mute shadow-lg backdrop-blur">
            <span className="h-2 w-2 animate-blink rounded-full bg-gold" />
            מתחבר מחדש…
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToastHost() {
  const toast = useGame((s) => s.toast);
  const clear = useGame((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(clear, 3200);
    return () => window.clearTimeout(t);
  }, [toast, clear]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.key}
          role={toast.tone === "error" ? "alert" : "status"}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 z-[66] flex justify-center px-4"
          style={{ bottom: "max(20px, env(safe-area-inset-bottom))" }}
        >
          <span
            className={`max-w-[400px] rounded-2xl border px-4 py-3 text-center text-[15px] font-bold shadow-xl ${
              toast.tone === "error"
                ? "border-coral/50 bg-[#3A1423] text-[#FFD3DA]"
                : toast.tone === "good"
                  ? "border-gold/40 bg-[#33270F] text-gold-hi"
                  : "border-white/10 bg-ink-700 text-mist"
            }`}
          >
            {toast.text}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConnectingScreen() {
  const roomCode = useGame((s) => s.roomCode);
  const leave = useGame((s) => s.leave);
  const conn = useGame((s) => s.conn);
  return (
    <main className="shell items-center justify-center text-center">
      <div className="relative flex h-[150px] w-[150px] items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-violet/30" />
        <span className="radar-sweep-violet absolute inset-0 animate-sweep rounded-full" />
        <LogoMark size={72} />
      </div>
      <h1 className="display mt-7 text-[56px] text-mist">נכנסים לחדר</h1>
      <p className="ltr mt-1 text-[38px] font-black leading-none tracking-[0.18em] tabular-nums text-violet-soft">{roomCode}</p>
      <p className="mt-4 flex min-h-[24px] items-center gap-2 text-[15px] text-mute" role="status">
        {conn === "reconnecting" ? (
          <>
            <IconWifiOff size={18} />
            החיבור נפל. מנסים שוב...
          </>
        ) : (
          "יוצרים קשר מוצפן..."
        )}
      </p>
      <DuoButton variant="quiet" className="mt-8" onClick={leave}>
        ביטול וחזרה הביתה
      </DuoButton>
    </main>
  );
}

function RoomFullScreen() {
  const leave = useGame((s) => s.leave);
  const roomCode = useGame((s) => s.roomCode);
  return (
    <main className="shell items-center justify-center text-center">
      <span className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-coral/15 text-coral-hi">
        <IconUsers size={52} />
      </span>
      <h1 className="display mt-6 text-[60px] text-mist">החדר מלא</h1>
      <p className="mt-2 max-w-[20rem] text-[17px] leading-snug text-mute">
        בחדר <span className="ltr font-bold text-mist">{roomCode}</span> כבר יש שני סוכנים, ומבצע סודי משחקים בשניים.
        אפשר לפתוח חדר חדש או לבדוק שוב את הקוד.
      </p>
      <DuoButton size="lg" className="mt-8" full onClick={leave}>
        חזרה הביתה
      </DuoButton>
    </main>
  );
}
