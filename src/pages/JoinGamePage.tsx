import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Seo } from "../components/Seo/Seo";
import { joinFriendGame } from "../services/gameService";
import { getOrCreatePlayerToken } from "../utils/playerToken";
import "./JoinGamePage.css";

export function JoinGamePage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(
    inviteCode ? null : "Код приглашения не указан",
  );

  useEffect(() => {
    if (!inviteCode) {
      return;
    }

    let cancelled = false;

    const join = async () => {
      try {
        const playerToken = getOrCreatePlayerToken();
        const game = await joinFriendGame({
          playerToken,
          inviteCode,
        });

        if (!cancelled) {
          navigate(`/game/${game.id}`, { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Не удалось подключиться к игре",
          );
        }
      }
    };

    void join();

    return () => {
      cancelled = true;
    };
  }, [inviteCode, navigate]);

  return (
    <div className="join-page page-enter">
      <Seo
        title="Присоединение к игре — Крестики-нолики"
        description="Подключение к игре в крестики-нолики по коду приглашения"
        noIndex
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
