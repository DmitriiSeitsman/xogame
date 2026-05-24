import { Outlet } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter/SiteFooter";
import "./AppLayout.css";

export function AppLayout() {
  return (
    <div className="app-layout">
      <div className="app-layout__main">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
