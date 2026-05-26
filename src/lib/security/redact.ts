const REDACTED = "[REDACTED]";

export function redactSecret(value: string | null | undefined): string {
  if (!value) {
    return REDACTED;
  }

  if (value.length <= 8) {
    return REDACTED;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
