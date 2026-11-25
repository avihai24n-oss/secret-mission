import { useState } from "react";
import { motion } from "framer-motion";
import type { Gender } from "../../shared/protocol";
import { useGame } from "../game/store";
import { MAX_NAME_LENGTH } from "../lib/profile";
import Avatar, { AVATAR_IDS, AVATAR_LABEL, isAvatarId } from "./ui/Avatar";
import DuoButton from "./ui/DuoButton";
import { IconBack } from "./ui/icons";

export default function ProfileScreen() {
  const profile = useGame((s) => s.profile);
  const save = useGame((s) => s.saveProfile);
  const cancel = useGame((s) => s.editProfile);
  const pendingRoom = useGame((s) => s.roomCode);

  const [name, setName] = useState(profile?.name ?? "");
  const [avatar, setAvatar] = useState<string>(
    profile && isAvatarId(profile.avatar) ? profile.avatar : AVATAR_IDS[0]
  );
  const [gender, setGender] = useState<Gender | null>(profile?.gender ?? null);

  const trimmed = name.trim();
  const ready = trimmed.length >= 1 && gender !== null;

  return (
    <main className="shell">
      <form
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) save({ name: trimmed, avatar, gender: gender! });
        }}
      >
        <header className="flex min-h-[48px] items-center justify-between">
          {profile ? (
            <button
              type="button"
              onClick={() => cancel(false)}
              className="-ms-2 flex h-12 w-12 items-center justify-center rounded-full text-mute active:bg-white/10"
              aria-label="חזרה"
            >
              <IconBack />
            </button>
          ) : (
            <span />
          )}
          <span className="stamp">תיק אישי</span>
        </header>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
          <h1 className="display text-[64px] text-mist">מי הסוכן?</h1>
          <p className="mt-2 text-[16px] text-mute">
            {pendingRoom && !profile
              ? `מחכים לך בחדר ${pendingRoom}. רק שלושה פרטים קטנים וזהו.`
              : "שלושה פרטים קטנים לפני שיוצאים למבצע."}
          </p>
        </motion.div>

        <div className="mt-6 flex items-center gap-4">
          <motion.div key={avatar} initial={{ scale: 0.8, rotate: -8 }} animate={{ scale: 1, rotate: 0 }}>
            <Avatar id={avatar} size={76} ring="#8B5CF6" />
          </motion.div>
          <label className="min-w-0 flex-1">
            <span className="eyebrow">שם או כינוי</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
              maxLength={MAX_NAME_LENGTH}
              placeholder="איך קוראים לך?"
              autoComplete="given-name"
              enterKeyHint="done"
              className="mt-1 h-14 w-full rounded-2xl border-2 border-white/10 bg-ink-800 px-4 text-lg font-bold text-mist placeholder:font-medium placeholder:text-faint focus:border-violet focus:outline-none"
            />
          </label>
        </div>

        <fieldset className="mt-6">
          <legend className="eyebrow mb-2">הדמות שלך</legend>
          <div className="grid grid-cols-4 gap-2.5">
            {AVATAR_IDS.map((id) => {
              const on = id === avatar;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  aria-label={AVATAR_LABEL[id]}
                  onClick={() => setAvatar(id)}
                  className={`flex aspect-square items-center justify-center rounded-2xl border-2 transition ${
                    on ? "border-violet bg-violet/20" : "border-transparent bg-ink-800 active:scale-95"
                  }`}
                >
                  <Avatar id={id} size={56} />
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="eyebrow mb-2">אני</legend>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["m", "גבר"],
                ["f", "אישה"],
              ] as const
            ).map(([value, label]) => {
              const on = gender === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setGender(value)}
                  className={`min-h-[56px] rounded-2xl border-2 text-lg font-black transition ${
                    on
                      ? "border-violet bg-violet/25 text-white"
                      : "border-white/10 bg-ink-800 text-mute active:scale-[0.98]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[13px] text-faint">המשימות מנוסחות לפי זה, אז שווה לדייק.</p>
        </fieldset>

        <div className="mt-auto pt-6">
          <DuoButton type="submit" size="lg" full disabled={!ready}>
            {profile ? "שמירה" : "יאללה, יוצאים למבצע"}
          </DuoButton>
        </div>
      </form>
    </main>
  );
}
