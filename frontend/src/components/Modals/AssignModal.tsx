import React from "react";
import { Ticket } from "../../types";

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white rounded p-6 shadow w-96">
        <h2 className="text-lg font-bold mb-4">Assign Ticket</h2>
        <p>
          Assign ticket <strong>#{ticket?.id}</strong> to a user:
        </p>
        <input
          type="text"
          placeholder="User ID"
          className="w-full border rounded px-2 py-1 mt-3"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-2 border rounded bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 border rounded bg-blue-600 text-white"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignModal;
