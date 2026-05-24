import { Outlet } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter/SiteFooter";
import { SiteHeader } from "../components/SiteHeader/SiteHeader";
import "./AppLayout.css";

export function AppLayout() {
  return (
    <div className="app-layout">
      <SiteHeader />
      <div className="app-layout__main">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
