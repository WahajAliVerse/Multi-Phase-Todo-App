// Accessible color palette for tag colors
// These colors meet WCAG 2.1 AA contrast standards when used with dark text
export const ACCESSIBLE_TAG_COLORS = [
  { name: 'Red', value: '#F87171', textColor: '#000000' }, // Light red
  { name: 'Orange', value: '#FB923C', textColor: '#000000' }, // Light orange
  { name: 'Amber', value: '#FBBF24', textColor: '#000000' }, // Light amber
  { name: 'Yellow', value: '#FACC15', textColor: '#000000' }, // Light yellow
  { name: 'Lime', value: '#A3E635', textColor: '#000000' }, // Light lime
  { name: 'Green', value: '#4ADE80', textColor: '#000000' }, // Light green
  { name: 'Emerald', value: '#34D399', textColor: '#000000' }, // Light emerald
  { name: 'Teal', value: '#2DD4BF', textColor: '#000000' }, // Light teal
  { name: 'Cyan', value: '#22D3EE', textColor: '#000000' }, // Light cyan
  { name: 'Sky', value: '#38BDF8', textColor: '#000000' }, // Light sky
  { name: 'Blue', value: '#60A5FA', textColor: '#000000' }, // Light blue
  { name: 'Indigo', value: '#818CF8', textColor: '#000000' }, // Light indigo
  { name: 'Violet', value: '#A78BFA', textColor: '#000000' }, // Light violet
  { name: 'Purple', value: '#C4B5FD', textColor: '#000000' }, // Light purple
  { name: 'Fuchsia', value: '#E879F9', textColor: '#000000' }, // Light fuchsia
  { name: 'Pink', value: '#F472B6', textColor: '#000000' }, // Light pink
  { name: 'Rose', value: '#F472B6', textColor: '#000000' }, // Light rose
];

// Darker accessible colors for better contrast when needed
export const DARK_ACCESSIBLE_TAG_COLORS = [
  { name: 'Dark Red', value: '#7F1D1D', textColor: '#FFFFFF' }, // Dark red
  { name: 'Dark Orange', value: '#7C2D12', textColor: '#FFFFFF' }, // Dark orange
  { name: 'Dark Amber', value: '#78350F', textColor: '#FFFFFF' }, // Dark amber
  { name: 'Dark Yellow', value: '#713F12', textColor: '#FFFFFF' }, // Dark yellow
  { name: 'Dark Lime', value: '#365314', textColor: '#FFFFFF' }, // Dark lime
  { name: 'Dark Green', value: '#14532D', textColor: '#FFFFFF' }, // Dark green
  { name: 'Dark Emerald', value: '#064E3B', textColor: '#FFFFFF' }, // Dark emerald
  { name: 'Dark Teal', value: '#0F383A', textColor: '#FFFFFF' }, // Dark teal
  { name: 'Dark Cyan', value: '#0E4444', textColor: '#FFFFFF' }, // Dark cyan
  { name: 'Dark Blue', value: '#1E3A8A', textColor: '#FFFFFF' }, // Dark blue
  { name: 'Dark Indigo', value: '#312E81', textColor: '#FFFFFF' }, // Dark indigo
  { name: 'Dark Violet', value: '#4C1D95', textColor: '#FFFFFF' }, // Dark violet
  { name: 'Dark Purple', value: '#581C87', textColor: '#FFFFFF' }, // Dark purple
  { name: 'Dark Fuchsia', value: '#701A75', textColor: '#FFFFFF' }, // Dark fuchsia
  { name: 'Dark Pink', value: '#9D174D', textColor: '#FFFFFF' }, // Dark pink
  { name: 'Dark Rose', value: '#931413', textColor: '#FFFFFF' }, // Dark rose
];

// Combined palette
export const COMBINED_ACCESSIBLE_TAG_COLORS = [
  ...ACCESSIBLE_TAG_COLORS,
  ...DARK_ACCESSIBLE_TAG_COLORS
];

// Function to get a random accessible color
export const getRandomAccessibleColor = (): { name: string; value: string; textColor: string } => {
  const allColors = COMBINED_ACCESSIBLE_TAG_COLORS;
  return allColors[Math.floor(Math.random() * allColors.length)];
};

// Function to get a specific accessible color by name
export const getAccessibleColorByName = (name: string): { name: string; value: string; textColor: string } | undefined => {
  return COMBINED_ACCESSIBLE_TAG_COLORS.find(color => 
    color.name.toLowerCase() === name.toLowerCase()
  );
};

// Function to validate if a color is accessible
export const isColorAccessible = (colorValue: string): boolean => {
  // This is a simplified check - in a real application, you'd want to calculate
  // the actual contrast ratio between the color and potential text colors
  return COMBINED_ACCESSIBLE_TAG_COLORS.some(color => 
    color.value.toLowerCase() === colorValue.toLowerCase()
  );
};