import getCaretCoordinates from "textarea-caret";
import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiMenu, FiSearch, FiLogOut, FiUser, FiMic, FiMicOff, FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FloatingToolbar } from './FloatingToolbar';
import { EditModal } from './EditModal';
import { useDeepgram } from '../hooks/useDeepgram';
import { useLectureProcessor } from '../hooks/useLectureProcessor';
import { noteService, Note } from '../services/notes';
import { NoteModal } from './NoteModal';
import { useDebounce } from '../hooks/useDebounce';
import { useHumeAI } from '../hooks/useHumeAI';
import { authService } from '../services/auth';
import { ChatMessage } from './ChatMessage';
import { AnimatedNoteContent } from './AnimatedNoteContent';

function Home() {
  const navigate = useNavigate();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [selectedText, setSelectedText] = useState("");
  const [toolbarPosition, setToolbarPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null); // Reference to the scrollable container

  const handleNoteUpdate = useCallback(async (updatedNote: Note) => {
    try {
      const updated = await noteService.updateNote(updatedNote.id, updatedNote);
      setSelectedNote(updated);
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === updated.id ? updated : note))
      );
    } catch (error) {
      console.error("Error updating note:", error);
    }
  }, []);

  const handleProcessedText = useCallback(
    (processedText: string) => {
      if (selectedNote) {
        const updatedNote = {
          ...selectedNote,
          content: selectedNote.content + "\n\n" + processedText,
        };
        handleNoteUpdate(updatedNote);
      }
    },
    [selectedNote, handleNoteUpdate]
  );

  const { isProcessing, addTranscript } = useLectureProcessor({
    onProcessedText: handleProcessedText,
    selectedNote,
  });

  const { isRecording, startRecording, stopRecording } = useDeepgram({
    onTranscriptReceived: (transcript) => {
      if (selectedNote) {
        addTranscript(transcript);
      }
    },
  });

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleRecording = async () => {
    try {
      setRecordingError(null);
      if (isRecording) {
        stopRecording();
      } else {
        await startRecording();
      }
    } catch (error) {
      console.error("Recording error:", error);
      setRecordingError(
        "Failed to access microphone. Please check your permissions."
      );
    }
  };

  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Welcome to NeuroPen",
      content: "Start writing your thoughts...",
      user_id: "",
      created_at: "",
      updated_at: "",
    },
  ]);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const fetchedNotes = await noteService.getNotes();
        setNotes(fetchedNotes || []);
      } catch (error) {
        console.error("Error loading notes:", error);
      }
    };

    loadNotes();
  }, []);

  const handleCreateNote = async (title: string) => {
    try {
      const newNote = await noteService.createNote(title, "");
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setIsNoteModalOpen(false);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const debouncedNoteUpdate = useDebounce(async (updatedNote: Note) => {
    try {
      await noteService.updateNote(updatedNote.id, updatedNote);
      setNotes(
        notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
    } catch (error) {
      console.error("Error updating note:", error);
    }
  }, 500);

  const handleNoteContentChange = (updatedNote: Note) => {
    setSelectedNote(updatedNote);
    debouncedNoteUpdate(updatedNote);
  };

  const setToolbarPositionSafe = (x: number, y: number) => {
    const toolbarWidth = 200; // Approximate width of the toolbar
    const toolbarHeight = 50; // Approximate height of the toolbar
    const padding = 10; // Padding from the edges

    const containerWidth =
      mainContentRef.current?.clientWidth || window.innerWidth;
    const containerHeight =
      mainContentRef.current?.clientHeight || window.innerHeight;

    let safeX = x;
    let safeY = y;

    // Ensure the toolbar doesn't go off the right or left edge
    if (x + toolbarWidth / 2 > containerWidth - padding) {
      safeX = containerWidth - toolbarWidth / 2 - padding;
    } else if (x - toolbarWidth / 2 < padding) {
      safeX = toolbarWidth / 2 + padding;
    }

    // Ensure the toolbar doesn't go above or below the container
    if (y - toolbarHeight - padding < 0) {
      safeY = y + toolbarHeight + padding;
    } else if (y + toolbarHeight + padding > containerHeight) {
      safeY = containerHeight - toolbarHeight - padding;
    }

    setToolbarPosition({
      x: safeX,
      y: safeY,
    });
  };

  // Type guard to check if the event is a MouseEvent
  const isMouseEvent = (
    event:
      | React.MouseEvent<HTMLTextAreaElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ): event is React.MouseEvent<HTMLTextAreaElement> => {
    return (
      (event as React.MouseEvent<HTMLTextAreaElement>).clientY !== undefined
    );
  };

  const handleTextSelection = (
    event:
      | React.MouseEvent<HTMLTextAreaElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    const textarea = event.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;

    // Clear toolbar if there's no selection
    if (
      selectionStart === null ||
      selectionEnd === null ||
      selectionStart === selectionEnd
    ) {
      setToolbarPosition(null);
      setSelectedText("");
      return;
    }

    const selected = value.substring(selectionStart, selectionEnd).trim();
    if (selected) {
      setSelectedText(selected);

      // Get the caret coordinates at the end of the selection
      const coordinates = getCaretCoordinates(textarea, selectionEnd);
      const { top, left } = coordinates;

      // Get bounding rectangles
      const textareaRect = textarea.getBoundingClientRect();
      const containerRect = mainContentRef.current?.getBoundingClientRect();

      if (containerRect) {
        // Calculate X position as before
        const x = textareaRect.left - containerRect.left + left;

        let y: number;

        if (isMouseEvent(event)) {
          // For MouseEvent, use clientY
          y = event.clientY - containerRect.top - 40; // Adjust Y as needed
        } else {
          // For KeyboardEvent, fallback to caret coordinates
          y = textareaRect.top - containerRect.top + top - 40; // Adjust Y to position the toolbar above the selection
        }

        // Optional: Prevent toolbar from going above the container
        y = Math.max(y, 0);

        setToolbarPositionSafe(x, y);
      }
    } else {
      setToolbarPosition(null);
    }
  };

  const {
    isListening,
    error: humeError,
    startListening,
    stopListening,
  } = useHumeAI({
    onTranscriptReceived: (transcript) => {
      setChatMessages([...chatMessages, { role: "user", content: transcript }]);
    },
    onAudioReceived: (audioBlob) => {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    },
    onAIResponse: (response) => {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { role: "ai", content: response },
      ]);
    },
  });

  const renderChatInput = () => {
    // Implement your chat input component here
    return (
      <div className="p-4 border-t border-maya/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Handle sending the chat message
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 border border-maya/20 rounded-lg focus:outline-none focus:border-maya"
          />
          <button
            type="submit"
            className="p-2 bg-maya text-white rounded-lg hover:bg-maya/90"
          >
            <FiSend size={20} />
          </button>
        </form>
      </div>
    );
  };

  const renderMainContent = () => {
    if (!selectedNote) {
      return (
        <div className="h-full flex items-center justify-center text-jet/50">
          <p>Select a note or create a new one</p>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto relative">
        <div
          className={`transition-all duration-300 ${isChatOpen ? "mr-80" : ""}`}
        >
          <input
            type="text"
            value={selectedNote.title}
            onChange={(e) =>
              handleNoteUpdate({
                ...selectedNote,
                title: e.target.value,
              })
            }
            className="w-full text-3xl font-bold bg-transparent border-none outline-none text-jet mb-4"
            placeholder="Note title"
          />

          <AnimatedNoteContent
            note={selectedNote}
            onContentChange={handleNoteContentChange}
            onTextSelection={handleTextSelection}
            animate={isProcessing}
          />

          <FloatingToolbar
            position={toolbarPosition}
            onAskAI={() => {
              setIsChatOpen(true);
              setChatMessages([
                ...chatMessages,
                {
                  role: "user",
                  content: `About this text: "${selectedText}"`,
                },
              ]);
              setToolbarPosition(null);
            }}
            onEdit={() => {
              setIsEditModalOpen(true);
              setToolbarPosition(null);
            }}
          />

          <EditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            selectedText={selectedText}
            onSubmit={(suggestion) => {
              console.log("Edit suggestion:", suggestion);
              // Implement the logic to handle the edit suggestion
            }}
          />
        </div>

        <div className="fixed right-8 bottom-8 flex gap-2">
          <button
            onClick={toggleRecording}
            className={`p-4 rounded-full shadow-lg transition-all border-2 ${
              isRecording
                ? "bg-pink text-white hover:bg-pink/90 border-pink"
                : "bg-white/80 text-jet/70 hover:bg-maya/10 hover:text-maya border-pink/30 hover:border-pink"
            }`}
          >
            {isRecording ? <FiMicOff size={24} /> : <FiMic size={24} />}
          </button>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-4 bg-maya text-white rounded-full shadow-lg hover:bg-maya/90 transition-all"
          >
            {isChatOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
          </button>
        </div>

        <div
          className={`fixed top-0 right-0 w-[480px] h-full bg-white/30 backdrop-blur-sm border-l border-maya/10 transform transition-transform duration-300 ${
            isChatOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 border-b border-maya/10 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-jet">
                Chat about this note
              </h3>
              <p className="text-sm text-jet/70 mt-1">
                Ask questions or get AI insights about your note
              </p>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 text-jet/70 hover:text-pink transition-colors rounded-lg"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="flex flex-col h-[calc(100vh-140px)]">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <div className="text-center text-jet/50 py-8">
                  <FiMessageSquare
                    size={32}
                    className="mx-auto mb-4 opacity-50"
                  />
                  <p>No messages yet. Start a conversation about your note!</p>
                  <p className="text-sm mt-2">
                    Try asking questions or requesting analysis
                  </p>
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    className={`p-4 rounded-lg ${
                      message.role === "user"
                        ? "bg-maya/10 ml-8"
                        : "bg-white/50 mr-8"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.role === "user" ? (
                        <FiUser className="text-maya" />
                      ) : (
                        <svg
                          className="w-5 h-5 text-pink"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M20.71 7.04c.39-.39.39-1.04 0-1.43l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z" />
                        </svg>
                      )}
                      <span className="text-sm font-medium">
                        {message.role === "user" ? "You" : "NeuroPen AI"}
                      </span>
                    </div>
                    {message.content}
                  </div>                    
                ))
              )}
            </div>

            {renderChatInput()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-main flex">
      <div className="w-80 bg-gradient-main dark:bg-gradient-main-dark backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png"
                alt="Quill.ai Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-jet">Quill.ai</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/profile")}
                className="text-jet/70 hover:text-maya transition-colors"
              >
                <FiUser size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="text-jet/70 hover:text-pink transition-colors"
              >
                <FiLogOut size={20} />
              </button>
              <button className="text-jet/70 hover:text-jet">
                <FiMenu size={20} />
              </button>
            </div>
          </div>

          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-jet/50" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-maya/20 rounded-lg focus:outline-none focus:border-maya"
            />
          </div>
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="w-full flex items-center gap-2 px-4 py-2 bg-maya text-white rounded-lg hover:bg-maya/90 transition-all"
          >
            <FiPlus />
            <span>New Note</span>
          </button>

          <div className="mt-6 space-y-2">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`w-full p-3 text-left rounded-lg transition-all ${
                  selectedNote?.id === note.id
                    ? "bg-maya/10 text-jet"
                    : "hover:bg-maya/5 text-jet/70"
                }`}
              >
                <h3 className="font-medium truncate">{note.title}</h3>
                <p className="text-sm truncate opacity-70">{note.content}</p>
                <span className="text-xs mt-1 block text-jet/50 font-medium">
                  {note.created_at
                    ? new Date(note.created_at).toLocaleDateString()
                    : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Container with Reference */}
      <div className="flex-1 p-8 overflow-y-auto relative" ref={mainContentRef}>
        {renderMainContent()}
      </div>

      {/* Recording Error Notification */}
      {recordingError && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/90 backdrop-blur-sm text-white rounded-full shadow-lg">
          {recordingError}
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-pink/90 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center gap-3">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>Listening to your voice...</span>
          <span className="text-sm opacity-75">
            Speak clearly into your microphone
          </span>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-maya/90 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center gap-3">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>Processing lecture notes...</span>
        </div>
      )}

      {/* Note Creation Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleCreateNote}
      />
    </div>
  );
}

export default Home;
