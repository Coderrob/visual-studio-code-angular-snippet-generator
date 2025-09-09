/**
 * StringUtils class for string manipulation utilities.
 * Provides static methods for common string operations.
 */
export class StringUtils {
  /**
   * Capitalizes the first character of a word.
   * @param value - The word to capitalize.
   * @returns The capitalized word.
   */
  static capitalizeWord(value = ""): string {
    if (!value) return value;
    const firstCharacter = value.charAt(0).toUpperCase();
    return [firstCharacter, value.slice(1)].filter(Boolean).join("");
  }

  /**
   * Converts a kebab-cased string to a title case.
   * @param value - The kebab-cased string.
   * @returns The formatted title.
   */
  static kebabToTitle(value = ""): string {
    return value
      .trim()
      .replace(/-/g, " ")
      .split(" ")
      .map(StringUtils.capitalizeWord)
      .join(" ");
  }
}

// Backward compatibility: export the functions
export const capitalizeWord = StringUtils.capitalizeWord.bind(StringUtils);
export const kebabToTitle = StringUtils.kebabToTitle.bind(StringUtils);
