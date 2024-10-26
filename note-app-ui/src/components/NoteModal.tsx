import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export function NoteModal({ isOpen, onClose, onSubmit }: NoteModalProps) {
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-jet/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-jet">Create New Note</h2>
          <button onClick={onClose} className="text-jet/50 hover:text-jet">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(title);
          setTitle('');
          onClose();
        }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="w-full px-4 py-2 border border-maya/20 rounded-lg focus:outline-none focus:border-maya"
            autoFocus
          />
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-jet/70 hover:text-jet"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-maya text-white rounded-lg hover:bg-maya/90"
              disabled={!title.trim()}
            >
              Create Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
