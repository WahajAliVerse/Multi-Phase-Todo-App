'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  sendMessage,
  setConversation,
  clearHistory,
  setTypingIndicator,
  confirmAction,
  deleteConversation,
} from '@/redux/slices/agentChat';
import {
  ChatMessage,
  ChatAction,
  ChatConversation,
} from '@/types';
import Button from '@/components/ui/Button';
import {
  PaperAirplaneIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CalendarIcon,
  TagIcon,
  SparklesIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  ExclamationCircleIcon as ExclamationCircleSolidIcon,
} from '@heroicons/react/24/solid';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Formats a timestamp into a readable time/date string
 */
const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Renders action details for task creation confirmation
 */
const ActionConfirmation: React.FC<{
  action: ChatAction;
  onConfirm: () => void;
  isConfirmed: boolean;
}> = ({ action, onConfirm, isConfirmed }) => {
  const getActionIcon = () => {
    switch (action.type) {
      case 'create_task':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'update_task':
        return <ArrowPathIcon className="w-5 h-5" />;
      case 'delete_task':
        return <TrashIcon className="w-5 h-5" />;
      case 'complete_task':
        return <CheckCircleSolidIcon className="w-5 h-5" />;
      case 'create_tag':
        return <TagIcon className="w-5 h-5" />;
      case 'create_recurrence':
        return <ClockIcon className="w-5 h-5" />;
      default:
        return <SparklesIcon className="w-5 h-5" />;
    }
  };

  const getActionTitle = () => {
    const details = action.details;
    switch (action.type) {
      case 'create_task':
        return `Create task: "${details?.title || 'Untitled'}"`;
      case 'update_task':
        return `Update task: "${details?.title || action.task_id}"`;
      case 'delete_task':
        return `Delete task: "${details?.title || action.task_id}"`;
      case 'complete_task':
        return `Mark task complete: "${details?.title || action.task_id}"`;
      case 'create_tag':
        return `Create tag: "${details?.name || 'Untitled'}"`;
      case 'create_recurrence':
        return `Create recurring task: "${details?.title || 'Untitled'}"`;
      default:
        return 'Confirm action';
    }
  };

  const getActionDescription = () => {
    const details = action.details;
    const parts: string[] = [];

    if (details?.due_date) {
      parts.push(`Due: ${new Date(details.due_date).toLocaleDateString()}`);
    }
    if (details?.priority) {
      parts.push(`Priority: ${details.priority}`);
    }
    if (details?.pattern) {
      parts.push(`Repeats: ${details.pattern}`);
    }
    if (details?.color) {
      parts.push(`Color: ${details.color}`);
    }

    return parts.join(' • ') || 'No additional details';
  };

  if (isConfirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-3 p-3 bg-success/10 border border-success/30 rounded-lg flex items-center gap-2"
      >
        <CheckCircleSolidIcon className="w-5 h-5 text-success flex-shrink-0" />
        <span className="text-sm text-success font-medium">Action confirmed and executed</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-lg"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {getActionIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">{getActionTitle()}</p>
          <p className="text-xs text-muted-foreground mt-1">{getActionDescription()}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={onConfirm}
          className="flex items-center gap-1.5"
          startIcon={<CheckCircleIcon className="w-4 h-4" />}
        >
          Confirm
        </Button>
        <span className="text-xs text-muted-foreground self-center">
          Click to execute this action
        </span>
      </div>
    </motion.div>
  );
};

/**
 * Individual chat message component
 */
const ChatMessageItem: React.FC<{
  message: ChatMessage;
  onConfirmAction: (actionIndex: number) => void;
}> = React.memo(({ message, onConfirmAction }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <ClockIcon className="w-3 h-3" />;
      case 'sent':
        return <CheckCircleIcon className="w-3 h-3" />;
      case 'delivered':
        return <CheckCircleSolidIcon className="w-3 h-3" />;
      case 'failed':
        return <ExclamationCircleSolidIcon className="w-3 h-3" />;
      default:
        return null;
    }
  };

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-4"
      >
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser 
            ? 'bg-gradient-to-br from-primary to-purple-600' 
            : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }
        `}
      >
        {isUser ? (
          <span className="text-white text-sm font-bold">U</span>
        ) : (
          <SparklesIcon className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-4 py-3 rounded-2xl shadow-sm
            ${isUser
              ? 'bg-gradient-to-br from-primary to-purple-600 text-white rounded-tr-sm'
              : 'bg-card border border-border text-foreground rounded-tl-sm'
            }
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Message metadata */}
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(message.timestamp)}
          </span>
          {!isUser && getStatusIcon() && (
            <span className="text-muted-foreground/60">{getStatusIcon()}</span>
          )}
        </div>

        {/* Action confirmations for assistant messages */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <div className="w-full mt-2">
            {message.actions.map((action, index) => (
              <ActionConfirmation
                key={index}
                action={action}
                onConfirm={() => onConfirmAction(index)}
                isConfirmed={action.confirmed || false}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

/**
 * Typing indicator component
 */
const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex gap-3 mb-4"
  >
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
      <SparklesIcon className="w-4 h-4 text-white" />
    </div>
    <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-muted-foreground/40 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

/**
 * Conversation list sidebar component
 */
const ConversationList: React.FC<{
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onClose: () => void;
}> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClose,
}) => (
  <div className="flex flex-col h-full bg-card border-r border-border">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-border">
      <h2 className="font-semibold text-foreground">Conversations</h2>
      <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
        <XMarkIcon className="w-5 h-5" />
      </Button>
    </div>

    {/* New conversation button */}
    <div className="p-3">
      <Button
        variant="primary"
        fullWidth
        size="sm"
        onClick={onNewConversation}
        startIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
      >
        New Chat
      </Button>
    </div>

    {/* Conversation list */}
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-sm">
          No conversations yet
        </div>
      ) : (
        conversations.map((conv) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`
              group flex items-center gap-3 p-3 mx-2 my-1 rounded-lg cursor-pointer
              transition-colors
              ${currentConversationId === conv.id
                ? 'bg-primary/10 border border-primary/30'
                : 'hover:bg-muted'
              }
            `}
            onClick={() => onSelectConversation(conv.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conv.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
              aria-label="Delete conversation"
            >
              <TrashIcon className="w-4 h-4 text-destructive" />
            </button>
          </motion.div>
        ))
      )}
    </div>
  </div>
);

/**
 * Main Chat Modal Component
 * 
 * Features:
 * - Full chat interface with message list and input
 * - Task creation confirmation UI
 * - Typing indicator
 * - Message status (sending/sent/failed/delivered)
 * - Conversation management
 * - Responsive design with mobile support
 * - Accessible with keyboard navigation
 * - Follows Vercel React best practices
 */
const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const {
    messages,
    conversations,
    currentConversationId,
    isSending,
    typingIndicator,
    error,
  } = useAppSelector((state) => state.agentChat);
  const { user } = useAppSelector((state) => state.auth);

  const [inputValue, setInputValue] = useState('');
  const [showConversationList, setShowConversationList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages.length, scrollToBottom]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Close on Escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Send message handler
  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isSending || !user) return;

    const request = {
      conversation_id: currentConversationId || undefined,
      content,
    };

    dispatch(sendMessage(request));
    setInputValue('');

    // Reset typing indicator after delay
    dispatch(setTypingIndicator(true));
  }, [inputValue, isSending, currentConversationId, user, dispatch]);

  // Handle Enter key (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Confirm action handler
  const handleConfirmAction = useCallback(
    (messageId: string, actionIndex: number) => {
      dispatch(confirmAction({ messageId, actionIndex }));
      // In a real implementation, this would trigger the actual task operation
      // For now, we just mark it as confirmed in the UI
    },
    [dispatch]
  );

  // Start new conversation
  const handleNewConversation = useCallback(() => {
    dispatch(setConversation(null));
    dispatch(clearHistory());
    setShowConversationList(false);
  }, [dispatch]);

  // Select conversation
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      dispatch(setConversation(conversationId));
      setShowConversationList(false);
    },
    [dispatch]
  );

  // Delete conversation
  const handleDeleteConversation = useCallback(
    (conversationId: string) => {
      if (window.confirm('Are you sure you want to delete this conversation?')) {
        dispatch(deleteConversation(conversationId));
      }
    },
    [dispatch]
  );

  // Toggle conversation list
  const toggleConversationList = () => {
    setShowConversationList(!showConversationList);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        aria-hidden="true"
      />

      {/* Modal container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-16 max-w-4xl mx-auto z-50 flex"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-modal-title"
      >
        <div className="flex-1 flex flex-col bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleConversationList}
                className="p-2"
                aria-label="Toggle conversation list"
              >
                {showConversationList ? (
                  <ChevronLeftIcon className="w-5 h-5" />
                ) : (
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                )}
              </Button>
              <div>
                <h2 id="chat-modal-title" className="font-semibold text-foreground">
                  AI Task Assistant
                </h2>
                <p className="text-xs text-muted-foreground">
                  {currentConversationId
                    ? conversations.find((c) => c.id === currentConversationId)?.title || 'Chat'
                    : 'New conversation'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typingIndicator && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <SparklesIcon className="w-3 h-3" />
                  Assistant is typing...
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
                aria-label="Close chat"
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>
          </header>

          {/* Main content area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conversation list sidebar */}
            <AnimatePresence>
              {showConversationList && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <ConversationList
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={handleDeleteConversation}
                    onClose={() => setShowConversationList(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-4"
                    >
                      <SparklesIcon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Welcome to AI Task Assistant
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      I can help you create, update, and manage tasks using natural language.
                      Try saying something like:
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {[
                        'Create a task to buy groceries tomorrow',
                        'Schedule a meeting next Monday at 3pm',
                        'What tasks are due this week?',
                      ].map((suggestion, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          onClick={() => setInputValue(suggestion)}
                          className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-xs text-foreground transition-colors"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <ChatMessageItem
                        key={message.id}
                        message={message}
                        onConfirmAction={(actionIndex) =>
                          handleConfirmAction(message.id, actionIndex)
                        }
                      />
                    ))}
                    <AnimatePresence>
                      {typingIndicator && <TypingIndicator />}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mx-4 mb-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2"
                  >
                    <ExclamationCircleSolidIcon className="w-5 h-5 text-destructive flex-shrink-0" />
                    <span className="text-sm text-destructive">{error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch({ type: 'agentChat/clearError' })}
                      className="ml-auto p-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input area */}
              <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message... (Shift+Enter for new line)"
                      rows={1}
                      disabled={isSending}
                      className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none disabled:opacity-50 text-foreground placeholder:text-muted-foreground/50"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                      aria-label="Chat message input"
                    />
                    <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                      {inputValue.length > 0 && `${inputValue.length} chars`}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isSending}
                    className="px-4 self-end"
                    aria-label="Send message"
                  >
                    {isSending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <PaperAirplaneIcon className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Press Enter to send, Shift+Enter for new line • Esc to close
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatModal;
