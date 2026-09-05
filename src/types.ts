export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  activeTheme?: string;
  joinedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface JournalInteraction {
  id: string;
  userId: string;
  title: string;
  initialEntry: string;
  geminiResponse: string;
  summary?: string;
  takeaways?: string[];
  mood: string;
  theme: string;
  tags: string[];
  conversation: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  modelUsed?: string;
}

export type ReflectionMode = 'reflection' | 'brainstorm' | 'summary' | 'coaching' | 'chat';

export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  quote: string;
  color: string;
  bgLight: string;
  border: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  bgCanvas: string;
  cardBg: string;
  textHeading: string;
  textBody: string;
  textMuted: string;
  badgeBg: string;
  borderColor: string;
  subtleBorder: string;
  glowColor: string;
  particleColors: string[];
  gradient: string;
}

export interface DailyPrompt {
  id: string;
  category: string;
  prompt: string;
  mood: string;
}

export type WrappedPeriod = 'week' | 'month' | 'custom';

export interface DearlyWrappedResult {
  periodLabel: string;
  entryCount: number;
  dateRangeStr: string;
  cupHeadline: string;
  overallSummary: string;
  recurringThemes: string[];
  joyfulMoments: string[];
  heavyMoments: string[];
  subtleWins: string[];
  patternsObserved: string[];
  reflectionQuestions: string[];
  closingNote: string;
  dominantMood: string;
  flowerOrCupMetaphor?: string;
  generatedAt: string;
  modelUsed?: string;
}
