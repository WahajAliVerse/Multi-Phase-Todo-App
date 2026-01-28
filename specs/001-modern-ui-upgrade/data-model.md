# Data Model: Modern Frontend UI Upgrade for 2026

## Overview
This document describes the data models relevant to the UI upgrade, focusing on UI-specific state and entities that will be managed by the frontend application.

## Theme State
**Entity**: ThemeState
- **Fields**:
  - themeMode: 'light' | 'dark' (required)
  - systemPreference: boolean (optional, indicates if following system theme)
  - lastUpdated: Date (timestamp of last change)
- **Validation rules**:
  - themeMode must be either 'light' or 'dark'
  - systemPreference defaults to false if not specified
- **Relationships**: Singleton entity managed by ThemeContext

## Form Validation Schema
**Entity**: FormValidationSchema
- **Fields**:
  - schema: Zod schema object (varies by form type)
  - defaultValues: Object containing default form values
  - transformFn: Optional function to transform data before submission
- **Validation rules**:
  - schema must be a valid Zod schema
  - defaultValues must conform to schema shape
- **Relationships**: Used by individual form components

## Animation State
**Entity**: AnimationState
- **Fields**:
  - isVisible: boolean (controls element visibility)
  - animationVariant: string (name of animation variant to use)
  - isAnimating: boolean (indicates if animation is in progress)
  - duration: number (animation duration in ms, must be <100ms per spec)
- **Validation rules**:
  - isVisible must be boolean
  - animationVariant must correspond to defined variants
  - duration must be a positive number less than 100
- **Relationships**: Managed by individual animated components

## User Preferences
**Entity**: UserPreferences
- **Fields**:
  - themePreference: 'light' | 'dark' | 'system' (required)
  - animationPreference: 'enabled' | 'reduced' (required)
  - language: string (e.g., 'en', 'ur') (required)
  - lastUpdated: Date (timestamp of last change)
- **Validation rules**:
  - themePreference must be one of allowed values
  - animationPreference must be one of allowed values
  - language must be a valid locale code
- **Relationships**: Stored in localStorage (per spec requirement), managed by PreferencesContext

## Component State
**Entity**: ComponentState
- **Fields** (varies by component type):
  - loading: boolean (indicates loading state)
  - error: string | null (error message if applicable)
  - data: any (component-specific data)
  - dirty: boolean (indicates if form/input has been modified)
- **Validation rules**:
  - loading must be boolean
  - error must be string or null
  - data structure depends on component type
- **Relationships**: Managed individually by each component or shared context as appropriate

## UI Configuration
**Entity**: UIConfiguration
- **Fields**:
  - breakpoints: Object containing responsive breakpoints for mobile, tablet, desktop
  - transitions: Object containing animation timing values (all <100ms per spec)
  - zIndex: Object containing z-index values
  - spacing: Object containing spacing scale values
  - colors: Object containing theme color definitions for light/dark modes
- **Validation rules**:
  - All fields must be objects
  - Values must be of appropriate types (numbers for spacing, strings for transitions)
  - Colors must meet WCAG 2.1 AA contrast requirements
- **Relationships**: Singleton configuration used by styling system