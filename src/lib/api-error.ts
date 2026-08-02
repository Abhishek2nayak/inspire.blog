/**
 * Turn a failed fetch Response into a message worth showing.
 *
 * WHY: calling `res.json()` on an error response throws when the body is not
 * JSON — which is exactly what a 500, a proxy timeout or an auth redirect
 * returns. The throw then lands in a generic catch and the user sees
 * "Couldn't save" with no indication of what happened, so diagnosing it means
 * digging through server logs.
 *
 * Reads the body as text once, tries JSON, and always includes the status so
 * the failure class (401 vs 413 vs 500) is visible from the UI alone.
 */
export async function describeApiError(res: Response): Promise<string> {
  let body = "";
  try {
    body = await res.text();
  } catch {
    /* body already consumed or connection dropped */
  }

  let message = "";
  if (body) {
    try {
      const parsed = JSON.parse(body) as { error?: string; message?: string };
      message = parsed.error ?? parsed.message ?? "";
    } catch {
      // Not JSON — an HTML error page or a proxy response. Show a short,
      // tag-stripped excerpt rather than dumping markup into a toast.
      message = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
    }
  }

  const known: Record<number, string> = {
    401: "Your session expired. Sign in again.",
    403: "You don't have permission to do that.",
    404: "Not found — it may have been deleted.",
    413: "That upload is too large.",
    429: "Too many requests. Wait a moment and retry.",
    502: "The server didn't respond. Try again.",
    504: "The request timed out — usually a slow database connection.",
  };

  return message || known[res.status] || `Request failed (HTTP ${res.status}).`;
}
