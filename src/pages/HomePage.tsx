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
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(null);

  const handleModeChange = (newMode: GameMode) => {
    if (newMode === "friend") {
      setProfileDialogOpen(true);
      return;
    }

    setMode(newMode);
  };

  const handleProfileConfirm = (profile: PlayerProfile) => {
    savePlayerProfile(profile);
    setPlayerProfile(profile);
    setProfileDialogOpen(false);

    if (pendingJoinCode) {
      navigate(`/join/${pendingJoinCode}`);
      setPendingJoinCode(null);
      return;
    }

    setMode("friend");
  };

  const handleProfileCancel = () => {
    setProfileDialogOpen(false);
    setPendingJoinCode(null);
  };

  const handleStart = async () => {
    setError(null);
    setLoading(true);

    try {
      if (mode === "computer") {
        navigate(`/game/local?size=${boardSize}`);
        return;
      }

      const playerToken = getOrCreatePlayerToken();

      if (mode === "friend") {
        if (!playerProfile.name.trim()) {
          setProfileDialogOpen(true);
          return;
        }

        const game = await createFriendGame({
          playerToken,
          boardSize,
          playerName: playerProfile.name,
          playerAge: playerProfile.age,
        });
        navigate(`/game/${game.id}`);
        return;
      }

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

    if (!playerProfile.name.trim()) {
      setPendingJoinCode(code);
      setProfileDialogOpen(true);
      return;
    }

    navigate(`/join/${code}`);
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

          <button
            type="button"
            className="btn btn--primary home-page__start"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? "Загрузка..." : "Начать игру"}
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
