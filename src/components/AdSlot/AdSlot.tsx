import type { AdPlacement } from "../../types/game";
import "./AdSlot.css";

type AdSlotProps = {
  placement: AdPlacement;
};

const adsEnabled = import.meta.env.VITE_ADS_ENABLED === "true";

export function AdSlot({ placement }: AdSlotProps) {
  if (!adsEnabled) {
    return null;
  }

  return (
    <aside className="ad-slot" data-placement={placement} aria-label="Реклама">
      <div className="ad-slot__inner">
        <span className="ad-slot__label">Ad space</span>
        <span className="ad-slot__placement">{placement}</span>
      </div>
    </aside>
  );
}
