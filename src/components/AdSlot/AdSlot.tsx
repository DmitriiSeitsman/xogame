import { useI18n } from "../../i18n/useI18n";
import type { AdPlacement } from "../../types/game";
import "./AdSlot.css";

type AdSlotProps = {
  placement: AdPlacement;
};

const adsEnabled = import.meta.env.VITE_ADS_ENABLED === "true";

export function AdSlot({ placement }: AdSlotProps) {
  const { t } = useI18n();

  if (!adsEnabled) {
    return null;
  }

  return (
    <aside
      className="ad-slot"
      data-placement={placement}
      aria-label={t.common.advertisement}
    >
      <div className="ad-slot__inner">
        <span className="ad-slot__label">Ad space</span>
        <span className="ad-slot__placement">{placement}</span>
      </div>
    </aside>
  );
}
