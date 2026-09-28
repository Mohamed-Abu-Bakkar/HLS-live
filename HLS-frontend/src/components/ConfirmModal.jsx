import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, hotelTitle, onConfirm, onCancel, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          <AlertTriangle color="var(--danger)" size={24} />
          <span>Confirm Hotel Deletion</span>
        </div>

        <p className="modal-desc">
          Are you sure you want to permanently delete <strong>&ldquo;{hotelTitle}&rdquo;</strong>?
          This action will remove the record from the database and delete any associated images from the server.
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Yes, Delete Hotel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SuccessToast = ({ show, message, onClose }) => {
  if (!show) return null;

  return (
    <div className="toast-popup" role="status" aria-live="polite">
      <CheckCircle size={20} color="var(--success)" />
      <span style={{ fontWeight: 500, fontSize: '0.925rem' }}>{message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};
