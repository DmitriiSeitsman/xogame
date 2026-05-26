import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
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
  title = "Как вас представить другу?",
  description = "Укажите имя и, если хотите, возраст. Друг увидит эти данные во время игры.",
  initialProfile = { name: "", age: null },
  onConfirm,
  onCancel,
}: PlayerProfileDialogProps) {
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
      title={title}
      description={description}
      initialProfile={initialProfile}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
    document.body,
  );
}

type PlayerProfileDialogFormProps = {
  title: string;
  description: string;
  initialProfile: PlayerProfile;
  onConfirm: (profile: PlayerProfile) => void;
  onCancel: () => void;
};

function PlayerProfileDialogForm({
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
      setError("Введите имя");
      return;
    }

    if (trimmedName.length > 32) {
      setError("Имя слишком длинное (максимум 32 символа)");
      return;
    }

    let age: number | null = null;
    const trimmedAge = ageInput.trim();

    if (trimmedAge) {
      const parsedAge = Number(trimmedAge);
      if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
        setError("Возраст должен быть от 1 до 120");
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
        aria-label="Закрыть"
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
            <span className="player-profile-dialog__label">Имя</span>
            <input
              type="text"
              className="player-profile-dialog__input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Мария"
              maxLength={32}
              autoFocus
              autoComplete="nickname"
            />
          </label>

          <label className="player-profile-dialog__field">
            <span className="player-profile-dialog__label">
              Возраст{" "}
              <span className="player-profile-dialog__optional">(необязательно)</span>
            </span>
            <input
              type="number"
              className="player-profile-dialog__input"
              value={ageInput}
              onChange={(event) => setAgeInput(event.target.value)}
              placeholder="12"
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
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              Продолжить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
