import { useTextAnimation } from '../hooks/useTextAnimation';
import { FiUser } from 'react-icons/fi';

interface ChatMessageProps {
  role: 'user' | 'ai';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const displayText = useTextAnimation({
    originalText: '',
    newText: content,
    speed: 30
  });

  return (
    <div
      className={`p-4 rounded-lg ${
        role === 'user'
          ? 'bg-maya/10 ml-8'
          : 'bg-white/50 mr-8'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {role === 'user' ? (
          <FiUser className="text-maya" />
        ) : (
          <svg className="w-5 h-5 text-pink" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.71 7.04c.39-.39.39-1.04 0-1.43l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z" />
          </svg>
        )}
        <span className="text-sm font-medium">
          {role === 'user' ? 'You' : 'NeuroPen AI'}
        </span>
      </div>
      {displayText}
    </div>
  );
}
