import "./FriendRematchDialog.css";

type FriendRematchDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  loading?: boolean;
  closeOnBackdrop?: boolean;
};

export function FriendRematchDialog({
  open,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  loading = false,
  closeOnBackdrop = false,
}: FriendRematchDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="friend-rematch-dialog" role="presentation">
      {closeOnBackdrop ? (
        <button
          type="button"
          className="friend-rematch-dialog__backdrop"
          aria-label="Закрыть"
          onClick={onSecondary}
          disabled={loading}
        />
      ) : (
        <div className="friend-rematch-dialog__backdrop" aria-hidden="true" />
      )}
      <div
        className="friend-rematch-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="friend-rematch-dialog-title"
      >
        <h2 id="friend-rematch-dialog-title" className="friend-rematch-dialog__title">
          {title}
        </h2>
        {description && (
          <p className="friend-rematch-dialog__description">{description}</p>
        )}

        <div className="friend-rematch-dialog__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onSecondary}
            disabled={loading}
          >
            {secondaryLabel}
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onPrimary}
            disabled={loading}
          >
            {loading ? "Загрузка…" : primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
