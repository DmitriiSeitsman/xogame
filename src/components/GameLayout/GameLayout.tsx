import type { ReactNode } from "react";
import { AdSlot } from "../AdSlot/AdSlot";
import "./GameLayout.css";

type GameLayoutProps = {
  children: ReactNode;
  /** Extra class on the scrollable content wrapper — e.g. to reserve room
   * at the bottom while the floating chat panel is open on mobile. */
  contentClassName?: string;
};

export function GameLayout({ children, contentClassName }: GameLayoutProps) {
  return (
    <main className="game-page">
      <AdSlot placement="game_top" />
      <div className={`game-content${contentClassName ? ` ${contentClassName}` : ""}`}>
        {children}
      </div>
      <AdSlot placement="game_bottom" />
    </main>
  );
}
