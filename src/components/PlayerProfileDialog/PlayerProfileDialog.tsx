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
  onConfirm: (profile: PlayerProfile) => void;
  onCancel: () => void;
};

export function PlayerProfileDialog({
  open,
  title,
  description,
  initialProfile = { name: "", age: null },
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
      key={`${initialProfile.name}-${initialProfile.age ?? ""}`}
      t={t}
      title={title ?? t.profileDialog.titleForFriend}
      description={description ?? t.profileDialog.descriptionDefault}
      initialProfile={initialProfile}
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
  onConfirm: (profile: PlayerProfile) => void;
  onCancel: () => void;
};

function PlayerProfileDialogForm({
  t,
  title,
  description,
  initialProfile,
  onConfirm,
  onCancel,
}: PlayerProfileDialogFormProps) {
  const titleId = useId();
  const [name, setName] = useState(initialProfile.name);
  const [ageInput, setAgeInput] = useState(
    initialProfile.age != null ? String(initialProfile.age) : "",
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t.profileDialog.errorNameRequired);
      return;
    }

    if (trimmedName.length > 32) {
      setError(t.profileDialog.errorNameTooLong);
      return;
    }

    let age: number | null = null;
    const trimmedAge = ageInput.trim();

    if (trimmedAge) {
      const parsedAge = Number(trimmedAge);
      if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
        setError(t.profileDialog.errorAgeRange);
        return;
      }
      age = parsedAge;
    }

    onConfirm({ name: trimmedName, age });
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
            <span className="player-profile-dialog__label">{t.profileDialog.nameLabel}</span>
            <input
              type="text"
              className="player-profile-dialog__input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t.profileDialog.namePlaceholder}
              maxLength={32}
              autoFocus
              autoComplete="nickname"
            />
          </label>

          <label className="player-profile-dialog__field">
            <span className="player-profile-dialog__label">
              {t.profileDialog.ageLabel}{" "}
              <span className="player-profile-dialog__optional">
                {t.profileDialog.ageOptional}
              </span>
            </span>
            <input
              type="number"
              className="player-profile-dialog__input"
              value={ageInput}
              onChange={(event) => setAgeInput(event.target.value)}
              placeholder={t.profileDialog.agePlaceholder}
              min={1}
              max={120}
              inputMode="numeric"
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
