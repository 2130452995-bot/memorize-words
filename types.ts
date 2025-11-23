export enum Language {
  ENGLISH = 'English',
  CHINESE = 'Chinese (Mandarin)',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  PORTUGUESE = 'Portuguese',
  RUSSIAN = 'Russian',
  ARABIC = 'Arabic',
}

export interface ExampleSentence {
  target: string;
  native: string;
}

export interface DictionaryResult {
  term: string;
  definition: string;
  pronunciation?: string; // Phonetic if available
  examples: ExampleSentence[];
  usageContext: {
    tone: string;
    culture: string;
    synonyms: string[];
    nuance: string;
  };
  imageUrl?: string; // Generated on the fly
}

export interface SavedWord extends DictionaryResult {
  id: string;
  timestamp: number;
  sourceLang: Language;
  targetLang: Language;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
