import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  saveUserProfile,
  getUserProfile,
  saveInteraction,
  loadUserInteractions,
  deleteInteraction,
  testFirestoreConnection,
} from './lib/firebase';
import {
  DailyPrompt,
  JournalInteraction,
  MoodOption,
  ReflectionMode,
  ThemeOption,
  UserProfile,
} from './types';
import { MOOD_OPTIONS, THEME_OPTIONS } from './lib/themes';
import { AmbientBackground } from './components/AmbientBackground';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { JournalEditor } from './components/JournalEditor';
import { ConversationView } from './components/ConversationView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { DailyPromptsModal } from './components/DailyPromptsModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { MoodAestheticEffects, MoodEffectType } from './components/MoodAestheticEffects';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active theme & mood state (Default to Vibrant Palette)
  const [activeTheme, setActiveTheme] = useState<ThemeOption>(THEME_OPTIONS[0]);
  const [selectedMood, setSelectedMood] = useState<MoodOption>(MOOD_OPTIONS[0]);

  // Mood atmospheric aesthetic effect trigger
  const [activeMoodEffect, setActiveMoodEffect] = useState<MoodEffectType>(null);
  const [moodTriggerKey, setMoodTriggerKey] = useState(0);

  const handleSelectMood = (mood: MoodOption) => {
    setSelectedMood(mood);
    setActiveMoodEffect(mood.id as MoodEffectType);
    setMoodTriggerKey((prev) => prev + 1);
  };

  const handleTriggerMoodByName = (moodName: string) => {
    const lower = moodName.toLowerCase();
    let effect: MoodEffectType = 'calm';
    if (lower.includes('calm')) effect = 'calm';
    else if (lower.includes('cozy')) effect = 'cozy';
    else if (lower.includes('inspir')) effect = 'inspired';
    else if (lower.includes('tender') || lower.includes('rain')) effect = 'tender';
    else if (lower.includes('pensive') || lower.includes('reflect')) effect = 'reflective';
    else if (lower.includes('heart') || lower.includes('grate')) effect = 'grateful';

    setActiveMoodEffect(effect);
    setMoodTriggerKey((prev) => prev + 1);
  };

  // Daily prompts
  const [prompts, setPrompts] = useState<DailyPrompt[]>([]);
  const [dailyPromptText, setDailyPromptText] = useState<string>('');

  // Interactions state
  const [interactions, setInteractions] = useState<JournalInteraction[]>([]);
  const [activeInteraction, setActiveInteraction] = useState<JournalInteraction | null>(null);

  // Modals & Drawers
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Action status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Greeting helper for Vibrant Palette design header
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Initial Firestore health test
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Fetch daily prompts from backend
  useEffect(() => {
    async function fetchPrompts() {
      try {
        const res = await fetch('/api/prompts');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.prompts) && data.prompts.length > 0) {
            setPrompts(data.prompts);
            // Select random daily spark
            const random = data.prompts[Math.floor(Math.random() * data.prompts.length)];
            setDailyPromptText(random.prompt);
          }
        }
      } catch (err) {
        console.warn('Could not fetch prompts, using local defaults:', err);
      }
    }
    fetchPrompts();
  }, []);

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setFirebaseUser(user);
        const profile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };
        setCurrentUser(profile);

        try {
          // Fetch existing user profile & theme preference
          const savedProfile = await getUserProfile(user.uid);
          if (savedProfile?.activeTheme) {
            const foundTheme = THEME_OPTIONS.find((t) => t.id === savedProfile.activeTheme);
            if (foundTheme) {
              setActiveTheme(foundTheme);
            }
          } else {
            await saveUserProfile(user, activeTheme.id);
          }

          // Fetch user-isolated interactions
          const userEntries = await loadUserInteractions(user.uid);
          setInteractions(userEntries);
        } catch (err: any) {
          console.error('Error synchronizing user data with Firestore:', err);
        }
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
        setInteractions([]);
        setActiveInteraction(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In
  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err?.message || 'Google sign-in could not be completed.');
      throw err;
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      if (firebaseUser) {
        await signOutUser();
      }
    } catch (err: any) {
      console.error('Sign-out error:', err);
    } finally {
      setCurrentUser(null);
      setFirebaseUser(null);
      setActiveInteraction(null);
      setInteractions([]);
    }
  };

  // Guest Demo Session
  const handleGuestExplore = (customName?: string) => {
    const trimmed = customName?.trim() || 'Elena';
    const guestUser: UserProfile = {
      uid: 'guest-' + Math.random().toString(36).slice(2, 9),
      displayName: trimmed,
      email: `${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '') || 'guest'}@bloomandbrew.demo`,
      photoURL: null,
    };
    setCurrentUser(guestUser);
  };

  // Select Theme and persist to user profile
  const handleSelectTheme = async (theme: ThemeOption) => {
    setActiveTheme(theme);
    if (firebaseUser?.uid) {
      try {
        await saveUserProfile(firebaseUser, theme.id);
      } catch (err) {
        console.warn('Could not save theme preference:', err);
      }
    }
  };

  // Submit initial journal reflection
  const handleSubmitEntry = async (
    entryText: string,
    mode: ReflectionMode,
    mood: MoodOption
  ) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setSaveError(null);

    try {
      // Call Gemini reflection API on backend
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: entryText,
          conversation: [],
          mode,
          mood: mood.id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const { reply, modelUsed } = await res.json();

      const newInteractionId = 'entry-' + Date.now();
      const newInteraction: JournalInteraction = {
        id: newInteractionId,
        userId: currentUser.uid,
        title: entryText.slice(0, 45) + (entryText.length > 45 ? '...' : ''),
        initialEntry: entryText,
        geminiResponse: reply,
        mood: mood.label.split(' ')[0],
        theme: activeTheme.id,
        tags: [mood.label.split(' ')[0], 'Mindful Reflection'],
        conversation: [
          {
            id: 'msg-1',
            role: 'user',
            text: entryText,
            timestamp: new Date().toISOString(),
          },
          {
            id: 'msg-2',
            role: 'model',
            text: reply,
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        modelUsed,
      };

      // Persist to Cloud Firestore with strict undefined hygiene
      if (firebaseUser?.uid) {
        await saveInteraction(currentUser.uid, newInteraction);
      }

      setInteractions((prev) => [newInteraction, ...prev]);
      setActiveInteraction(newInteraction);
    } catch (err: any) {
      console.error('Error submitting journal entry:', err);
      setSaveError(err?.message || 'Failed to generate reflection or save to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Multi-turn conversation reply
  const handleSendMessage = async (text: string) => {
    if (!currentUser || !activeInteraction) return;
    setIsSubmitting(true);
    setSaveError(null);

    const userMessage = {
      id: 'msg-' + Date.now(),
      role: 'user' as const,
      text,
      timestamp: new Date().toISOString(),
    };

    const updatedConversation = [...activeInteraction.conversation, userMessage];

    // Optimistically update conversation
    const interimInteraction = {
      ...activeInteraction,
      conversation: updatedConversation,
    };
    setActiveInteraction(interimInteraction);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation: updatedConversation,
          mode: 'reflection',
          mood: activeInteraction.mood,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to converse with Gemini.');
      }

      const { reply, modelUsed } = await res.json();

      const modelMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'model' as const,
        text: reply,
        timestamp: new Date().toISOString(),
      };

      const finalInteraction: JournalInteraction = {
        ...activeInteraction,
        conversation: [...updatedConversation, modelMessage],
        updatedAt: new Date().toISOString(),
        modelUsed: modelUsed || activeInteraction.modelUsed,
      };

      // Persist update to Firestore
      if (firebaseUser?.uid) {
        await saveInteraction(currentUser.uid, finalInteraction);
      }

      setActiveInteraction(finalInteraction);
      setInteractions((prev) =>
        prev.map((item) => (item.id === finalInteraction.id ? finalInteraction : item))
      );
    } catch (err: any) {
      console.error('Error continuing conversation:', err);
      setSaveError(err?.message || 'Failed to receive reply. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate empathetic summary
  const handleGenerateSummary = async () => {
    if (!currentUser || !activeInteraction) return;
    setIsSummarizing(true);
    setSaveError(null);

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: activeInteraction.initialEntry,
          conversation: activeInteraction.conversation,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate summary.');
      }

      const data = await res.json();

      const updatedInteraction: JournalInteraction = {
        ...activeInteraction,
        title: data.title || activeInteraction.title,
        summary: data.summary || '',
        takeaways: Array.isArray(data.takeaways) ? data.takeaways : [],
        tags: Array.isArray(data.tags) ? data.tags : activeInteraction.tags,
        mood: data.detectedMood || activeInteraction.mood,
        updatedAt: new Date().toISOString(),
      };

      if (firebaseUser?.uid) {
        await saveInteraction(currentUser.uid, updatedInteraction);
      }

      setActiveInteraction(updatedInteraction);
      setInteractions((prev) =>
        prev.map((item) => (item.id === updatedInteraction.id ? updatedInteraction : item))
      );
    } catch (err: any) {
      console.error('Error generating summary:', err);
      setSaveError(err?.message || 'Could not generate summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Delete an interaction
  const handleDeleteInteraction = async (id: string) => {
    if (!currentUser) return;
    try {
      if (firebaseUser?.uid) {
        await deleteInteraction(currentUser.uid, id);
      }
      setInteractions((prev) => prev.filter((item) => item.id !== id));
      if (activeInteraction?.id === id) {
        setActiveInteraction(null);
      }
    } catch (err: any) {
      console.error('Error deleting interaction:', err);
      setSaveError('Failed to remove reflection.');
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col bg-[#FFF9FA] text-[#5D4037] transition-colors duration-500"
    >
      {/* Ambient background with cursor trail & floating motes */}
      <AmbientBackground theme={activeTheme} />

      {/* Atmospheric Mood Aesthetic Effects (Pink flowers, Snow, Sparkles, Rain & Thunder, Dry Leaves, Beating Heart) */}
      <MoodAestheticEffects
        effect={activeMoodEffect}
        triggerKey={moodTriggerKey}
        theme={activeTheme}
        onComplete={() => setActiveMoodEffect(null)}
      />

      {/* Global Error Banner if any save or API error occurs */}
      {saveError && (
        <div className="sticky top-0 z-50 px-4 py-2 bg-rose-100/95 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{saveError}</span>
            <button
              type="button"
              onClick={() => setSaveError(null)}
              className="ml-auto text-rose-600 hover:text-rose-900 font-bold px-2 py-0.5 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* View Routing based on Auth State */}
      {!currentUser && !authLoading ? (
        <LandingPage
          theme={activeTheme}
          onSignIn={handleSignIn}
          onGuestExplore={handleGuestExplore}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          isLoading={authLoading}
          error={authError}
        />
      ) : (
        <div className="relative z-10 flex-1 flex flex-col">
          <Navbar
            theme={activeTheme}
            user={currentUser}
            entryCount={interactions.length}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
            onOpenPromptsModal={() => setIsPromptsModalOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onNewReflection={() => setActiveInteraction(null)}
            onSignOut={handleSignOut}
            isHistoryOpen={isHistoryOpen}
          />

          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col">
            {/* Header matching Active Palette */}
            {currentUser && (
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
                <div className="space-y-1">
                  <h2
                    style={{ color: activeTheme.textHeading }}
                    className="text-3xl font-serif italic transition-colors duration-300"
                  >
                    {getGreeting()}, {currentUser.displayName?.split(' ')[0] || 'Friend'}.
                  </h2>
                  <p
                    style={{ color: activeTheme.textMuted }}
                    className="text-sm transition-colors duration-300"
                  >
                    Dearly • Bloom & Brew — Let's turn your thoughts into blossoms.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectMood(selectedMood)}
                    title="Click to experience or replay the mood atmospheric aesthetic effect"
                    style={{
                      backgroundColor: activeTheme.badgeBg,
                      borderColor: activeTheme.borderColor,
                    }}
                    className="px-4 py-2 rounded-full border shadow-2xs flex items-center gap-2 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 group"
                  >
                    <div
                      style={{ backgroundColor: activeTheme.primary }}
                      className="w-2 h-2 rounded-full transition-colors duration-300 group-hover:animate-ping"
                    />
                    <span
                      style={{ color: activeTheme.textBody }}
                      className="text-xs font-medium transition-colors duration-300"
                    >
                      {selectedMood.label.split(' ')[0]} Mood • Replay Effect ✨
                    </span>
                  </button>
                </div>
              </header>
            )}

            {activeInteraction ? (
              <ConversationView
                theme={activeTheme}
                interaction={activeInteraction}
                onSendMessage={handleSendMessage}
                onGenerateSummary={handleGenerateSummary}
                onNewEntry={() => setActiveInteraction(null)}
                isLoading={isSubmitting}
                isSummarizing={isSummarizing}
                onTriggerMoodEffect={handleTriggerMoodByName}
              />
            ) : (
              <JournalEditor
                theme={activeTheme}
                selectedMood={selectedMood}
                onSelectMood={handleSelectMood}
                onSubmit={handleSubmitEntry}
                isLoading={isSubmitting}
                dailyPromptText={dailyPromptText}
                onUseDailyPrompt={(prompt) => setDailyPromptText(prompt)}
              />
            )}
          </main>
        </div>
      )}

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        interactions={interactions}
        onSelectInteraction={(item) => setActiveInteraction(item)}
        onDeleteInteraction={handleDeleteInteraction}
        theme={activeTheme}
        activeInteractionId={activeInteraction?.id}
      />

      {/* Daily Prompts Modal */}
      <DailyPromptsModal
        isOpen={isPromptsModalOpen}
        onClose={() => setIsPromptsModalOpen(false)}
        prompts={prompts}
        onSelectPrompt={(prompt) => {
          setDailyPromptText(prompt);
          setActiveInteraction(null);
        }}
        theme={activeTheme}
      />

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        activeTheme={activeTheme}
        onSelectTheme={handleSelectTheme}
      />
    </div>
  );
}
