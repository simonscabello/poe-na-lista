const DEFAULT_AUTH_REDIRECT = "/dashboard"

export function resolveAuthRedirectUrl(
  callbackUrl?: string,
  fallback = DEFAULT_AUTH_REDIRECT,
): string {
  if (!callbackUrl) {
    return fallback
  }

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return fallback
  }

  return callbackUrl
}
