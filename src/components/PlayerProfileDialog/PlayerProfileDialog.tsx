import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { Dictionary } from "../../i18n/dictionaries/ru";
import { useI18n } from "../../i18n/useI18n";
import type { PlayerProfile } from "../../utils/playerProfile";
import "./PlayerProfileDialog.css";

type PlayerProfileDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  initialProfile?: PlayerProfile;
  /** What the player will be called if they leave the name blank
   * ("Игрок 1" when creating a game, "Игрок 2" when joining one). Shown
   * as the input's placeholder so the fallback is visible up front. */
  fallbackName?: string;
  onConfirm: (profile: PlayerProfile) => void;
  onCancel: () => void;
};

export function PlayerProfileDialog({
  open,
  title,
  description,
  initialProfile = { name: "" },
  fallbackName,
  onConfirm,
  onCancel,
}: PlayerProfileDialogProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <PlayerProfileDialogForm
      key={initialProfile.name}
      t={t}
      title={title ?? t.profileDialog.titleForFriend}
      description={description ?? t.profileDialog.descriptionDefault}
      initialProfile={initialProfile}
      fallbackName={fallbackName ?? t.common.player}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
    document.body,
  );
}

type PlayerProfileDialogFormProps = {
  t: Dictionary;
  title: string;
  description: string;
  initialProfile: PlayerProfile;
  fallbackName: string;
  onConfirm: (profile: PlayerProfile) => void;
  onCancel: () => void;
};

function PlayerProfileDialogForm({
  t,
  title,
  description,
  initialProfile,
  fallbackName,
  onConfirm,
  onCancel,
}: PlayerProfileDialogFormProps) {
  const titleId = useId();
  const [name, setName] = useState(initialProfile.name);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Blank is fine: the player is then shown as `fallbackName`.
    const trimmedName = name.trim();
    if (trimmedName.length > 32) {
      setError(t.profileDialog.errorNameTooLong);
      return;
    }

    onConfirm({ name: trimmedName });
  };

  return (
    <div className="player-profile-dialog" role="presentation">
      <button
        type="button"
        className="player-profile-dialog__backdrop"
        aria-label={t.common.close}
        onClick={onCancel}
      />
      <div
        className="player-profile-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="player-profile-dialog__title">
          {title}
        </h2>
        <p className="player-profile-dialog__description">{description}</p>

        <form className="player-profile-dialog__form" onSubmit={handleSubmit}>
          <label className="player-profile-dialog__field">
            <span className="player-profile-dialog__label">
              {t.profileDialog.nameLabel}{" "}
              <span className="player-profile-dialog__optional">
                {t.profileDialog.optional}
              </span>
            </span>
            <input
              type="text"
              className="player-profile-dialog__input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={fallbackName}
              maxLength={32}
              autoFocus
              autoComplete="nickname"
            />
          </label>

          {error && (
            <p className="player-profile-dialog__error" role="alert">
              {error}
            </p>
          )}

          <div className="player-profile-dialog__actions">
            <button type="button" className="btn btn--secondary" onClick={onCancel}>
              {t.common.cancel}
            </button>
            <button type="submit" className="btn btn--primary">
              {t.profileDialog.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
