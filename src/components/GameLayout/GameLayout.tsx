import type { ReactNode } from "react";
import { AdSlot } from "../AdSlot/AdSlot";
import "./GameLayout.css";

type GameLayoutProps = {
  children: ReactNode;
};

export function GameLayout({ children }: GameLayoutProps) {
  return (
    <main className="game-page">
      <AdSlot placement="game_top" />
      <div className="game-content">{children}</div>
      <AdSlot placement="game_bottom" />
    </main>
  );
}
