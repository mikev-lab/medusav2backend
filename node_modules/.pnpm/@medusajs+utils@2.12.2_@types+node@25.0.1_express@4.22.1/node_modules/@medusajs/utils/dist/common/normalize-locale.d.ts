/**
 * Normalizes a locale string to {@link https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag|BCP 47 language tag format}
 * @param locale - The locale string to normalize
 * @returns The normalized locale string
 *
 * @example
 * input: "en-Us"
 * output: "en-US"
 *
 * @example
 * input: "eN"
 * output: "en"
 *
 * @example
 * input: "RU-cYrl-By"
 * output: "ru-Cyrl-BY"
 */
export declare function normalizeLocale(locale: string): string;
//# sourceMappingURL=normalize-locale.d.ts.map