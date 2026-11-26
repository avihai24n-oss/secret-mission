import type { ComponentType } from "react";
import { PLACES } from "../../shared/protocol";
import type { Place } from "../../shared/protocol";
import { PLACE_LABEL, PLACE_SHORT } from "../lib/copy";
import type { IconProps } from "./ui/icons";
import { IconBed, IconBriefcase, IconBus, IconHome, IconShop, IconTree, IconWheel } from "./ui/icons";

export const PLACE_ICON: Record<Place, ComponentType<IconProps>> = {
  home: IconHome,
  bed: IconBed,
  outside: IconTree,
  driving: IconWheel,
  transit: IconBus,
  work: IconBriefcase,
  public: IconShop,
};

/** Icon and label of a place, inline. */
export function PlaceTag({ place, size = 15, className = "" }: { place: Place; size?: number; className?: string }) {
  const IconC = PLACE_ICON[place];
  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
      <IconC size={size} />
      <span className="truncate">{PLACE_LABEL[place]}</span>
    </span>
  );
}

interface PlacePickerProps {
  value: Place | null;
  onPick: (place: Place) => void;
  /** "grid": four small stacked buttons per row (lobby). "list": two wide buttons per row (sheet). */
  layout?: "grid" | "list";
}

/** "איפה אני עכשיו?": each player picks their own place. Same look as the lobby's option buttons. */
export default function PlacePicker({ value, onPick, layout = "grid" }: PlacePickerProps) {
  const grid = layout === "grid";
  return (
    <div className={grid ? "grid grid-cols-4 gap-2" : "grid grid-cols-2 gap-2.5"}>
      {PLACES.map((place) => {
        const IconC = PLACE_ICON[place];
        const on = value === place;
        return (
          <button
            key={place}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(place)}
            className={[
              "flex items-center justify-center rounded-2xl border-2 font-bold leading-tight transition active:scale-[0.97]",
              grid ? "min-h-[58px] flex-col gap-1 px-1 py-2 text-[12.5px]" : "min-h-[56px] gap-2.5 px-2 text-[15px]",
              on
                ? "border-violet bg-violet/25 text-white shadow-[0_10px_24px_-14px_rgba(139,92,246,0.9)]"
                : "border-white/10 bg-ink-800 text-mute",
            ].join(" ")}
          >
            <IconC size={grid ? 20 : 22} className={on ? "text-gold" : ""} />
            <span>{grid ? PLACE_SHORT[place] : PLACE_LABEL[place]}</span>
          </button>
        );
      })}
    </div>
  );
}
