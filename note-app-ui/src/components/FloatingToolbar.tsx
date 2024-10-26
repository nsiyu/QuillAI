import { FiMessageSquare, FiEdit2 } from 'react-icons/fi';

type FloatingToolbarProps = {
  position: { x: number; y: number } | null;
  onAskAI: () => void;
  onEdit: () => void;
};

export function FloatingToolbar({ position, onAskAI, onEdit }: FloatingToolbarProps) {
  if (!position) return null;

  return (
    <div
      className="fixed z-[9999] flex gap-2 p-2 bg-white shadow-xl border border-maya/20 rounded-lg"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(-50%, -150%)',
      }}
    >
      <button
        onClick={onAskAI}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-maya rounded-md hover:bg-maya/90 transition-all"
      >
        <FiMessageSquare size={16} />
        Ask AI
      </button>
      <button
        onClick={onEdit}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-pink rounded-md hover:bg-pink/90 transition-all"
      >
        <FiEdit2 size={16} />
        Edit
      </button>
    </div>
  );
}
