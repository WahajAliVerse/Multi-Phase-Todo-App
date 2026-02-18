/**
 * Jest Setup File
 * 
 * Configures testing environment with React Testing Library
 * and provides global mocks for the test suite.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from '@jest/globals';

// ============================================================================
// Cleanup after each test
// ============================================================================

afterEach(() => {
  cleanup();
});

// ============================================================================
// Global Mocks
// ============================================================================

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
    themes: ['light', 'dark'],
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    promise: jest.fn(),
    custom: jest.fn(),
    blank: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    input: 'input',
    span: 'span',
    p: 'p',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    ul: 'ul',
    li: 'li',
    form: 'form',
    section: 'section',
    header: 'header',
    footer: 'footer',
    nav: 'nav',
    main: 'main',
    article: 'article',
    aside: 'aside',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Redux hooks
jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: any) => selector({
    agentChat: {
      messages: [],
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      isSending: false,
      error: null,
      typingIndicator: false,
    },
    auth: {
      user: null,
      isAuthenticated: false,
      token: null,
      loading: false,
      error: null,
    },
    tasks: {
      tasks: [],
      loading: false,
      error: null,
      filters: {
        status: 'all',
        priority: 'all',
        tag: 'all',
      },
    },
    tags: {
      tags: [],
      loading: false,
      error: null,
    },
    ui: {
      notifications: [],
      modal: { mode: 0, entityType: 'task', isOpen: false },
      loading: false,
      error: null,
    },
  }),
}));

// ============================================================================
// Utility Functions for Tests
// ============================================================================

/**
 * Wait for a specified amount of time
 * @param ms - Milliseconds to wait
 */
export const waitForMs = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Create a mock chat message
 */
export const createMockChatMessage = (overrides = {}) => ({
  id: 'test-message-id',
  conversationId: 'test-conversation-id',
  role: 'user' as const,
  content: 'Test message content',
  timestamp: new Date().toISOString(),
  status: 'sent' as const,
  actions: [],
  ...overrides,
});

/**
 * Create a mock chat conversation
 */
export const createMockChatConversation = (overrides = {}) => ({
  id: 'test-conversation-id',
  userId: 'test-user-id',
  title: 'Test Conversation',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true,
  messageCount: 0,
  ...overrides,
});

/**
 * Create a mock chat action
 */
export const createMockChatAction = (overrides = {}) => ({
  type: 'create_task' as const,
  task_id: undefined,
  tag_id: undefined,
  details: {},
  confirmed: false,
  ...overrides,
});

// ============================================================================
// Environment Setup
// ============================================================================

beforeAll(() => {
  // Set up any global environment variables needed for tests
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8000/api';
});

afterAll(() => {
  // Clean up any global state
  jest.clearAllMocks();
});
