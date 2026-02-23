'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightSolidIcon } from '@heroicons/react/24/solid';
import { useAppSelector } from '@/redux/hooks';

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

/**
 * Floating Action Button for AI Task Assistant Chat
 * 
 * Features:
 * - Fixed position bottom-right corner
 * - Animated hover and tap effects
 * - Badge indicator for unread messages
 * - Icon transition between closed/open states
 * - Accessible with keyboard navigation and screen reader support
 * - Follows Vercel React best practices for client components
 */
const ChatButton: React.FC<ChatButtonProps> = ({ onClick, isOpen }) => {
  const { messages, typingIndicator } = useAppSelector((state) => state.agentChat);
  const [isHovered, setIsHovered] = useState(false);

  // Count unread assistant messages (messages from assistant that haven't been seen)
  const unreadCount = messages.filter(
    (m) => m.role === 'assistant' && m.status === 'delivered'
  ).length;

  const hasUnread = unreadCount > 0;

  return (
    <AnimatePresence>
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`
          fixed bottom-6 right-6 z-50
          flex items-center justify-center
          w-14 h-14 sm:w-16 sm:h-16
          rounded-full
          shadow-lg hover:shadow-xl
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          transition-all duration-300
          ${isOpen 
            ? 'bg-destructive hover:bg-destructive/90' 
            : 'bg-gradient-to-br from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90'
          }
        `}
        aria-label={isOpen ? 'Close chat assistant' : 'Open AI task assistant'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {/* Icon with animation */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <XMarkIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isHovered || typingIndicator ? (
                <ChatBubbleLeftRightSolidIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              ) : (
                <ChatBubbleLeftRightIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typing indicator pulse effect */}
        {typingIndicator && !isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-4 w-4"
          >
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
            />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-primary/50" />
          </motion.span>
        )}

        {/* Unread message badge */}
        {hasUnread && !isOpen && !typingIndicator && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 bg-destructive text-white text-xs font-bold rounded-full shadow-md"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}

        {/* Ripple effect on hover */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </AnimatePresence>
  );
};

export default ChatButton;
