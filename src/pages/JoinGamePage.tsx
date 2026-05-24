import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlayerProfileDialog } from "../components/PlayerProfileDialog/PlayerProfileDialog";
import { Seo } from "../components/Seo/Seo";
import { joinFriendGame } from "../services/gameService";
import {
  loadPlayerProfile,
  savePlayerProfile,
  type PlayerProfile,
} from "../utils/playerProfile";
import { getOrCreatePlayerToken } from "../utils/playerToken";
import "./JoinGamePage.css";

type JoinConnectingProps = {
  inviteCode: string;
  profile: PlayerProfile;
  onError: (message: string) => void;
};

function JoinConnecting({ inviteCode, profile, onError }: JoinConnectingProps) {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const join = async () => {
      try {
        const playerToken = getOrCreatePlayerToken();
        const game = await joinFriendGame({
          playerToken,
          inviteCode,
          playerName: profile.name,
          playerAge: profile.age,
        });

        if (!cancelled) {
          navigate(`/game/${game.id}`, { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          onError(
            err instanceof Error ? err.message : "Не удалось подключиться к игре",
          );
        }
      }
    };

    void join();

    return () => {
      cancelled = true;
    };
  }, [inviteCode, profile, navigate, onError]);

  return (
    <>
      <div className="join-page__loader" aria-hidden="true" />
      <h1 className="join-page__title">Подключение...</h1>
      <p className="join-page__message">Присоединяемся к игре</p>
    </>
  );
}

export function JoinGamePage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(
    inviteCode ? null : "Код приглашения не указан",
  );
  const [profile, setProfile] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [profileDialogOpen, setProfileDialogOpen] = useState(
    () => !loadPlayerProfile().name.trim(),
  );
  const [isConnecting, setIsConnecting] = useState(
    () => Boolean(inviteCode) && loadPlayerProfile().name.trim().length > 0,
  );

  const handleProfileConfirm = (nextProfile: PlayerProfile) => {
    savePlayerProfile(nextProfile);
    setProfile(nextProfile);
    setProfileDialogOpen(false);
    setIsConnecting(true);
  };

  const handleProfileCancel = () => {
    navigate("/");
  };

  return (
    <div className="join-page page-enter">
      <Seo
        title="Присоединение к игре — Крестики-нолики"
        description="Подключение к игре в крестики-нолики по коду приглашения"
        noIndex
      />

      <PlayerProfileDialog
        open={profileDialogOpen}
        title="Как вас представить сопернику?"
        description="Укажите имя и, если хотите, возраст — создатель игры увидит их на экране."
        initialProfile={profile}
        onConfirm={handleProfileConfirm}
        onCancel={handleProfileCancel}
      />

      <div className="join-page__card">
        {error ? (
          <>
            <h1 className="join-page__title">Ошибка</h1>
            <p className="join-page__message">{error}</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate("/")}
            >
              На главную
            </button>
          </>
        ) : isConnecting && inviteCode ? (
          <JoinConnecting
            inviteCode={inviteCode}
            profile={profile}
            onError={setError}
          />
        ) : (
          <>
            <div className="join-page__loader" aria-hidden="true" />
            <h1 className="join-page__title">Подключение...</h1>
            <p className="join-page__message">Присоединяемся к игре</p>
          </>
        )}
      </div>
    </div>
  );
}
