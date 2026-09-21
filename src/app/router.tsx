import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { LanguageRoot } from "./LanguageRoot";
import { AboutPage } from "../pages/AboutPage";
import { GamePage } from "../pages/GamePage";
import { HomePage } from "../pages/HomePage";
import { JoinGamePage } from "../pages/JoinGamePage";
import { RulesPage } from "../pages/RulesPage";
import { StrategyPage } from "../pages/StrategyPage";
import { ContactsPage } from "../pages/ContactsPage";
import { PrivacyPage } from "../pages/PrivacyPage";

/**
 * The same page tree is mounted twice — unprefixed for Russian and under
 * /en for English. Separate URLs per language is what lets both versions be
 * indexed independently; the language is then read straight off the route
 * rather than from any client-side state.
 */
const pageRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
  { path: "rules", element: <RulesPage /> },
  { path: "strategy", element: <StrategyPage /> },
  { path: "about", element: <AboutPage /> },
  { path: "contacts", element: <ContactsPage /> },
  { path: "privacy", element: <PrivacyPage /> },
  { path: "join/:inviteCode", element: <JoinGamePage /> },
  { path: "game/:gameId", element: <GamePage /> },
];

export const router = createBrowserRouter(
  [
    {
      path: "/en",
      element: <LanguageRoot language="en" />,
      children: pageRoutes,
    },
    {
      path: "/",
      element: <LanguageRoot language="ru" />,
      children: pageRoutes,
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
