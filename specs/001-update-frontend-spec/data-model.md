# Data Model for Frontend UI Enhancements

## Overview
This document outlines the UI components and data structures needed for the frontend enhancements, specifically focusing on the modern hero section, gradient theme, CTA buttons, and navigation elements.

## UI Components

### 1. Hero Section Component
- **Entity**: HeroSection
- **Fields**:
  - title: string (main headline)
  - subtitle: string (supporting text)
  - backgroundImage: string (optional background image URL)
  - gradientClass: string (Tailwind class for gradient effect)
  - ctaButtons: Array<CTAButton> (call-to-action buttons)

### 2. CTA Button Component
- **Entity**: CTAButton
- **Fields**:
  - text: string (button label)
  - url: string (destination URL)
  - onClick?: () => void (click handler function)
  - variant: 'primary' | 'secondary' | 'gradient' (visual style)
  - size: 'sm' | 'md' | 'lg' (button size)
  - icon?: string (optional icon name/class)
  - disabled?: boolean (whether button is disabled)

### 3. Navigation Item Component
- **Entity**: NavItem
- **Fields**:
  - name: string (display name)
  - url: string (destination URL)
  - isActive: boolean (current page indicator)
  - icon?: string (optional icon)

### 4. Navbar Component
- **Entity**: Navbar
- **Fields**:
  - logo: { text: string, url: string } (logo text and destination URL)
  - navigationItems: Array<NavItem> (main navigation links)
  - ctaButton?: CTAButton (optional CTA button)
  - mobileMenuOpen: boolean (mobile menu state)

### 5. Footer Component
- **Entity**: Footer
- **Fields**:
  - companyInfo: CompanyInfo (company details)
  - quickLinks: Array<NavItem> (quick navigation links)
  - legalLinks: Array<NavItem> (legal/privacy links)
  - socialLinks?: Array<SocialLink> (social media links)
  - copyrightText: string (copyright notice)

### 6. Social Link Component
- **Entity**: SocialLink
- **Fields**:
  - platform: string (platform name)
  - url: string (link URL)
  - icon: string (icon class/name)

### 7. Company Info Component
- **Entity**: CompanyInfo
- **Fields**:
  - name: string (company/app name)
  - description: string (brief description)
  - logo?: string (logo URL)

## Extended Task Data Model with New Features

### Task Entity (Extended)
- **Fields**:
  - id: number (unique identifier)
  - title: string (task title)
  - description: string (task description)
  - status: 'active' | 'completed' (task completion status)
  - priority: 'low' | 'medium' | 'high' (task priority level)
  - dueDate?: Date (optional due date)
  - createdAt: Date (creation timestamp)
  - updatedAt: Date (last update timestamp)
  - completedAt?: Date (completion timestamp)
  - userId: number (owner identifier)
  - tags: Array<Tag> (associated tags)
  - recurrencePattern?: RecurrencePattern (repetition configuration)
  - reminders: Array<Reminder> (notification settings)

### Tag Entity
- **Fields**:
  - id: number (unique identifier)
  - name: string (tag name, unique per user)
  - color: string (hex color code from accessible palette)
  - userId: number (owner identifier)
  - createdAt: Date (creation timestamp)
  - updatedAt: Date (last update timestamp)

### RecurrencePattern Entity
- **Fields**:
  - id: number (unique identifier)
  - patternType: 'daily' | 'weekly' | 'monthly' | 'yearly' (repetition frequency)
  - interval: number (every N days/weeks/months/years)
  - endCondition: 'never' | 'after_occurrences' | 'on_date' (when to stop)
  - occurrenceCount?: number (for 'after_occurrences' end condition)
  - endDate?: Date (for 'on_date' end condition)
  - daysOfWeek?: Array<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'> (for weekly patterns)
  - daysOfMonth?: Array<number> (for monthly patterns, 1-31)
  - createdAt: Date (creation timestamp)
  - updatedAt: Date (last update timestamp)

### Reminder Entity
- **Fields**:
  - id: number (unique identifier)
  - taskId: number (associated task identifier)
  - scheduledTime: Date (when to trigger notification, stored in UTC)
  - deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed' (notification status)
  - createdAt: Date (creation timestamp)
  - sentAt?: Date (delivery timestamp)

## User Profile Extension

### UserProfile Entity (Extended)
- **Fields**:
  - id: number (unique identifier)
  - username: string (user identifier)
  - email: string (contact email)
  - timezone: string (user's timezone setting, e.g., "America/New_York")
  - themePreference: 'light' | 'dark' (UI theme preference)
  - notificationPreferences: NotificationPreferences (notification settings)
  - createdAt: Date (account creation timestamp)
  - updatedAt: Date (last update timestamp)

### NotificationPreferences Entity
- **Fields**:
  - browserNotifications: boolean (enable browser notifications)
  - emailNotifications: boolean (enable email notifications)
  - inAppNotifications: boolean (enable in-app notifications)
  - timezone: string (timezone for notifications)

## State Management

### UI State
- **navbarState**: { mobileMenuOpen: boolean }
- **heroState**: { activeAnimation: string, currentSlide?: number }
- **themeState**: { currentTheme: 'light' | 'dark', gradientPreference: string }

### Feature State
- **tagState**: { tags: Array<Tag>, selectedTagIds: Array<number> }
- **recurrenceState**: { patterns: Array<RecurrencePattern>, editingPattern?: RecurrencePattern }
- **reminderState**: { reminders: Array<Reminder>, upcomingReminders: Array<Reminder> }

## Validation Rules

### From Requirements
- All UI components must include proper ARIA labels for accessibility (TR-005, TR-012)
- Color contrast ratios must be at least 4.5:1 (Clarification session)
- Navigation must be keyboard accessible (TR-012)
- Responsive design must work on all device sizes (TR-010, TR-024)
- Tag names must be unique per user account (FR-013)
- Recurrence patterns must detect and prevent conflicts (FR-019)
- Conflict resolution must achieve 95% success rate (SC-016)

## Relationships
- HeroSection contains multiple CTAButton elements
- Navbar contains multiple NavItem elements
- Footer contains multiple NavItem elements grouped by category
- Task contains multiple Tag elements
- Task optionally contains one RecurrencePattern element
- Task contains multiple Reminder elements
- UserProfile contains NotificationPreferences
- ThemeState affects all UI components' appearance

## State Transitions
- Navbar mobile menu: closed → open → closed
- Theme: light → dark → light
- Task status: active → completed → active
- Reminder status: pending → sent/delivered/failed
- Recurrence pattern: active → modified → updated instances