import PartySocket from "partysocket";
import { PARTY_NAME } from "../../shared/protocol";
import type { ClientMessage, ServerMessage } from "../../shared/protocol";

const HOST: string =
  (import.meta.env.VITE_REALTIME_HOST as string | undefined) ?? "localhost:8790";

export type ConnStatus = "connecting" | "open" | "reconnecting";

export interface ConnectionHandlers {
  /** Built fresh on every (re)connect so profile edits are picked up. */
  hello: () => ClientMessage;
  onStatus: (status: ConnStatus) => void;
  onMessage: (msg: ServerMessage) => void;
}

export interface Connection {
  send: (msg: ClientMessage) => boolean;
  /** Re-announce ourselves (after a profile edit). */
  rehello: () => void;
  close: () => void;
}

/**
 * One room = one PartySocket. PartySocket reconnects on its own; this wrapper
 * adds the `hello` handshake on every open and a wake-up check for phones
 * coming back from a locked screen, where a socket can look open but be dead.
 */
export function openConnection(code: string, h: ConnectionHandlers): Connection {
  let closed = false;
  let everOpen = false;
  let lastMessageAt = 0;
  let probe: ReturnType<typeof setTimeout> | null = null;

  const socket = new PartySocket({ host: HOST, party: PARTY_NAME, room: code });

  const raw = (msg: ClientMessage): boolean => {
    if (socket.readyState !== WebSocket.OPEN) return false;
    try {
      socket.send(JSON.stringify(msg));
      return true;
    } catch {
      return false;
    }
  };

  const onOpen = () => {
    if (closed) return;
    everOpen = true;
    h.onStatus("open");
    raw(h.hello());
  };

  const onClose = () => {
    if (closed) return;
    h.onStatus(everOpen ? "reconnecting" : "connecting");
  };

  const onMessage = (e: MessageEvent) => {
    if (closed) return;
    lastMessageAt = Date.now();
    let msg: ServerMessage;
    try {
      msg = JSON.parse(String(e.data)) as ServerMessage;
    } catch {
      return;
    }
    if (!msg || typeof msg !== "object" || typeof msg.type !== "string") return;
    h.onMessage(msg);
  };

  /** Called when the tab becomes visible again or the network returns. */
  const wake = () => {
    if (closed) return;
    if (socket.readyState !== WebSocket.OPEN) {
      if (socket.readyState !== WebSocket.CONNECTING) socket.reconnect();
      return;
    }
    // Looks open: ask for a fresh state, and if nothing answers, force a reconnect.
    const askedAt = Date.now();
    raw(h.hello());
    if (probe) clearTimeout(probe);
    probe = setTimeout(() => {
      if (closed) return;
      if (lastMessageAt < askedAt) {
        h.onStatus("reconnecting");
        socket.reconnect();
      }
    }, 4000);
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible") wake();
  };

  socket.addEventListener("open", onOpen);
  socket.addEventListener("close", onClose);
  socket.addEventListener("error", onClose);
  socket.addEventListener("message", onMessage);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("online", wake);
  window.addEventListener("pageshow", wake);

  return {
    send: raw,
    rehello: () => {
      raw(h.hello());
    },
    close: () => {
      closed = true;
      if (probe) clearTimeout(probe);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", wake);
      window.removeEventListener("pageshow", wake);
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("close", onClose);
      socket.removeEventListener("error", onClose);
      socket.removeEventListener("message", onMessage);
      socket.close();
    },
  };
}
