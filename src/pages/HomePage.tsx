import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdSlot } from "../components/AdSlot/AdSlot";
import { BoardSizeSelector } from "../components/BoardSizeSelector/BoardSizeSelector";
import { ModeSelector } from "../components/ModeSelector/ModeSelector";
import { PlayerProfileDialog } from "../components/PlayerProfileDialog/PlayerProfileDialog";
import { Seo } from "../components/Seo/Seo";
import {
  createFriendGame,
  findOrCreateRandomGame,
} from "../services/gameService";
import { HOME_JSON_LD, SITE_URL } from "../constants/seo";
import type { BoardSize, GameMode } from "../types/game";
import {
  loadPlayerProfile,
  savePlayerProfile,
  type PlayerProfile,
} from "../utils/playerProfile";
import { getOrCreatePlayerToken } from "../utils/playerToken";
import "./HomePage.css";

type ProfileDialogIntent = "host" | "join" | null;

export function HomePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<GameMode>("computer");
  const [boardSize, setBoardSize] = useState<BoardSize>(3);
  const [inviteInput, setInviteInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(
    loadPlayerProfile,
  );
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [dialogIntent, setDialogIntent] = useState<ProfileDialogIntent>(null);
  const [modeBeforeFriendDialog, setModeBeforeFriendDialog] =
    useState<GameMode | null>(null);
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(null);

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
      });
      navigate(`/game/${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось начать игру");
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: GameMode) => {
    if (newMode === "friend") {
      setModeBeforeFriendDialog(mode);
      setMode("friend");
      setDialogIntent("host");
      setProfileDialogOpen(true);
      return;
    }

    setMode(newMode);
  };

  const openHostProfileDialog = () => {
    setDialogIntent("host");
    setMode("friend");
    setProfileDialogOpen(true);
  };

  const handleProfileConfirm = (profile: PlayerProfile) => {
    savePlayerProfile(profile);
    setPlayerProfile(profile);
    setProfileDialogOpen(false);

    if (pendingJoinCode) {
      const code = pendingJoinCode;
      setPendingJoinCode(null);
      setDialogIntent(null);
      setModeBeforeFriendDialog(null);
      navigate(`/join/${code}`);
      return;
    }

    if (dialogIntent === "host") {
      setDialogIntent(null);
      setModeBeforeFriendDialog(null);
      void startFriendGame(profile);
      return;
    }

    setMode("friend");
    setDialogIntent(null);
    setModeBeforeFriendDialog(null);
  };

  const handleProfileCancel = () => {
    setProfileDialogOpen(false);
    setPendingJoinCode(null);

    if (dialogIntent === "host" && modeBeforeFriendDialog !== null) {
      setMode(modeBeforeFriendDialog);
    }

    setDialogIntent(null);
    setModeBeforeFriendDialog(null);
  };

  const handleStart = async () => {
    setError(null);

    if (mode === "computer") {
      navigate(`/game/local?size=${boardSize}`);
      return;
    }

    const playerToken = getOrCreatePlayerToken();

    if (mode === "friend") {
      openHostProfileDialog();
      return;
    }

    setLoading(true);
    try {
      const game = await findOrCreateRandomGame({ playerToken, boardSize });
      navigate(`/game/${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось начать игру");
    } finally {
      setLoading(false);
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
            : "Как вас представить другу?"
        }
        description={
          dialogIntent === "join"
            ? "Укажите имя и, если хотите, возраст — создатель игры увидит их на экране."
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
          />
          <BoardSizeSelector
            value={boardSize}
            onChange={setBoardSize}
            disabled={loading}
          />

          <h2 className="home-page__section-title">
            Играть бесплатно без регистрации
          </h2>

          {mode !== "friend" && (
            <button
              type="button"
              className="btn btn--primary home-page__start"
              onClick={handleStart}
              disabled={loading}
            >
              {loading ? "Загрузка..." : "Начать игру"}
            </button>
          )}

          {mode === "friend" && loading && (
            <p className="home-page__waiting-hint">Создаём игру…</p>
          )}

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
