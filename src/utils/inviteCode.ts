export function buildInviteLink(inviteCode: string): string {
  return `${window.location.origin}/join/${inviteCode}`;
}

export async function copyInviteLink(inviteCode: string): Promise<void> {
  await navigator.clipboard.writeText(buildInviteLink(inviteCode));
}

export async function shareInviteLink(inviteCode: string): Promise<void> {
  const url = buildInviteLink(inviteCode);

  if (navigator.share) {
    await navigator.share({
      title: "Крестики-нолики",
      text: "Присоединяйся к игре!",
      url,
    });
    return;
  }

  await copyInviteLink(inviteCode);
}

export async function copyInviteCode(inviteCode: string): Promise<void> {
  await navigator.clipboard.writeText(inviteCode);
}
