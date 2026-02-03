# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the implementation of three key features missing from the frontend: recurrence patterns, notifications/reminders, and tags. These features already exist in the backend and need to be properly integrated into the Next.js 16+ frontend application. The implementation will follow React best practices and modern web design principles, using TypeScript, Redux Toolkit, Tailwind CSS, and other standard libraries. The approach includes creating new UI components, extending the Redux store, updating API services, and ensuring proper integration with the existing authentication system using HTTP-only cookies.

## Technical Context

**Language/Version**: TypeScript 5.x, JavaScript ES2022
**Primary Dependencies**: Next.js 16+, React 18+, Redux Toolkit, RTK Query, Tailwind CSS, React Hook Form, Zod
**Storage**: Browser localStorage/sessionStorage for client-side state, backend APIs for persistent data
**Testing**: Jest, React Testing Library, Cypress for end-to-end tests
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge) supporting ES2022
**Project Type**: Web application frontend that connects to existing backend API
**Performance Goals**: 60fps during all user interactions, page load times under 3 seconds, Core Web Vitals score of 90+
**Constraints**: Must work with existing backend API using HTTP-only cookies for authentication, bundle size under 250KB for initial load
**Scale/Scope**: Support 1000+ tasks and 50+ tags per user with efficient filtering and search

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Verification

**Modularity for Phased Evolution**: ✅ The frontend updates maintain modularity by extending existing components and services without breaking current functionality.

**User-Centric Design**: ✅ The addition of recurrence patterns, notifications/reminders, and tags enhances user experience and task organization.

**Security-First Approach**: ✅ The implementation respects the existing backend's HTTP-only cookie authentication mechanism, maintaining security standards.

**Performance Optimization**: ✅ The implementation follows performance goals with 60fps interactions and sub-3-second load times.

**Accessibility Compliance**: ✅ The implementation will follow WCAG 2.1 AA standards as required by the constitution.

**Sustainability and Resource Efficiency**: ✅ The frontend implementation focuses on efficient rendering and resource usage.

### Potential Violations & Justifications

None identified - all features comply with the constitution requirements.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/                    # Next.js 16+ App Router structure
│   │   ├── globals.css         # Global styles with Tailwind
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── login/              # Authentication pages
│   │   ├── register/
│   │   ├── dashboard/          # Main dashboard
│   │   ├── tasks/              # Task management pages
│   │   │   ├── page.tsx        # Task list page
│   │   │   ├── [id]/           # Individual task page
│   │   │   └── create/         # Create task page
│   │   ├── profile/            # User profile page
│   │   └── api/                # API route handlers
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components (buttons, inputs, etc.)
│   │   ├── TaskCard.tsx        # Task display component
│   │   ├── TaskForm.tsx        # Task creation/editing form
│   │   ├── TagSelector.tsx     # Tag selection component
│   │   ├── RecurrenceEditor.tsx # Recurrence pattern editor
│   │   ├── ReminderSetter.tsx   # Reminder setting component
│   │   └── ...
│   ├── lib/                    # Utility functions and constants
│   │   ├── types.ts            # TypeScript type definitions
│   │   ├── api.ts              # API service functions
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── timezone-utils.ts   # Timezone handling utilities
│   │   └── utils.ts            # General utility functions
│   ├── store/                  # Redux store configuration
│   │   ├── store.ts            # Main store setup
│   │   ├── slices/             # Redux slices
│   │   │   ├── tasksSlice.ts   # Task management slice
│   │   │   ├── tagsSlice.ts    # Tag management slice
│   │   │   ├── recurrenceSlice.ts # Recurrence management slice
│   │   │   ├── remindersSlice.ts # Reminder management slice
│   │   │   └── authSlice.ts    # Authentication slice
│   │   └── hooks.ts            # Redux hooks (useDispatch, useSelector)
│   └── hooks/                  # Custom React hooks
│       ├── useAuth.ts          # Authentication hook
│       ├── useTags.ts          # Tag management hook
│       ├── useRecurrence.ts    # Recurrence pattern hook
│       └── useReminders.ts     # Reminder management hook
├── public/                     # Static assets
├── styles/                     # Global styles
├── tests/                      # Test files
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

**Structure Decision**: The frontend follows the Next.js 16+ App Router structure with TypeScript and Tailwind CSS. Components are organized by functionality with dedicated slices for Redux state management. The structure supports the new features (recurrence, reminders, tags) with dedicated components and state management.

## Phase 0: Research & Unknown Resolution

### Research Findings

#### 1. Recurrence Pattern Implementation
**Decision**: Implement a comprehensive recurrence pattern editor component that allows users to configure complex recurrence rules with a user-friendly interface.

**Rationale**: The backend already supports recurrence patterns with various frequencies (daily, weekly, monthly, yearly) and end conditions. The frontend needs to provide an intuitive interface for users to configure these patterns while ensuring that modifications only affect future instances by default.

**Alternatives considered**:
- Simple dropdown with predefined patterns (e.g., "Daily", "Weekly", "Monthly")
- Advanced pattern builder with custom intervals and exceptions

**Chosen approach**: A balanced approach that provides both simplicity for common patterns and flexibility for complex ones, with clear indication of future instances only being affected by modifications.

#### 2. Notification and Reminder System
**Decision**: Implement a multi-channel reminder system using browser notifications, in-app alerts, and email integration.

**Rationale**: The backend supports reminder scheduling, but the frontend needs to handle the presentation and user interaction aspects. Per the spec clarifications, notifications should be delivered through all available channels (browser, in-app, email) to maximize reach.

**Alternatives considered**:
- Single channel approach
- User-selectable channel preferences

**Chosen approach**: Multi-channel delivery with user preferences for notification management.

#### 3. Tag Management System
**Decision**: Implement a tag management system with a predefined palette of accessible colors for consistent user experience.

**Rationale**: Tags provide an important organizational mechanism for tasks. Per spec clarifications, users should select from a predefined palette of accessible colors to ensure proper contrast and usability.

**Alternatives considered**:
- Custom color picker allowing any hex value
- System-generated color assignment

**Chosen approach**: Predefined accessible color palette with user selection.

#### 4. Timezone Handling
**Decision**: Use UTC for all scheduling and display local times to the user based on their current timezone.

**Rationale**: Per spec clarifications, the system should use UTC for all scheduling and display local times to the user based on their current timezone. This ensures consistency across different time zones and prevents issues when users travel.

**Alternatives considered**:
- Storing times in user's local timezone
- Fixed timezone per recurring task

**Chosen approach**: UTC storage with local display using date-fns-tz library.

## Phase 1: Design & Contracts

### Data Model Design

#### 1. Task Entity Extension
The existing Task entity will be extended with new properties for the additional features:

```typescript
interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'active' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
  userId: number;

  // New properties for enhanced functionality
  tags: Tag[];
  recurrencePattern?: RecurrencePattern;
  reminders?: Reminder[];
}
```

#### 2. Tag Entity
```typescript
interface Tag {
  id: number;
  name: string;
  color: string; // From predefined accessible palette
  userId: number;
  createdAt: Date;
  updatedAt?: Date;
}
```

#### 3. RecurrencePattern Entity
```typescript
interface RecurrencePattern {
  id: number;
  patternType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // How often the pattern repeats (every N days/weeks/etc)
  endCondition: 'never' | 'after_occurrences' | 'on_date';
  occurrenceCount?: number; // For 'after_occurrences' condition
  endDate?: Date; // For 'on_date' condition
  daysOfWeek?: string[]; // For weekly patterns (e.g., ['mon', 'tue', 'fri'])
  daysOfMonth?: number[]; // For monthly patterns (e.g., [1, 15])
  createdAt: Date;
  updatedAt?: Date;
}
```

#### 4. Reminder Entity
```typescript
interface Reminder {
  id: number;
  taskId: number;
  scheduledTime: Date; // Stored in UTC
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: Date;
  sentAt?: Date;
}
```

### API Contract Design

#### 1. Tag Endpoints
```
GET /api/v1/tags - Retrieve all tags for the current user
POST /api/v1/tags - Create a new tag
PUT /api/v1/tags/{tag_id} - Update an existing tag
DELETE /api/v1/tags/{tag_id} - Delete a tag
```

**Note**: These are backend API endpoints that the frontend will consume. The frontend will implement API service layer to communicate with these endpoints.

#### 2. Recurrence Pattern Endpoints
```
POST /api/v1/recurrence-patterns - Create a recurrence pattern
```

**Note**: These are backend API endpoints that the frontend will consume. The frontend will implement API service layer to communicate with these endpoints.

#### 3. Reminder Endpoints
```
POST /api/v1/reminders - Create a reminder
```

**Note**: These are backend API endpoints that the frontend will consume. The frontend will implement API service layer to communicate with these endpoints.

#### 4. Extended Task Endpoints
```
GET /api/v1/tasks - Retrieve tasks with optional filtering by tags, recurrence, and reminders
POST /api/v1/tasks - Create a task with optional tags, recurrence pattern, and reminders
PUT /api/v1/tasks/{task_id} - Update a task with optional updates to tags, recurrence pattern, and reminders
```

**Note**: These are backend API endpoints that the frontend will consume. The frontend will implement API service layer to communicate with these endpoints.

### Quickstart Guide for Implementation

1. **Setup Environment**:
   - Ensure Next.js 16+, TypeScript, and Tailwind CSS are properly configured
   - Install Redux Toolkit, RTK Query, React Hook Form, Zod, date-fns-tz
   - Set up HTTP-only cookie handling for authentication

2. **Implement Core Types**:
   - Define TypeScript interfaces for all entities in `lib/types.ts`
   - Create validation schemas using Zod

3. **Set Up State Management**:
   - Configure Redux store with Redux Toolkit
   - Create slices for tasks, tags, recurrence, and reminders
   - Implement RTK Query API service

4. **Build Components**:
   - Create TagSelector component with predefined color palette
   - Build RecurrenceEditor with intuitive recurrence pattern configuration
   - Develop ReminderSetter with multi-channel notification options

5. **Integrate with Existing UI**:
   - Extend TaskForm to include new features
   - Update TaskCard to display new information
   - Enhance task filtering and search capabilities

6. **Implement Timezone Handling**:
   - Use date-fns-tz for timezone conversions
   - Store all times in UTC
   - Display times in user's local timezone

7. **Test Implementation**:
   - Unit tests for new components
   - Integration tests for API interactions
   - End-to-end tests for user workflows

## Phase 2: Implementation Strategy

### Week 1: Foundation
- Set up project structure and dependencies
- Implement core types and validation
- Configure Redux store and RTK Query API service
- Create base UI components

### Week 2: Core Features
- Implement TagSelector component with predefined color palette
- Build RecurrenceEditor component with intuitive pattern configuration
- Develop ReminderSetter component with multi-channel options

### Week 3: Integration
- Extend TaskForm to include new features
- Update TaskCard to display new information
- Implement timezone handling with date-fns-tz
- Connect components to Redux store and API

### Week 4: Polish & Testing
- Enhance task filtering and search with new features
- Implement accessibility features (WCAG 2.1 AA)
- Add comprehensive tests
- Performance optimization and responsive design adjustments
- Final validation and bug fixes

## Post-Design Constitution Check

### Compliance Verification

**Modularity for Phased Evolution**: ✅ The frontend updates maintain modularity by extending existing components and services without breaking current functionality.

**User-Centric Design**: ✅ The addition of recurrence patterns, notifications/reminders, and tags enhances user experience and task organization.

**Security-First Approach**: ✅ The implementation respects the existing backend's HTTP-only cookie authentication mechanism, maintaining security standards.

**Performance Optimization**: ✅ The implementation follows performance goals with 60fps interactions and sub-3-second load times.

**Accessibility Compliance**: ✅ The implementation will follow WCAG 2.1 AA standards as required by the constitution.

**Sustainability and Resource Efficiency**: ✅ The frontend implementation focuses on efficient rendering and resource usage.

### MVC Architecture Alignment

Redux Toolkit is used for state management in accordance with MVC pattern:
- **Model**: Redux store and slices manage the application state (data layer)
- **View**: React components display the UI and respond to state changes
- **Controller**: React components and custom hooks handle user interactions and update the state via Redux actions

This maintains clear separation of concerns as required by the constitution.

### Potential Violations & Justifications

None identified - all features comply with the constitution requirements.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
