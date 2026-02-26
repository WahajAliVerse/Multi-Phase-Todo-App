# 🎨 UI Components Visual Guide

## TaskCard Improvements

### Visual Enhancements

#### 1. Priority Accent Bar
```
┌─┌──────────────────────────────┐
││  Task Title                   │
││  Description text...          │
││                               │
└─└──────────────────────────────┘
   ↑
   Animated gradient bar (left edge)
   - Low: Emerald → Teal
   - Medium: Amber → Orange
   - High: Rose → Pink
```

#### 2. Completion Badge
**Before:** Simple text strikethrough
**After:** Animated CheckCircleIcon in top-right corner

```
Before:
┌─────────────────────┐
│ Task Title          │
│ (completed)         │
└─────────────────────┘

After:
┌─────────────────────┐
│            ✓        │ ← Animated checkmark
│ Task Title          │
│ (completed)         │
└─────────────────────┘
```

#### 3. Priority Badge
**Before:** Simple bordered badge
**After:** Gradient background badge

```
Before:                    After:
┌─────────────┐           ┌─────────────┐
│ Low         │           │ ▓▓ Low ▓▓   │ ← Gradient
└─────────────┘           └─────────────┘
  Border only                 Full gradient
```

#### 4. Checkbox Animation
**Before:** Basic checkmark appearance
**After:** Spring animation with rotation

```
State 1 → State 2 → State 3
[    ] → [ ↻  ] → [ ✓ ]
        Rotate    Scale + Check
```

#### 5. Overdue Indicator
**Before:** Simple text badge
**After:** Animated badge with icon

```
Before:
Overdue

After:
⚠ Overdue  ← Rose background, white text, icon
```

---

## TagCard (New Component)

### Layout Structure

```
┌─────────────────────────────────────┐
│ ╔═════════════════════════════════╗ │ ← Decorative orb (animated)
│ ║                                 ║ │
│ ┃ ┌───┐  Tag Name          [✏][🗑]│ ← Icon + actions (hover)
│ ┃ │ 🏷 │  5 tasks                 │
│ ┃ └───┘                          │
│                                  │
│ Color Preview:                   │
│ ████░░░░░░████ (gradient bar)   │
│                                  │
│ ──────────────────────────────── │
│ 📅 Created Feb 25, 2026   ● Active│
└─────────────────────────────────────┘

Legend:
┃ = Color accent bar (left edge)
[✏] = Edit button (appears on hover)
[🗑] = Delete button (appears on hover)
🏷 = Tag icon in colored container
```

### Animation Sequence

```
Mount Animation:
1. Card fades in (opacity: 0 → 1)
2. Card scales up (scale: 0.9 → 1)
3. Card slides up (y: 20 → 0)
4. Orb pulses in background
5. Accent bar grows

Hover Animation:
1. Card lifts (y: 0 → -8)
2. Card scales slightly (scale: 1.0 → 1.02)
3. Shadow deepens
4. Action buttons fade in
5. Glow effect appears
```

---

## TagChip Improvements

### Size Variants

```
Small (sm):
(● Tag)  px-2.5 py-1 text-xs

Medium (md) - Default:
(● Tag Name)  px-3.5 py-1.5 text-sm

Large (lg):
(● Tag Name Here)  px-4 py-2 text-base
```

### Variant Styles

#### Solid (Default)
```
┌──────────────┐
│ ● Tag Name   │ ← 15% opacity background
└──────────────┘
   1px border (30% opacity)
```

#### Outlined
```
┌──────────────┐
│ ● Tag Name   │ ← 5% opacity background
└──────────────┘
   1.5px solid border (100% color)
```

#### Ghost
```
  ● Tag Name    ← No background/border
   Color only
```

### Hover Effects

```
Rest State:
┌──────────────┐
│ ● Tag        │
└──────────────┘

Hover State:
    ┌──────────────┐
    │ ● Tag        │ ← Lifts 2px
    └──────────────┘
      ╔══════════╗    ← Colored shadow glow
      ╚══════════╝

Animation:
1. Scale: 1.0 → 1.08
2. TranslateY: 0 → -2px
3. Shadow appears
4. Shine effect sweeps across
```

### Remove Button Animation

```
Rest:
┌──────────────┐
│ ● Tag    ╳  │
└──────────────┘

Hover:
┌──────────────┐
│ ● Tag   [╳] │ ← Button scales, background darkens
└──────────────┘

Click:
┌──────────────┐
│ ● Tag   [╳] │ ← Button shrinks (scale: 0.9)
└──────────────┘
```

---

## Color System

### Priority Colors

```
Low Priority:
██████ Emerald 500
 ██████ Teal 500
  ██████ Cyan 500

Medium Priority:
██████ Amber 500
 ██████ Orange 500
  ██████ Yellow 500

High Priority:
██████ Rose 500
 ██████ Pink 500
  ██████ Red 500
```

### Tag Color Mapping

```
Red Tags:    #EF4444 → from-red-500 to-red-600
Orange Tags: #F97316 → from-orange-500 to-orange-600
Amber Tags:  #F59E0B → from-amber-500 to-amber-600
Green Tags:  #10B981 → from-emerald-500 to-emerald-600
Cyan Tags:   #06B6D4 → from-cyan-500 to-cyan-600
Blue Tags:   #3B82F6 → from-blue-500 to-blue-600
Indigo Tags: #6366F1 → from-indigo-500 to-indigo-600
Violet Tags: #8B5CF6 → from-violet-500 to-violet-600
Pink Tags:   #EC4899 → from-pink-500 to-pink-600
```

---

## Animation Timing

### Duration Guide
```
Fast (subtle feedback):    150ms
Normal (most animations):  300ms
Slow (major transitions):  500ms
```

### Easing Functions
```
easeInOut:    Smooth start and end
spring:        Bouncy, natural feel
linear:       Constant speed
```

### Stagger Delays
```
Element 1: delay 0ms
Element 2: delay 50ms
Element 3: delay 100ms
Element 4: delay 150ms
```

---

## Responsive Behavior

### Mobile (< 640px)
```
┌─────────────┐
│ Task Card   │
└─────────────┘
┌─────────────┐
│ Task Card   │
└─────────────┘
┌─────────────┐
│ Task Card   │
└─────────────┘
  Single column
```

### Tablet (640px - 1024px)
```
┌──────────┐ ┌──────────┐
│Task Card │ │Task Card │
└──────────┘ └──────────┘
┌──────────┐ ┌──────────┐
│Task Card │ │Task Card │
└──────────┘ └──────────┘
  Two columns
```

### Desktop (> 1024px)
```
┌──────┐ ┌──────┐ ┌──────┐
│Task  │ │Task  │ │Task  │
│Card  │ │Card  │ │Card  │
└──────┘ └──────┘ └──────┘
┌──────┐ ┌──────┐ ┌──────┐
│Task  │ │Task  │ │Task  │
│Card  │ │Card  │ │Card  │
└──────┘ └──────┘ └──────┘
  Three columns
```

---

## Dark Mode Support

### Light Mode
```
Background: White/10
Border: White/20
Text: Foreground (dark)
Shadow: Black/10
```

### Dark Mode
```
Background: White/5
Border: White/10
Text: Foreground (light)
Shadow: Black/20
```

### Auto-detection
```tsx
// Automatically detects system theme
// Classes like 'dark:text-foreground' handle switching
```

---

## Accessibility Features

### Focus States
```
Tab Navigation:
[Task Card] ← Focused
═══════════
  2px solid ring (primary color)
```

### Reduced Motion
```tsx
// Respects user's motion preferences
@media (prefers-reduced-motion: reduce) {
  // Disables complex animations
  // Keeps essential transitions
}
```

### Color Contrast
```
All text meets WCAG AA standards:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum
```

---

**Last Updated:** February 25, 2026  
**Components:** TaskCard, TagCard, TagChip  
**Status:** ✅ Production Ready
