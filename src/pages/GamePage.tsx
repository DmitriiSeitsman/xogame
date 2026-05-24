import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { GameBoard } from "../components/GameBoard/GameBoard";
import { GameLayout } from "../components/GameLayout/GameLayout";
import { GameStatus } from "../components/GameStatus/GameStatus";
import { InviteBox } from "../components/InviteBox/InviteBox";
import { Seo } from "../components/Seo/Seo";
import { getComputerMove } from "../services/computerPlayerService";
import {
  cancelRandomSearch,
  getGameById,
  makeMove,
  subscribeToGame,
} from "../services/gameService";
import type {
  BoardSize,
  Cell,
  Game,
  LocalGameState,
  PlayerSymbol,
} from "../types/game";
import {
  calculateWinner,
  createEmptyBoard,
  getWinLength,
  getWinningCells,
  isDraw,
  makeLocalMove,
} from "../utils/gameEngine";
import { getOrCreatePlayerToken } from "../utils/playerToken";
import { getOpponentProfileLabel } from "../utils/opponent";
import { getTurnMessage, getWinnerMessage } from "../utils/winner";
import "./GamePage.css";

function createLocalGame(boardSize: BoardSize): LocalGameState {
  return {
    mode: "computer",
    boardSize,
    winLength: getWinLength(boardSize),
    board: createEmptyBoard(boardSize),
    currentTurn: "X",
    status: "playing",
    winner: null,
  };
}

function getPlayerSymbol(game: Game, playerToken: string): PlayerSymbol | null {
  if (game.player_x_token === playerToken) return "X";
  if (game.player_o_token === playerToken) return "O";
  return null;
}

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isLocal = gameId === "local";

  const [localGame, setLocalGame] = useState<LocalGameState>(() => {
    const size = Number(searchParams.get("size")) as BoardSize;
    const boardSize: BoardSize = [3, 4, 5, 6].includes(size) ? size : 3;
    return createLocalGame(boardSize);
  });

  const [remoteGame, setRemoteGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(!isLocal);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const playerToken = useMemo(() => getOrCreatePlayerToken(), []);

  useEffect(() => {
    if (isLocal || !gameId) {
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const load = async () => {
      try {
        const game = await getGameById(gameId);
        if (cancelled) return;

        setRemoteGame(game);
        setLoading(false);

        unsubscribe = subscribeToGame({
          gameId,
          onUpdate: (updatedGame) => {
            setRemoteGame(updatedGame);
          },
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Игра не найдена");
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [gameId, isLocal]);

  const handleLocalMove = useCallback((index: number) => {
    setLocalGame((prev) => {
      if (prev.status !== "playing" || prev.currentTurn !== "X") {
        return prev;
      }

      if (prev.board[index] !== "") {
        return prev;
      }

      const boardAfterPlayer = makeLocalMove(prev.board, index, "X");
      const winnerAfterPlayer = calculateWinner(
        boardAfterPlayer,
        prev.boardSize,
        prev.winLength,
      );

      if (winnerAfterPlayer) {
        return {
          ...prev,
          board: boardAfterPlayer,
          winner: winnerAfterPlayer,
          status: "finished",
        };
      }

      if (isDraw(boardAfterPlayer, null)) {
        return {
          ...prev,
          board: boardAfterPlayer,
          winner: "draw",
          status: "finished",
        };
      }

      const computerIndex = getComputerMove({
        board: boardAfterPlayer,
        boardSize: prev.boardSize,
        winLength: prev.winLength,
        computerSymbol: "O",
        playerSymbol: "X",
      });

      if (computerIndex === null) {
        return {
          ...prev,
          board: boardAfterPlayer,
          currentTurn: "O",
        };
      }

      const boardAfterComputer = makeLocalMove(
        boardAfterPlayer,
        computerIndex,
        "O",
      );
      const winnerAfterComputer = calculateWinner(
        boardAfterComputer,
        prev.boardSize,
        prev.winLength,
      );

      if (winnerAfterComputer) {
        return {
          ...prev,
          board: boardAfterComputer,
          winner: winnerAfterComputer,
          status: "finished",
        };
      }

      if (isDraw(boardAfterComputer, null)) {
        return {
          ...prev,
          board: boardAfterComputer,
          winner: "draw",
          status: "finished",
        };
      }

      return {
        ...prev,
        board: boardAfterComputer,
        currentTurn: "X",
      };
    });
  }, []);

  const handleRemoteMove = async (index: number) => {
    if (!remoteGame || !gameId) return;

    const symbol = getPlayerSymbol(remoteGame, playerToken);
    if (
      remoteGame.status !== "playing" ||
      symbol !== remoteGame.current_turn
    ) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const updated = await makeMove({
        playerToken,
        gameId,
        cellIndex: index,
      });
      setRemoteGame(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сделать ход");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSearch = async () => {
    if (!remoteGame || !gameId) return;

    setActionLoading(true);
    try {
      await cancelRandomSearch({ playerToken, gameId });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отменить поиск");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestartLocal = () => {
    setLocalGame(createLocalGame(localGame.boardSize));
  };

  if (loading) {
    return (
      <GameLayout>
        <Seo
          title="Игра — Крестики-нолики"
          description="Игра в крестики-нолики онлайн"
          noIndex
        />
        <GameStatus
          title="Загрузка игры..."
          variant="muted"
          showLoader
        />
      </GameLayout>
    );
  }

  if (error && !remoteGame && !isLocal) {
    return (
      <GameLayout>
        <Seo
          title="Игра — Крестики-нолики"
          description="Игра в крестики-нолики онлайн"
          noIndex
        />
        <GameStatus title="Ошибка" subtitle={error} variant="warning" />
        <Link to="/" className="btn btn--primary">
          На главную
        </Link>
      </GameLayout>
    );
  }

  if (isLocal) {
    const isFinished = localGame.status === "finished";
    const winningCells =
      isFinished && localGame.winner && localGame.winner !== "draw"
        ? getWinningCells(
            localGame.board,
            localGame.boardSize,
            localGame.winLength,
          )
        : [];

    const statusTitle = isFinished
      ? getWinnerMessage(localGame.winner, "X")
      : getTurnMessage(localGame.currentTurn, "X", false);

    const statusSymbol: PlayerSymbol | null = isFinished
      ? localGame.winner === "draw"
        ? null
        : localGame.winner
      : "X";

    return (
      <GameLayout>
        <Seo
          title="Игра с компьютером — Крестики-нолики"
          description="Игра в крестики-нолики онлайн против компьютера"
          noIndex
        />
        <GameStatus
          title={statusTitle || "Игра с компьютером"}
          subtitle={`Поле ${localGame.boardSize}×${localGame.boardSize} · победа: ${localGame.winLength} в ряд`}
          variant={isFinished ? "success" : "default"}
          symbol={statusSymbol}
        />
        <GameBoard
          board={localGame.board}
          boardSize={localGame.boardSize}
          disabled={isFinished}
          winningCells={winningCells}
          onCellClick={handleLocalMove}
        />
        {isFinished && (
          <div className="game-page__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleRestartLocal}
            >
              Играть снова
            </button>
            <Link to="/" className="btn btn--secondary">
              На главную
            </Link>
          </div>
        )}
      </GameLayout>
    );
  }

  if (!remoteGame) {
    return (
      <GameLayout>
        <Seo
          title="Игра — Крестики-нолики"
          description="Игра в крестики-нолики онлайн"
          noIndex
        />
        <GameStatus title="Игра не найдена" variant="warning" />
      </GameLayout>
    );
  }

  const playerSymbol = getPlayerSymbol(remoteGame, playerToken);
  const isWaitingFriend =
    remoteGame.mode === "friend" && remoteGame.status === "waiting";
  const isWaitingRandom =
    remoteGame.mode === "random" && remoteGame.status === "waiting";
  const isPlaying = remoteGame.status === "playing";
  const isFinished = remoteGame.status === "finished";

  let statusTitle = "Игра";
  let statusSubtitle: string | undefined;
  let statusVariant: "default" | "success" | "warning" | "muted" = "default";
  let statusSymbol: PlayerSymbol | null = null;
  let showLoader = false;

  if (isWaitingFriend) {
    statusTitle = "Ждём друга…";
    statusSubtitle = "Поделитесь ссылкой или кодом приглашения";
    statusVariant = "muted";
    showLoader = true;
  } else if (isWaitingRandom) {
    statusTitle = "Ищем соперника…";
    statusSubtitle = `Поле ${remoteGame.board_size}×${remoteGame.board_size}`;
    statusVariant = "muted";
    showLoader = true;
  } else if (isFinished) {
    statusTitle = getWinnerMessage(remoteGame.winner, playerSymbol);
    statusSubtitle =
      remoteGame.winner === "draw"
        ? "Ничья"
        : `Победитель: ${remoteGame.winner}`;
    statusVariant = "success";
    statusSymbol =
      remoteGame.winner === "draw" ? null : remoteGame.winner;
  } else if (isPlaying) {
    statusTitle = getTurnMessage(
      remoteGame.current_turn,
      playerSymbol,
      false,
    );
    statusSubtitle = `Поле ${remoteGame.board_size}×${remoteGame.board_size} · победа: ${remoteGame.win_length} в ряд`;
    statusSymbol =
      playerSymbol && remoteGame.current_turn === playerSymbol
        ? playerSymbol
        : remoteGame.current_turn;
  }

  const winningCells =
    isFinished && remoteGame.winner && remoteGame.winner !== "draw"
      ? getWinningCells(
          remoteGame.board as Cell[],
          remoteGame.board_size,
          remoteGame.win_length,
        )
      : [];

  const opponentLabel =
    remoteGame.mode === "friend"
      ? getOpponentProfileLabel(remoteGame, playerToken)
      : null;

  const boardDisabled =
    !isPlaying ||
    actionLoading ||
    playerSymbol !== remoteGame.current_turn;

  return (
    <GameLayout>
      <Seo
        title="Игра — Крестики-нолики"
        description="Игра в крестики-нолики онлайн"
        noIndex
      />
      <GameStatus
        title={statusTitle}
        subtitle={statusSubtitle}
        variant={statusVariant}
        symbol={statusSymbol}
        showLoader={showLoader}
      />

      {opponentLabel && (
        <p className="game-page__opponent">
          Соперник: <span>{opponentLabel}</span>
        </p>
      )}

      {isWaitingFriend && remoteGame.invite_code && (
        <InviteBox inviteCode={remoteGame.invite_code} />
      )}

      {isWaitingRandom && (
        <div className="game-page__waiting">
          <div className="game-page__waiting-loader" aria-hidden="true" />
          <p className="game-page__waiting-title">Ищем соперника…</p>
          <p className="game-page__waiting-subtitle">
            Поле {remoteGame.board_size}×{remoteGame.board_size}
          </p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleCancelSearch}
            disabled={actionLoading}
          >
            Отменить
          </button>
        </div>
      )}

      {(isPlaying || isFinished) && (
        <GameBoard
          board={remoteGame.board as Cell[]}
          boardSize={remoteGame.board_size}
          disabled={boardDisabled || isFinished}
          winningCells={winningCells}
          onCellClick={handleRemoteMove}
        />
      )}

      {error && <p className="game-page__error">{error}</p>}

      {isFinished && (
        <div className="game-page__actions">
          <Link to="/" className="btn btn--primary">
            На главную
          </Link>
        </div>
      )}
    </GameLayout>
  );
}
