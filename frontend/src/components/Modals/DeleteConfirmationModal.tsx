import React from "react";
import Button from "../ui/Button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dataName?: string; // nom de l'objet à afficher dans le message
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  dataName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5">
      <div className="w-full max-w-lg rounded-lg bg-white px-8 py-12 text-center dark:bg-gray-800">
        <h2 className="mb-6 text-2xl font-bold text-black dark:text-white">
          Confirm Deletion
        </h2>
        <p className="mb-10 text-gray-600 dark:text-gray-300">
          Are you sure you want to delete {dataName || "this item"}? This
          action cannot be undone.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
          variant="danger"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
