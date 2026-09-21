import { useEffect, useEffectEvent, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PlayerProfileDialog } from "../components/PlayerProfileDialog/PlayerProfileDialog";
import { Seo } from "../components/Seo/Seo";
import { useI18n } from "../i18n/useI18n";
import { joinFriendGame } from "../services/gameService";
import type { Game } from "../types/game";
import {
  loadPlayerProfile,
  savePlayerProfile,
  type PlayerProfile,
} from "../utils/playerProfile";
import { getOrCreatePlayerToken } from "../utils/playerToken";
import { trackGameJoinFriend } from "../utils/yandexMetrikaEvents";
import "./JoinGamePage.css";

/**
 * Router state the home page passes when it has already asked for the
 * player's name. Without it, entering a code on the home page meant filling
 * in and confirming the same name dialog twice — once there, and again here
 * — before the board appeared.
 */
export type JoinGameLocationState = { profileConfirmed: true };

function arrivedWithConfirmedProfile(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    (state as Partial<JoinGameLocationState>).profileConfirmed === true
  );
}

async function joinAs(inviteCode: string, profile: PlayerProfile): Promise<Game> {
  const game = await joinFriendGame({
    playerToken: getOrCreatePlayerToken(),
    inviteCode,
    playerName: profile.name,
    playerAge: profile.age,
  });
  trackGameJoinFriend({ boardSize: game.board_size });
  return game;
}

export function JoinGamePage() {
  const { t, lang, path } = useI18n();
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // Read once: a shared /join link opened directly still asks for a name.
  const [skipDialog] = useState(
    () => Boolean(inviteCode) && arrivedWithConfirmedProfile(location.state),
  );
  const [error, setError] = useState<string | null>(
    inviteCode ? null : t.join.errorNoCode,
  );
  const [profile, setProfile] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [profileDialogOpen, setProfileDialogOpen] = useState(!skipDialog);
  const [isJoining, setIsJoining] = useState(skipDialog);

  const handleJoined = (game: Game) => {
    navigate(path(`/game/${game.id}`), { replace: true });
  };

  const handleJoinFailed = (err: unknown) => {
    setError(err instanceof Error ? err.message : t.join.errorJoinFailed);
    setIsJoining(false);
  };

  const handleProfileConfirm = (nextProfile: PlayerProfile) => {
    savePlayerProfile(nextProfile);
    setProfile(nextProfile);
    setProfileDialogOpen(false);
    if (!inviteCode) {
      return;
    }
    setError(null);
    setIsJoining(true);
    joinAs(inviteCode, nextProfile).then(handleJoined, handleJoinFailed);
  };

  // Arrived from the home page with the name already confirmed: join
  // straight away with the saved profile. `cancelled` keeps StrictMode's
  // double-run in development from navigating twice.
  const onJoined = useEffectEvent(handleJoined);
  const onJoinFailed = useEffectEvent(handleJoinFailed);

  useEffect(() => {
    if (!skipDialog || !inviteCode) {
      return;
    }
    let cancelled = false;
    joinAs(inviteCode, loadPlayerProfile()).then(
      (game) => {
        if (!cancelled) onJoined(game);
      },
      (err: unknown) => {
        if (!cancelled) onJoinFailed(err);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [skipDialog, inviteCode]);

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
