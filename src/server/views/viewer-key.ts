import { createHmac } from "node:crypto";

/**
 * Compute a daily-rotating HMAC key for a viewer.
 *
 * The key = VIEW_HASH_SECRET + UTC date string so keys are unlinkable across
 * days. Message = userId for signed-in viewers, ip+ua for anonymous ones.
 * Raw ip/ua/userId is NEVER stored.
 */
export function computeViewerKey(
    secret: string,
    message: string,
    utcDate: string, // "YYYY-MM-DD"
): string {
    return createHmac("sha256", secret + utcDate)
        .update(message)
        .digest("hex");
}
