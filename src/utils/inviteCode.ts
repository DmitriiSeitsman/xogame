import type { Dictionary } from "../i18n/dictionaries/ru";
import { localizePath, type Language } from "../i18n/language";

/** Invite links keep the sharer's language, so the friend who opens them
 * lands on a page they can read (and on the URL that language is indexed
 * under). */
export function buildInviteLink(
  inviteCode: string,
  language: Language = "ru",
): string {
  return `${window.location.origin}${localizePath(`/join/${inviteCode}`, language)}`;
}

export async function copyInviteLink(
  inviteCode: string,
  language: Language = "ru",
): Promise<void> {
  await navigator.clipboard.writeText(buildInviteLink(inviteCode, language));
}

export async function shareInviteLink(
  t: Dictionary,
  inviteCode: string,
  language: Language = "ru",
): Promise<void> {
  const url = buildInviteLink(inviteCode, language);

  if (navigator.share) {
    await navigator.share({
      title: t.invite.shareTitle,
      text: t.invite.shareText,
      url,
    });
    return;
  }

  await copyInviteLink(inviteCode, language);
}

export async function copyInviteCode(inviteCode: string): Promise<void> {
  await navigator.clipboard.writeText(inviteCode);
}
