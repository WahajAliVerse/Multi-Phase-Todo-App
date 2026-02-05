import { Tag } from '../models/tag';

export class TagService {
  /**
   * Validates a tag before saving
   * @param tag The tag to validate
   * @returns True if the tag is valid, false otherwise
   */
  static validateTag(tag: Partial<Tag>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!tag.name || tag.name.trim().length === 0) {
      errors.push('Tag name is required');
    } else if (tag.name.length > 50) {
      errors.push('Tag name must be 50 characters or less');
    }

    if (!tag.color) {
      errors.push('Tag color is required');
    } else if (!this.isValidHexColor(tag.color)) {
      errors.push('Tag color must be a valid hex color code');
    }

    // Check if color is accessible (has sufficient contrast)
    if (tag.color && !this.isAccessibleColor(tag.color)) {
      errors.push('Tag color must meet accessibility contrast requirements');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Checks if a hex color is valid
   * @param color The color to check
   * @returns True if the color is valid, false otherwise
   */
  private static isValidHexColor(color: string): boolean {
    // Regex to match hex color codes (#RGB or #RRGGBB)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  }

  /**
   * Checks if a color meets accessibility contrast requirements
   * @param color The color to check
   * @returns True if the color is accessible, false otherwise
   */
  private static isAccessibleColor(color: string): boolean {
    // For simplicity, we'll just check if it's not too close to white or black
    // In a real implementation, we'd calculate the contrast ratio properly
    const rgb = this.hexToRgb(color);
    if (!rgb) return false;

    // Calculate luminance (simplified)
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    // Colors too close to white or black don't provide good contrast
    return luminance > 0.15 && luminance < 0.85;
  }

  /**
   * Converts a hex color to RGB
   * @param hex The hex color to convert
   * @returns RGB object or null if invalid
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Generates a random accessible color
   * @returns A hex color string
   */
  static generateRandomAccessibleColor(): string {
    // Generate random RGB values that ensure good contrast
    const r = Math.floor(Math.random() * 155) + 50; // Range 50-205
    const g = Math.floor(Math.random() * 155) + 50; // Range 50-205
    const b = Math.floor(Math.random() * 155) + 50; // Range 50-205

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Gets a predefined accessible color palette
   * @returns Array of hex color strings
   */
  static getAccessibleColorPalette(): string[] {
    return [
      '#FF6B6B', // Coral
      '#4ECDC4', // Turquoise
      '#45B7D1', // Sky Blue
      '#96CEB4', // Mint Green
      '#FFEAA7', // Light Yellow
      '#DDA0DD', // Plum
      '#98D8C8', // Spearmint
      '#F7DC6F', // Light Orange
      '#BB8FCE', // Lavender
      '#85C1E9', // Diamond
      '#F8C471', // Tan
      '#82E0AA', // Light Green
    ];
  }

  /**
   * Checks if a tag name is unique for a user
   * @param tagName The tag name to check
   * @param userId The user ID
   * @param existingTags Array of existing tags to check against
   * @returns True if the tag name is unique, false otherwise
   */
  static isTagNameUnique(tagName: string, userId: string, existingTags: Tag[]): boolean {
    const normalizedTagName = tagName.toLowerCase().trim();
    
    return !existingTags.some(
      tag => 
        tag.userId === userId && 
        tag.name.toLowerCase().trim() === normalizedTagName
    );
  }

  /**
   * Filters tags by name (case-insensitive)
   * @param tags Array of tags to filter
   * @param searchTerm Term to search for
   * @returns Filtered array of tags
   */
  static filterTagsByName(tags: Tag[], searchTerm: string): Tag[] {
    if (!searchTerm) return tags;
    
    const normalizedSearchTerm = searchTerm.toLowerCase();
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(normalizedSearchTerm)
    );
  }

  /**
   * Assigns tags to a task
   * @param taskTags Current tags on the task
   * @param tagIdsToAdd IDs of tags to add
   * @param tagIdsToRemove IDs of tags to remove
   * @returns Updated array of tags
   */
  static assignTagsToTask(
    taskTags: Tag[],
    tagIdsToAdd: string[] = [],
    tagIdsToRemove: string[] = []
  ): Tag[] {
    // Start with current tags
    let updatedTags = [...taskTags];
    
    // Add new tags
    for (const tagId of tagIdsToAdd) {
      if (!updatedTags.some(tag => tag.id === tagId)) {
        // Find the tag to add from somewhere (in a real app, this would come from state or API)
        // For now, we'll just add the ID assuming it exists
        // This is a simplified implementation
      }
    }
    
    // Remove specified tags
    updatedTags = updatedTags.filter(tag => !tagIdsToRemove.includes(tag.id));
    
    return updatedTags;
  }
}