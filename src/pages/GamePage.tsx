import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { GameBoard } from "../components/GameBoard/GameBoard";
import { GameLayout } from "../components/GameLayout/GameLayout";
import { GameStatus } from "../components/GameStatus/GameStatus";
import { FriendRematchDialog } from "../components/FriendRematchDialog/FriendRematchDialog";
import { GameChat } from "../components/GameChat/GameChat";
import { InviteBox } from "../components/InviteBox/InviteBox";
import { OpponentPresenceNotice } from "../components/OpponentPresenceNotice/OpponentPresenceNotice";
import { ConnectionOverlay } from "../components/ConnectionOverlay/ConnectionOverlay";
import { Seo } from "../components/Seo/Seo";
import { WinCelebration } from "../components/WinCelebration/WinCelebration";
import { LossConsolation } from "../components/LossConsolation/LossConsolation";
import { useCelebrationKey } from "../hooks/useCelebrationKey";
import { emitCelebration } from "../utils/celebrationBus";
import { useI18n } from "../i18n/useI18n";
import { getComputerMove } from "../services/computerPlayerService";
import type { ComputerMoveRequest } from "../services/computerPlayerService";
import {
  acceptFriendRematch,
  cancelRandomSearch,
  declineFriendRematch,
  getGameById,
  heartbeatRandomMatchmaking,
  leaveRandomMatchmaking,
  makeMove,
  offerFriendRematch,
  subscribeToGame,
} from "../services/gameService";
import type {
  ChatMessage,
  ConnectionState,
  GameRealtimeHandle,
  PresenceEvent,
} from "../services/gameService";
import type {
  BoardSize,
  Cell,
  ComputerDifficulty,
  Game,
  LocalGameState,
  PlayerSymbol,
} from "../types/game";
import type { SymbolTheme } from "../types/gameTheme";
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
  getComputerDifficultyLabel,
  loadComputerDifficulty,
  parseComputerDifficultyParam,
} from "../utils/computerDifficulty";
import type { ComputerMoveWorkerResponse } from "../workers/computerMove.worker";
import { getOpponentProfileLabel } from "../utils/opponent";
import { formatPlayerProfile } from "../utils/playerProfile";
import { getOrCreatePlayerToken } from "../utils/playerToken";
import {
  getHostProfileLabel,
  isFriendGameGuest,
  isFriendGameHost,
} from "../utils/rematch";
import { getSavedSymbolTheme } from "../utils/symbolTheme";
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
  const { t, lang, path: localePath } = useI18n();
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
  const [localSymbolTheme] = useState<SymbolTheme>(() => getSavedSymbolTheme());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [opponentOnline, setOpponentOnline] = useState<boolean | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("open");
  const realtimeHandleRef = useRef<GameRealtimeHandle | null>(null);

  const playerToken = useMemo(() => getOrCreatePlayerToken(), []);

  // Effects below use the dictionary only for error fallbacks. Reading it
  // through a ref keeps it out of their dependency lists, so switching
  // language mid-game doesn't tear down the WebSocket subscription (which
  // would also wipe the chat history and refetch the game for nothing).
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const boardSymbolTheme = useMemo((): SymbolTheme => {
    if (isLocal) {
      return localSymbolTheme;
    }

    if (remoteGame?.symbol_theme) {
      return remoteGame.symbol_theme;
    }

    return localSymbolTheme;
  }, [isLocal, localSymbolTheme, remoteGame?.symbol_theme]);
  /**
   * The finished game's result from *this player's* point of view. The
   * previous version only asked whether somebody had won, so the confetti
   * fired at the loser too — applauding the player who had just been beaten.
   */
  const finishedResult = isLocal
    ? localGame.status === "finished"
      ? { winner: localGame.winner, mySymbol: "X" as PlayerSymbol }
      : null
    : remoteGame?.status === "finished"
      ? {
          winner: remoteGame.winner,
          mySymbol: getPlayerSymbol(remoteGame, playerToken),
        }
      : null;

  const outcome: "win" | "loss" | "draw" | null = !finishedResult
    ? null
    : finishedResult.winner == null || finishedResult.winner === "draw"
      ? "draw"
      : finishedResult.winner === finishedResult.mySymbol
        ? "win"
        : "loss";

  const winKey = useCelebrationKey(outcome === "win");
  const lossKey = useCelebrationKey(outcome === "loss");

  useEffect(() => {
    if (winKey !== null) {
      emitCelebration("win");
    }
  }, [winKey]);

  useEffect(() => {
    if (lossKey !== null) {
      emitCelebration("loss");
    }
  }, [lossKey]);

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
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    gameIdRef.current = gameId;
    playerTokenRef.current = playerToken;
  }, [gameId, playerToken]);

  // The floating chat toggle sits at the same bottom-left corner as the
  // site footer; on short mobile screens the footer (in normal flow) can
  // end up right underneath it. Hiding the footer while the chat button is
  // showing (CSS gates this to narrow widths — see AppLayout.css) avoids
  // the two ever overlapping.
  const chatVisible =
    !isLocal &&
    (remoteGameStatus === "playing" || remoteGameStatus === "finished");

  useEffect(() => {
    document.body.classList.toggle("has-floating-chat", chatVisible);
    return () => {
      document.body.classList.remove("has-floating-chat");
    };
  }, [chatVisible]);

  useEffect(() => {
    if (isLocal || !gameId) {
      return;
    }

    let cancelled = false;
    setChatMessages([]);
    setOpponentOnline(null);
    setConnectionState("open");

    const load = async () => {
      try {
        const game = await getGameById(gameId);
        if (cancelled) return;

        setRemoteGame(game);
        setLoading(false);

        const handle = subscribeToGame({
          gameId,
          onUpdate: (updatedGame) => {
            setRemoteGame(updatedGame);
            // Matchmaking clears the waiting player's queue row the moment a
            // pair is made, so their last heartbeat can fail right as the
            // game starts. That error must not follow them onto the board.
            if (updatedGame.status !== "waiting") {
              setError(null);
            }
          },
          onChatMessage: (chatMessage) => {
            setChatMessages((prev) => [...prev, chatMessage]);
          },
          onPresenceChange: (presence: PresenceEvent) => {
            setOpponentOnline(presence.online);
          },
          onConnectionStateChange: (state) => {
            setConnectionState(state);
          },
          onReconnected: () => {
            // Realtime is best-effort — resync via REST in case a move or
            // chat message was missed while our own socket was down.
            void getGameById(gameId)
              .then((freshGame) => {
                if (!cancelled) setRemoteGame(freshGame);
              })
              .catch(() => undefined);
          },
        });
        realtimeHandleRef.current = handle;
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : tRef.current.game.notFound);
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      realtimeHandleRef.current?.close();
      realtimeHandleRef.current = null;
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
            err instanceof Error
              ? err.message
              : tRef.current.game.errorSearchInterrupted,
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
      setError(err instanceof Error ? err.message : t.game.errorMoveFailed);
    } finally {
      setActionLoading(false);
    }
  };

  const handleHostRematchYes = async () => {
    if (!gameId || !remoteGame) return;

    setActionLoading(true);
    setError(null);

    try {
      const game = await offerFriendRematch({ playerToken, gameId });
      setRemoteGame(game);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.game.errorRematchOffer,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleHostRematchNo = async () => {
    if (!gameId) {
      navigate(localePath("/"));
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await declineFriendRematch({ playerToken, gameId });
    } catch {
      // Still leave the finished game
    } finally {
      setActionLoading(false);
      navigate(localePath("/"));
    }
  };

  const handleGuestRematchAccept = async () => {
    if (!gameId || !remoteGame) return;

    setActionLoading(true);
    setError(null);

    try {
      const game = await acceptFriendRematch({ playerToken, gameId });
      setRemoteGame(game);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.game.errorRematchStart,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleGuestRematchDecline = async () => {
    if (!gameId) {
      navigate(localePath("/"));
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await declineFriendRematch({ playerToken, gameId });
    } catch {
      // Still leave
    } finally {
      setActionLoading(false);
      navigate(localePath("/"));
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
      navigate(localePath("/"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.game.errorCancelSearch);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestartLocal = () => {
    setLocalGame(createLocalGame(localGame.boardSize, localGame.difficulty));
  };

  const handleSendChatMessage = (text: string) => {
    realtimeHandleRef.current?.sendChatMessage(text);
  };

  const handleLeaveGame = () => {
    navigate(localePath("/"));
  };

  if (loading) {
    return (
      <GameLayout>
        <Seo
          title={`${t.game.heading} — ${t.home.heading}`}
          description={t.home.subtitle}
          language={lang}
          noIndex
        />
        <GameStatus title={t.game.loading} variant="muted" showLoader />
      </GameLayout>
    );
  }

  if (error && !remoteGame && !isLocal) {
    return (
      <GameLayout>
        <Seo
          title={`${t.game.heading} — ${t.home.heading}`}
          description={t.home.subtitle}
          language={lang}
          noIndex
        />
        <GameStatus title={t.common.error} subtitle={error} variant="warning" />
        <Link to={localePath("/")} className="btn btn--primary">
          {t.common.goHome}
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
      ? t.game.botThinking
      : isFinished
        ? getWinnerMessage(t, localGame.winner, "X")
        : getTurnMessage(t, localGame.currentTurn, "X", false);

    // The headline talks about the player ("Вы победили" / "Вы проиграли"),
    // so the mark beside it is the player's own. Showing the winner's mark
    // meant a loss displayed the opponent's symbol next to "you lost".
    const statusSymbol: PlayerSymbol | null =
      isFinished && outcome === "draw" ? null : "X";

    return (
      <GameLayout>
        <Seo
          title={`${t.game.computerGame} — ${t.home.heading}`}
          description={t.home.subtitle}
          language={lang}
          noIndex
        />
        <GameStatus
          title={statusTitle || t.game.computerGame}
          subtitle={
            botThinking
              ? botProgress > 0
                ? t.game.botProgress(botProgress)
                : t.game.botPreparing
              : t.game.localSubtitle(
                  localGame.boardSize,
                  localGame.winLength,
                  getComputerDifficultyLabel(t, localGame.difficulty),
                )
          }
          variant={
            isFinished
              ? outcome === "win"
                ? "success"
                : "muted"
              : botThinking
                ? "muted"
                : "default"
          }
          symbol={botThinking ? "O" : statusSymbol}
          symbolTheme={boardSymbolTheme}
          showLoader={botThinking}
        />
        {winKey !== null && <WinCelebration key={winKey} />}
        {lossKey !== null && <LossConsolation key={lossKey} />}
        {botThinking && (
          <div
            className="game-page__bot-thinking"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={botProgress}
            aria-label={t.game.botThinking}
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
          symbolTheme={boardSymbolTheme}
          onCellClick={handleLocalMove}
        />
        {isFinished && (
          <div className="game-page__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleRestartLocal}
            >
              {t.game.playAgain}
            </button>
            <Link to={localePath("/")} className="btn btn--secondary">
              {t.common.goHome}
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
          title={`${t.game.heading} — ${t.home.heading}`}
          description={t.home.subtitle}
          language={lang}
          noIndex
        />
        <GameStatus title={t.game.notFound} variant="warning" />
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

  let statusTitle: string = t.game.heading;
  let statusSubtitle: string | undefined;
  let statusVariant: "default" | "success" | "warning" | "muted" = "default";
  let statusSymbol: PlayerSymbol | null = null;
  let showLoader = false;

  if (isWaitingFriend) {
    statusTitle = t.game.waitingFriendTitle;
    statusSubtitle = t.game.waitingFriendSubtitle;
    statusVariant = "muted";
    showLoader = true;
  } else if (isWaitingRandom) {
    statusTitle = t.game.waitingRandomTitle;
    statusSubtitle = t.game.boardSubtitle(remoteGame.board_size);
    statusVariant = "muted";
    showLoader = true;
  } else if (isFinished) {
    statusTitle = getWinnerMessage(t, remoteGame.winner, playerSymbol);
    statusSubtitle =
      remoteGame.winner === "draw"
        ? t.game.draw
        : remoteGame.winner
          ? t.game.winnerIs(remoteGame.winner)
          : undefined;
    // Same rule as the local board: the player's own mark, and a colour that
    // reflects their result rather than always reading as success.
    statusVariant = outcome === "win" ? "success" : "muted";
    statusSymbol = outcome === "draw" ? null : playerSymbol;
  } else if (isPlaying) {
    statusTitle = getTurnMessage(
      t,
      remoteGame.current_turn,
      playerSymbol,
      false,
    );
    statusSubtitle = t.game.boardWinSubtitle(
      remoteGame.board_size,
      remoteGame.win_length,
    );
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
      ? getOpponentProfileLabel(t, remoteGame, playerToken)
      : null;

  const myChatLabel =
    playerSymbol === "X"
      ? formatPlayerProfile(
          t,
          remoteGame.player_x_name ?? "",
          remoteGame.player_x_age,
        )
      : playerSymbol === "O"
        ? formatPlayerProfile(
            t,
            remoteGame.player_o_name ?? "",
            remoteGame.player_o_age,
          )
        : "";

  // Presence only matters once there's an actual opponent to lose — a
  // friend game still waiting for a second player, or one that's already
  // finished, has nothing meaningful to show here.
  const showPresenceNotice =
    isPlaying && remoteGame.player_o_token != null;

  const boardDisabled =
    !isPlaying ||
    actionLoading ||
    playerSymbol !== remoteGame.current_turn;

  const isFriendFinished =
    remoteGame.mode === "friend" &&
    isFinished &&
    remoteGame.player_o_token != null;

  const isHost = isFriendGameHost(remoteGame, playerToken);
  const isGuest = isFriendGameGuest(remoteGame, playerToken);
  const hostProfileLabel = getHostProfileLabel(t, remoteGame);

  const showHostRematchDialog =
    isFriendFinished && isHost && remoteGame.rematch_status == null;

  const showGuestRematchDialog =
    isFriendFinished && isGuest && remoteGame.rematch_status === "offered";

  const showRematchWaiting =
    isFriendFinished && isHost && remoteGame.rematch_status === "offered";

  const showRematchDeclined =
    isFriendFinished && remoteGame.rematch_status === "declined";

  return (
    <GameLayout
      contentClassName={chatOpen ? "game-content--chat-open" : undefined}
    >
      <Seo
        title={`${t.game.heading} — ${t.home.heading}`}
        description={t.home.subtitle}
        language={lang}
        noIndex
      />
      <GameStatus
        title={statusTitle}
        subtitle={statusSubtitle}
        variant={statusVariant}
        symbol={statusSymbol}
        symbolTheme={boardSymbolTheme}
        showLoader={showLoader}
      />
      {winKey !== null && <WinCelebration key={winKey} />}
      {lossKey !== null && <LossConsolation key={lossKey} />}
      <ConnectionOverlay visible={connectionState !== "open"} />
      {showPresenceNotice && (
        <OpponentPresenceNotice
          online={opponentOnline}
          opponentLabel={opponentLabel}
          onLeave={handleLeaveGame}
        />
      )}

      {opponentLabel && (
        <p className="game-page__opponent">
          {t.game.opponentPrefix} <span>{opponentLabel}</span>
        </p>
      )}

      {isWaitingFriend && (
        <div className="game-page__waiting">
          <div className="game-page__waiting-loader" aria-hidden="true" />
          <p className="game-page__waiting-title">
            {t.game.waitingFriendTitle}
          </p>
          <p className="game-page__waiting-subtitle">
            {t.game.waitingFriendSubtitle}
          </p>
          {remoteGame.invite_code && (
            <InviteBox inviteCode={remoteGame.invite_code} />
          )}
        </div>
      )}

      {isWaitingRandom && (
        <div className="game-page__waiting">
          <div className="game-page__waiting-loader" aria-hidden="true" />
          <p className="game-page__waiting-title">
            {t.game.waitingRandomTitle}
          </p>
          <p className="game-page__waiting-subtitle">
            {t.game.boardSubtitle(remoteGame.board_size)}
          </p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleCancelSearch}
            disabled={actionLoading}
          >
            {t.game.cancelSearch}
          </button>
        </div>
      )}

      {(isPlaying || isFinished) && (
        <GameBoard
          board={remoteGame.board as Cell[]}
          boardSize={remoteGame.board_size}
          disabled={boardDisabled || isFinished}
          winningCells={winningCells}
          symbolTheme={boardSymbolTheme}
          onCellClick={handleRemoteMove}
        />
      )}

      {error && <p className="game-page__error">{error}</p>}

      {(isPlaying || isFinished) && (
        <GameChat
          messages={chatMessages}
          myToken={playerToken}
          myLabel={myChatLabel}
          opponentLabel={opponentLabel}
          onSend={handleSendChatMessage}
          onOpenChange={setChatOpen}
        />
      )}

      <FriendRematchDialog
        open={showHostRematchDialog}
        title={t.rematch.hostTitle}
        primaryLabel={t.rematch.yes}
        secondaryLabel={t.rematch.no}
        onPrimary={() => void handleHostRematchYes()}
        onSecondary={() => void handleHostRematchNo()}
        loading={actionLoading}
      />

      <FriendRematchDialog
        open={showGuestRematchDialog}
        title={t.rematch.guestTitle(hostProfileLabel)}
        primaryLabel={t.rematch.play}
        secondaryLabel={t.common.cancel}
        onPrimary={() => void handleGuestRematchAccept()}
        onSecondary={() => void handleGuestRematchDecline()}
        loading={actionLoading}
      />

      {isFinished &&
        !(showHostRematchDialog || showGuestRematchDialog) && (
          <div className="game-page__actions">
            {showRematchWaiting && (
              <p className="game-page__rematch-hint" role="status">
                {t.rematch.waitingForFriend}
              </p>
            )}
            {showRematchDeclined && (
              <p className="game-page__rematch-hint" role="status">
                {isHost ? t.rematch.declinedByFriend : t.rematch.declined}
              </p>
            )}
            <Link to={localePath("/")} className="btn btn--primary">
              {t.common.goHome}
            </Link>
          </div>
        )}
    </GameLayout>
  );
}
