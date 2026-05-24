import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { GameBoard } from "../components/GameBoard/GameBoard";
import { GameLayout } from "../components/GameLayout/GameLayout";
import { GameStatus } from "../components/GameStatus/GameStatus";
import { InviteBox } from "../components/InviteBox/InviteBox";
import { Seo } from "../components/Seo/Seo";
import { getComputerMove } from "../services/computerPlayerService";
import type { ComputerMoveRequest } from "../services/computerPlayerService";
import {
  cancelRandomSearch,
  getGameById,
  heartbeatRandomMatchmaking,
  leaveRandomMatchmaking,
  makeMove,
  subscribeToGame,
} from "../services/gameService";
import type {
  BoardSize,
  Cell,
  ComputerDifficulty,
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
import { applyComputerMove } from "../utils/applyComputerMove";
import {
  COMPUTER_DIFFICULTY_LABELS,
  loadComputerDifficulty,
  parseComputerDifficultyParam,
} from "../utils/computerDifficulty";
import type { ComputerMoveWorkerResponse } from "../workers/computerMove.worker";
import { getOpponentProfileLabel } from "../utils/opponent";
import { getOrCreatePlayerToken } from "../utils/playerToken";
import { getTurnMessage, getWinnerMessage } from "../utils/winner";
import "./GamePage.css";

function createLocalGame(
  boardSize: BoardSize,
  difficulty: ComputerDifficulty,
): LocalGameState {
  return {
    mode: "computer",
    boardSize,
    winLength: getWinLength(boardSize),
    difficulty,
    board: createEmptyBoard(boardSize),
    currentTurn: "X",
    status: "playing",
    winner: null,
  };
}

function readLocalGameFromSearchParams(
  searchParams: URLSearchParams,
): LocalGameState {
  const size = Number(searchParams.get("size")) as BoardSize;
  const boardSize: BoardSize = [3, 4, 5, 6].includes(size) ? size : 3;
  const difficulty =
    parseComputerDifficultyParam(searchParams.get("difficulty")) ??
    loadComputerDifficulty();

  return createLocalGame(boardSize, difficulty);
}

function getPlayerSymbol(game: Game, playerToken: string): PlayerSymbol | null {
  if (game.player_x_token === playerToken) return "X";
  if (game.player_o_token === playerToken) return "O";
  return null;
}

const RANDOM_HEARTBEAT_MS = 25_000;

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isLocal = gameId === "local";

  const [localGame, setLocalGame] = useState<LocalGameState>(() =>
    readLocalGameFromSearchParams(searchParams),
  );
  const [botThinking, setBotThinking] = useState(false);
  const [botProgress, setBotProgress] = useState(0);

  const [remoteGame, setRemoteGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(!isLocal);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const playerToken = useMemo(() => getOrCreatePlayerToken(), []);
  const isWaitingRandomRef = useRef(false);
  const gameIdRef = useRef<string | undefined>(gameId);
  const playerTokenRef = useRef(playerToken);
  const leaveQueueTimeoutRef = useRef<number | undefined>(undefined);
  const pendingBotContextRef = useRef<{
    turnId: number;
    game: LocalGameState;
    boardAfterPlayer: Cell[];
  } | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const activeBotTurnIdRef = useRef(0);

  const remoteGameMode = remoteGame?.mode;
  const remoteGameStatus = remoteGame?.status;

  useEffect(() => {
    gameIdRef.current = gameId;
    playerTokenRef.current = playerToken;
  }, [gameId, playerToken]);

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

  useEffect(() => {
    if (isLocal || !gameId || !remoteGameMode) {
      isWaitingRandomRef.current = false;
      return;
    }

    const isWaitingRandom =
      remoteGameMode === "random" && remoteGameStatus === "waiting";

    isWaitingRandomRef.current = isWaitingRandom;

    if (!isWaitingRandom) {
      return;
    }

    let cancelled = false;

    const sendHeartbeat = async () => {
      try {
        const game = await heartbeatRandomMatchmaking({ playerToken });
        if (!cancelled) {
          setRemoteGame(game);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Поиск соперника прерван",
          );
        }
      }
    };

    void sendHeartbeat();
    const intervalId = window.setInterval(() => {
      void sendHeartbeat();
    }, RANDOM_HEARTBEAT_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [gameId, isLocal, playerToken, remoteGameMode, remoteGameStatus]);

  useEffect(() => {
    if (leaveQueueTimeoutRef.current !== undefined) {
      window.clearTimeout(leaveQueueTimeoutRef.current);
      leaveQueueTimeoutRef.current = undefined;
    }

    return () => {
      leaveQueueTimeoutRef.current = window.setTimeout(() => {
        if (isWaitingRandomRef.current && gameIdRef.current) {
          void leaveRandomMatchmaking({
            playerToken: playerTokenRef.current,
            gameId: gameIdRef.current,
          }).catch(() => undefined);
        }
      }, 250);
    };
  }, []);

  const finishBotTurn = useCallback((turnId: number, computerIndex: number | null) => {
    setBotThinking(false);
    setBotProgress(0);

    if (turnId !== activeBotTurnIdRef.current) {
      return;
    }

    const pending = pendingBotContextRef.current;

    if (!pending || pending.turnId !== turnId) {
      return;
    }

    pendingBotContextRef.current = null;

    setLocalGame(
      applyComputerMove(
        pending.game,
        pending.boardAfterPlayer,
        computerIndex,
      ),
    );
  }, []);

  useEffect(() => {
    if (!isLocal) {
      return;
    }

    const worker = new Worker(
      new URL("../workers/computerMove.worker.ts", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (event: MessageEvent<ComputerMoveWorkerResponse>) => {
      const message = event.data;

      if (message.turnId !== activeBotTurnIdRef.current) {
        return;
      }

      if (message.type === "progress") {
        setBotProgress(message.progress);
        return;
      }

      if (message.type === "error") {
        finishBotTurn(message.turnId, null);
        return;
      }

      finishBotTurn(message.turnId, message.index);
    };

    workerRef.current = worker;

    return () => {
      activeBotTurnIdRef.current += 1;
      pendingBotContextRef.current = null;
      worker.terminate();
      workerRef.current = null;
    };
  }, [isLocal, finishBotTurn]);

  const beginBotTurn = useCallback(
    (game: LocalGameState, boardAfterPlayer: Cell[]) => {
      const turnId = activeBotTurnIdRef.current + 1;
      activeBotTurnIdRef.current = turnId;
      pendingBotContextRef.current = { turnId, game, boardAfterPlayer };
      setBotThinking(true);
      setBotProgress(0);

      const request: ComputerMoveRequest = {
        board: boardAfterPlayer,
        boardSize: game.boardSize,
        winLength: game.winLength,
        computerSymbol: "O",
        playerSymbol: "X",
        difficulty: game.difficulty,
      };

      if (game.difficulty === "hard" && workerRef.current) {
        workerRef.current.postMessage({ type: "compute", turnId, request });
        return;
      }

      window.requestAnimationFrame(() => {
        if (turnId !== activeBotTurnIdRef.current) {
          return;
        }

        const computerIndex = getComputerMove({
          ...request,
          onProgress:
            game.difficulty === "hard" ? setBotProgress : undefined,
        });
        finishBotTurn(turnId, computerIndex);
      });
    },
    [finishBotTurn],
  );

  useEffect(() => {
    if (!isLocal || !botThinking) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const pending = pendingBotContextRef.current;
      if (!pending) {
        setBotThinking(false);
        setBotProgress(0);
        return;
      }

      finishBotTurn(pending.turnId, null);
    }, 30_000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [botThinking, finishBotTurn, isLocal]);

  const handleLocalMove = useCallback(
    (index: number) => {
      if (botThinking) {
        return;
      }

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

        const gameAfterPlayer = { ...prev, board: boardAfterPlayer };

        queueMicrotask(() => {
          beginBotTurn(gameAfterPlayer, boardAfterPlayer);
        });

        return gameAfterPlayer;
      });
    },
    [beginBotTurn, botThinking],
  );

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

    isWaitingRandomRef.current = false;

    if (leaveQueueTimeoutRef.current !== undefined) {
      window.clearTimeout(leaveQueueTimeoutRef.current);
      leaveQueueTimeoutRef.current = undefined;
    }

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
    setLocalGame(createLocalGame(localGame.boardSize, localGame.difficulty));
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

    const statusTitle = botThinking
      ? "Бот думает"
      : isFinished
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
          subtitle={
            botThinking
              ? botProgress > 0
                ? `Анализ ходов: ${botProgress}%`
                : "Подготовка к расчёту…"
              : `Поле ${localGame.boardSize}×${localGame.boardSize} · победа: ${localGame.winLength} в ряд · бот: ${COMPUTER_DIFFICULTY_LABELS[localGame.difficulty]}`
          }
          variant={isFinished ? "success" : botThinking ? "muted" : "default"}
          symbol={botThinking ? "O" : statusSymbol}
          showLoader={botThinking}
        />
        {botThinking && (
          <div
            className="game-page__bot-thinking"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={botProgress}
            aria-label="Бот думает"
          >
            <div className="game-page__bot-progress-track">
              <div
                className="game-page__bot-progress-bar"
                style={{ width: `${Math.max(botProgress, 4)}%` }}
              />
            </div>
          </div>
        )}
        <GameBoard
          board={localGame.board}
          boardSize={localGame.boardSize}
          disabled={isFinished || botThinking}
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
    (remoteGame.mode === "friend" || remoteGame.mode === "random") &&
    (isPlaying || isFinished)
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

      {isWaitingFriend && (
        <div className="game-page__waiting">
          <div className="game-page__waiting-loader" aria-hidden="true" />
          <p className="game-page__waiting-title">Ждём друга…</p>
          <p className="game-page__waiting-subtitle">
            Поделитесь ссылкой или кодом приглашения
          </p>
          {remoteGame.invite_code && (
            <InviteBox inviteCode={remoteGame.invite_code} />
          )}
        </div>
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
