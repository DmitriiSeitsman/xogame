import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { AboutPage } from "../pages/AboutPage";
import { GamePage } from "../pages/GamePage";
import { HomePage } from "../pages/HomePage";
import { JoinGamePage } from "../pages/JoinGamePage";
import { RulesPage } from "../pages/RulesPage";

export const router = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/rules",
          element: <RulesPage />,
        },
        {
          path: "/about",
          element: <AboutPage />,
        },
        {
          path: "/join/:inviteCode",
          element: <JoinGamePage />,
        },
        {
          path: "/game/:gameId",
          element: <GamePage />,
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
