import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdSlot } from "../components/AdSlot/AdSlot";
import { BoardSizeSelector } from "../components/BoardSizeSelector/BoardSizeSelector";
import { DifficultySelector } from "../components/DifficultySelector/DifficultySelector";
import { ModeSelector } from "../components/ModeSelector/ModeSelector";
import { PlayerProfileDialog } from "../components/PlayerProfileDialog/PlayerProfileDialog";
import { Seo } from "../components/Seo/Seo";
import { SymbolThemeSelector } from "../components/SymbolThemeSelector/SymbolThemeSelector";
import {
  createFriendGame,
  joinRandomMatchmaking,
} from "../services/gameService";
import { useMatchmakingQueueCounts } from "../hooks/useMatchmakingQueueCounts";
import { getPageSeo, getWebApplicationJsonLd } from "../constants/seo";
import { useI18n } from "../i18n/useI18n";
import type { BoardSize, ComputerDifficulty, GameMode } from "../types/game";
import type { SymbolTheme } from "../types/gameTheme";
import {
  loadComputerDifficulty,
  saveComputerDifficulty,
} from "../utils/computerDifficulty";
import {
  getSavedSymbolTheme,
  saveSymbolTheme,
} from "../utils/symbolTheme";
import {
  loadPlayerProfile,
  savePlayerProfile,
  type PlayerProfile,
} from "../utils/playerProfile";
import { getOrCreatePlayerToken } from "../utils/playerToken";
import {
  trackGameStartComputer,
  trackGameStartFriendHost,
  trackGameStartRandom,
} from "../utils/yandexMetrikaEvents";
import "./HomePage.css";

type ProfileDialogIntent = "host" | "join" | "random" | null;

export function HomePage() {
  const { t, lang, path } = useI18n();
  const seo = getPageSeo("/", lang);
  const navigate = useNavigate();
  const [mode, setMode] = useState<GameMode>("computer");
  const [boardSize, setBoardSize] = useState<BoardSize>(3);
  const [computerDifficulty, setComputerDifficulty] = useState<ComputerDifficulty>(
    loadComputerDifficulty,
  );
  const [symbolTheme, setSymbolTheme] = useState<SymbolTheme>(getSavedSymbolTheme);
  const [inviteInput, setInviteInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(
    loadPlayerProfile,
  );
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [dialogIntent, setDialogIntent] = useState<ProfileDialogIntent>(null);
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(null);
  const queueCounts = useMatchmakingQueueCounts();

  const startFriendGame = async (profile: PlayerProfile) => {
    setError(null);
    setLoading(true);

    try {
      const playerToken = getOrCreatePlayerToken();
      const game = await createFriendGame({
        playerToken,
        boardSize,
        playerName: profile.name,
        playerAge: profile.age,
        symbolTheme,
      });
      trackGameStartFriendHost({ boardSize, symbolTheme });
      navigate(path(`/game/${game.id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.home.errorStartFailed);
    } finally {
      setLoading(false);
    }
  };

  const startRandomGame = async (profile: PlayerProfile) => {
    setError(null);
    setLoading(true);

    try {
      const playerToken = getOrCreatePlayerToken();
      const game = await joinRandomMatchmaking({
        playerToken,
        boardSize,
        playerName: profile.name,
        playerAge: profile.age,
      });
      trackGameStartRandom({ boardSize });
      navigate(path(`/game/${game.id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.home.errorStartFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (nextTheme: SymbolTheme) => {
    setSymbolTheme(nextTheme);
    saveSymbolTheme(nextTheme);
  };

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
  };

  const handleProfileConfirm = (profile: PlayerProfile) => {
    savePlayerProfile(profile);
    setPlayerProfile(profile);
    setProfileDialogOpen(false);

    if (pendingJoinCode) {
      const code = pendingJoinCode;
      setPendingJoinCode(null);
      setDialogIntent(null);
      navigate(path(`/join/${code}`));
      return;
    }

    if (dialogIntent === "host") {
      setDialogIntent(null);
      void startFriendGame(profile);
      return;
    }

    if (dialogIntent === "random") {
      setDialogIntent(null);
      void startRandomGame(profile);
      return;
    }
  };

  const handleProfileCancel = () => {
    setProfileDialogOpen(false);
    setPendingJoinCode(null);
    setDialogIntent(null);
  };

  const handleStart = () => {
    setError(null);

    if (mode === "computer") {
      saveComputerDifficulty(computerDifficulty);
      trackGameStartComputer({
        boardSize,
        difficulty: computerDifficulty,
        symbolTheme,
      });
      navigate(
        path(`/game/local?size=${boardSize}&difficulty=${computerDifficulty}`),
      );
      return;
    }

    if (mode === "friend") {
      setDialogIntent("host");
      setProfileDialogOpen(true);
      return;
    }

    if (mode === "random") {
      setDialogIntent("random");
      setProfileDialogOpen(true);
    }
  };

  const handleJoin = () => {
    const code = inviteInput.trim().toUpperCase();
    if (!code) {
      setError(t.home.errorEnterInviteCode);
      return;
    }

    setError(null);
    setPendingJoinCode(code);
    setDialogIntent("join");
    setProfileDialogOpen(true);
  };

  return (
    <div className="home-page page-enter">
      <Seo
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        language={lang}
        route="/"
        jsonLd={getWebApplicationJsonLd(lang)}
      />

      <PlayerProfileDialog
        open={profileDialogOpen}
        initialProfile={playerProfile}
        title={
          dialogIntent === "join" || dialogIntent === "random"
            ? t.profileDialog.titleForOpponent
            : t.profileDialog.titleForFriend
        }
        description={
          dialogIntent === "join"
            ? t.profileDialog.descriptionJoin
            : dialogIntent === "random"
              ? t.profileDialog.descriptionRandom
              : t.profileDialog.descriptionHost
        }
        onConfirm={handleProfileConfirm}
        onCancel={handleProfileCancel}
      />

      <AdSlot placement="home_top" />

      <main className="home-page__content">
        <header className="home-page__header">
          <h1 className="home-page__title">{t.home.heading}</h1>
          <p className="home-page__subtitle">{t.home.subtitle}</p>
        </header>

        <section className="home-page__panel" aria-label={t.home.settingsLabel}>
          <ModeSelector
            value={mode}
            onChange={handleModeChange}
            disabled={loading}
            queueCounts={queueCounts}
          />
          <BoardSizeSelector
            value={boardSize}
            onChange={setBoardSize}
            disabled={loading}
          />
          <SymbolThemeSelector
            value={symbolTheme}
            onChange={handleThemeChange}
            disabled={loading}
          />

          {mode === "computer" && (
            <DifficultySelector
              value={computerDifficulty}
              onChange={setComputerDifficulty}
              disabled={loading}
            />
          )}

          <h2 className="home-page__section-title">{t.home.sectionTitle}</h2>

          <button
            type="button"
            className="btn btn--primary home-page__start"
            onClick={handleStart}
            disabled={loading || profileDialogOpen}
          >
            {loading
              ? mode === "friend"
                ? t.home.creatingGame
                : t.common.loading
              : mode === "friend"
                ? t.home.createGame
                : t.home.start}
          </button>

          {error && <p className="home-page__error">{error}</p>}
        </section>

        <section className="home-page__join" aria-label={t.home.joinSectionLabel}>
          <p className="home-page__join-label">{t.home.joinLabel}</p>
          <div className="home-page__join-row">
            <input
              type="text"
              className="home-page__input"
              placeholder="ABCDE"
              value={inviteInput}
              onChange={(event) => setInviteInput(event.target.value.toUpperCase())}
              maxLength={5}
              disabled={loading}
              aria-label={t.home.inviteCodeLabel}
            />
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleJoin}
              disabled={loading}
            >
              {t.home.join}
            </button>
          </div>
        </section>

        <section className="home-page__seo">
          <h2 className="home-page__seo-title">{t.home.seoHeading}</h2>
          <p className="home-page__seo-text">{t.home.seoText}</p>
        </section>
      </main>

      <AdSlot placement="home_bottom" />
    </div>
  );
}
