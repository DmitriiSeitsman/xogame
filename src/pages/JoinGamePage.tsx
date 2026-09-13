import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlayerProfileDialog } from "../components/PlayerProfileDialog/PlayerProfileDialog";
import { Seo } from "../components/Seo/Seo";
import { useI18n } from "../i18n/useI18n";
import { joinFriendGame } from "../services/gameService";
import {
  loadPlayerProfile,
  savePlayerProfile,
  type PlayerProfile,
} from "../utils/playerProfile";
import { getOrCreatePlayerToken } from "../utils/playerToken";
import { trackGameJoinFriend } from "../utils/yandexMetrikaEvents";
import "./JoinGamePage.css";

export function JoinGamePage() {
  const { t, lang, path } = useI18n();
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(
    inviteCode ? null : t.join.errorNoCode,
  );
  const [profile, setProfile] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [profileDialogOpen, setProfileDialogOpen] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  const joinGame = async (playerProfile: PlayerProfile) => {
    if (!inviteCode) {
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const playerToken = getOrCreatePlayerToken();
      const game = await joinFriendGame({
        playerToken,
        inviteCode,
        playerName: playerProfile.name,
        playerAge: playerProfile.age,
      });

      trackGameJoinFriend({ boardSize: game.board_size });
      navigate(path(`/game/${game.id}`), { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.join.errorJoinFailed,
      );
      setIsJoining(false);
    }
  };

  const handleProfileConfirm = (nextProfile: PlayerProfile) => {
    savePlayerProfile(nextProfile);
    setProfile(nextProfile);
    setProfileDialogOpen(false);
    void joinGame(nextProfile);
  };

  const handleProfileCancel = () => {
    navigate(path("/"));
  };

  return (
    <div className="join-page page-enter">
      <Seo
        title={`${t.join.connecting} — ${t.home.heading}`}
        description={t.join.connectingMessage}
        language={lang}
        noIndex
      />

      <PlayerProfileDialog
        open={profileDialogOpen}
        title={t.join.dialogTitle}
        description={t.join.dialogDescription}
        initialProfile={profile}
        onConfirm={handleProfileConfirm}
        onCancel={handleProfileCancel}
      />

      <div className="join-page__card">
        {error ? (
          <>
            <h1 className="join-page__title">{t.common.error}</h1>
            <p className="join-page__message">{error}</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate(path("/"))}
            >
              {t.common.goHome}
            </button>
          </>
        ) : isJoining ? (
          <>
            <div className="join-page__loader" aria-hidden="true" />
            <h1 className="join-page__title">{t.join.connecting}</h1>
            <p className="join-page__message">{t.join.connectingMessage}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
