/**
 * Copy to clipboard with a fallback.
 *
 * navigator.clipboard is undefined outside a secure context — plain http on a
 * LAN address, which is exactly how people test on a phone. A copy button that
 * silently does nothing is a catastrophic failure for a prompt library, so
 * this falls back to execCommand and finally reports failure to the caller
 * rather than swallowing it.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
