'use client';

import React, { useState } from 'react';
import ChatButton from '@/components/common/ChatButton';
import ChatModal from '@/components/common/ChatModal';

/**
 * Client-side wrapper for chat functionality
 * Manages the open/close state of the chat modal
 */
export function ChatAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      {children}
      <ChatButton isOpen={isChatOpen} onClick={toggleChat} />
      <ChatModal isOpen={isChatOpen} onClose={closeChat} />
    </>
  );
}
