// Minimal player identity shared by the login flow and player-specific screens.
export interface PlayerSession {
  id: number;
  username: string;
}

// API responses and saved browser data are untrusted until their shape is checked.
export function isPlayerSession(value: unknown): value is PlayerSession {
  return typeof value === 'object'
    && value !== null
    && 'id' in value
    && typeof value.id === 'number'
    && 'username' in value
    && typeof value.username === 'string';
}
