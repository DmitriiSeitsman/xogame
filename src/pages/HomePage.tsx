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
import { HOME_JSON_LD, SITE_URL } from "../constants/seo";
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
import "./HomePage.css";

type ProfileDialogIntent = "host" | "join" | "random" | null;

export function HomePage() {
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
      navigate(`/game/${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось начать игру");
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
      navigate(`/game/${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось начать игру");
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
      navigate(`/join/${code}`);
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
      navigate(
        `/game/local?size=${boardSize}&difficulty=${computerDifficulty}`,
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
      setError("Введите код приглашения");
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
        title="Крестики-нолики онлайн — играть бесплатно с другом или компьютером"
        description="Играй в крестики-нолики онлайн бесплатно: с компьютером, другом по ссылке или случайным игроком. Поля 3×3, 4×4, 5×5 и 6×6. Без регистрации."
        canonical={`${SITE_URL}/`}
        jsonLd={HOME_JSON_LD as Record<string, unknown>}
      />

      <PlayerProfileDialog
        open={profileDialogOpen}
        initialProfile={playerProfile}
        title={
          dialogIntent === "join"
            ? "Как вас представить сопернику?"
            : dialogIntent === "random"
              ? "Как вас представить сопернику?"
              : "Как вас представить другу?"
        }
        description={
          dialogIntent === "join"
            ? "Укажите имя и, если хотите, возраст — создатель игры увидит их на экране."
            : dialogIntent === "random"
              ? "Укажите имя и, если хотите, возраст — случайный соперник увидит их во время игры."
              : "Укажите имя и, если хотите, возраст. После этого мы создадим игру и покажем ссылку для друга."
        }
        onConfirm={handleProfileConfirm}
        onCancel={handleProfileCancel}
      />

      <AdSlot placement="home_top" />

      <main className="home-page__content">
        <header className="home-page__header">
          <h1 className="home-page__title">Крестики-нолики онлайн</h1>
          <p className="home-page__subtitle">
            Играй бесплатно с компьютером, другом по ссылке или случайным
            соперником
          </p>
        </header>

        <section className="home-page__panel" aria-label="Настройки игры">
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

          <h2 className="home-page__section-title">
            Играть бесплатно без регистрации
          </h2>

          <button
            type="button"
            className="btn btn--primary home-page__start"
            onClick={handleStart}
            disabled={loading || profileDialogOpen}
          >
            {loading
              ? mode === "friend"
                ? "Создаём игру…"
                : "Загрузка..."
              : mode === "friend"
                ? "Создать игру"
                : "Начать игру"}
          </button>

          {error && <p className="home-page__error">{error}</p>}
        </section>

        <section className="home-page__join" aria-label="Присоединение по коду">
          <p className="home-page__join-label">Есть код приглашения?</p>
          <div className="home-page__join-row">
            <input
              type="text"
              className="home-page__input"
              placeholder="ABCDE"
              value={inviteInput}
              onChange={(event) => setInviteInput(event.target.value.toUpperCase())}
              maxLength={5}
              disabled={loading}
              aria-label="Код приглашения"
            />
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleJoin}
              disabled={loading}
            >
              Присоединиться
            </button>
          </div>
        </section>

        <section className="home-page__seo">
          <h2 className="home-page__seo-title">
            Играть в крестики-нолики онлайн
          </h2>
          <p className="home-page__seo-text">
            Крестики-нолики — простая и знакомая игра для детей и взрослых. На
            сайте можно играть бесплатно без регистрации: против компьютера, с
            другом по ссылке или со случайным игроком онлайн. Выберите поле 3×3,
            4×4, 5×5 или 6×6 и начните партию.
          </p>
        </section>
      </main>

      <AdSlot placement="home_bottom" />
    </div>
  );
}
