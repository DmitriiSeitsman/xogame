import {
  getComputerMove,
  type ComputerMoveRequest,
} from "../services/computerPlayerService";

export type ComputerMoveWorkerRequest = {
  type: "compute";
  turnId: number;
  request: ComputerMoveRequest;
};

export type ComputerMoveWorkerResponse =
  | { type: "progress"; turnId: number; progress: number }
  | { type: "done"; turnId: number; index: number | null }
  | { type: "error"; turnId: number };

self.onmessage = (event: MessageEvent<ComputerMoveWorkerRequest>) => {
  if (event.data.type !== "compute") {
    return;
  }

  const { turnId, request } = event.data;

  try {
    const index = getComputerMove({
      ...request,
      onProgress: (progress) => {
        const message: ComputerMoveWorkerResponse = {
          type: "progress",
          turnId,
          progress,
        };
        self.postMessage(message);
      },
    });

    const doneMessage: ComputerMoveWorkerResponse = {
      type: "done",
      turnId,
      index,
    };
    self.postMessage(doneMessage);
  } catch {
    const errorMessage: ComputerMoveWorkerResponse = { type: "error", turnId };
    self.postMessage(errorMessage);
  }
};
