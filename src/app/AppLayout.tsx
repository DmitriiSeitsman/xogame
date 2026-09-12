import { Outlet } from "react-router-dom";
import { FairyBackground } from "../components/FairyBackground/FairyBackground";
import { FairyMascot } from "../components/FairyMascot/FairyMascot";
import { SiteFooter } from "../components/SiteFooter/SiteFooter";
import { SiteHeader } from "../components/SiteHeader/SiteHeader";
import { YandexMetrika } from "../components/YandexMetrika/YandexMetrika";
import "./AppLayout.css";

export function AppLayout() {
  return (
    <div className="app-layout">
      <YandexMetrika />
      <FairyBackground />
      <FairyMascot />
      <SiteHeader />
      <div className="app-layout__main">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
