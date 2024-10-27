type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onSubmit: (suggestion: string) => void;
};

export function EditModal({
  isOpen,
  onClose,
  selectedText,
  onSubmit,
}: EditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-jet/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h3 className="text-xl font-semibold text-jet mb-4">Suggest Edit</h3>

        <div className="mb-4 p-3 bg-maya/5 rounded-lg">
          <p className="text-sm text-jet/70 mb-2">Selected text:</p>
          <p className="text-jet">{selectedText}</p>
        </div>

        <textarea
          className="w-full h-32 p-3 bg-white/50 border border-maya/20 rounded-lg focus:outline-none focus:border-maya resize-none"
          placeholder="Type your suggested edit..."
          autoFocus
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-jet/70 hover:text-jet transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const textarea = document.querySelector("textarea");
              if (textarea) onSubmit(textarea.value);
              onClose();
            }}
            className="px-4 py-2 bg-maya text-white rounded-lg hover:bg-maya/90 transition-all"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
