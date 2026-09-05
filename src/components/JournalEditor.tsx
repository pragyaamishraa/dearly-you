import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  Coffee,
  CheckCircle2,
  Feather,
  RefreshCw,
  Quote,
  Wind,
} from 'lucide-react';
import { MoodOption, ReflectionMode, ThemeOption } from '../types';
import { MOOD_OPTIONS } from '../lib/themes';
import confetti from 'canvas-confetti';

interface JournalEditorProps {
  onSubmit: (text: string, mode: ReflectionMode, mood: MoodOption) => Promise<void>;
  isLoading: boolean;
  selectedMood: MoodOption;
  onSelectMood: (mood: MoodOption) => void;
  dailyPromptText?: string;
  onUseDailyPrompt?: (prompt: string) => void;
  theme: ThemeOption;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  onSubmit,
  isLoading,
  selectedMood,
  onSelectMood,
  dailyPromptText,
  theme,
}) => {
  const [entryText, setEntryText] = useState('');
  const [mode, setMode] = useState<ReflectionMode>('reflection');
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const modes: { id: ReflectionMode; label: string; desc: string; icon: string }[] = [
    {
      id: 'reflection',
      label: 'Deep Reflection',
      desc: 'Empathetic feedback & mindful contemplation',
      icon: '🌸',
    },
    {
      id: 'brainstorm',
      label: 'Gentle Exploration',
      desc: 'Explore alternative viewpoints & clarity',
      icon: '☕',
    },
    {
      id: 'coaching',
      label: 'Compassionate Nudge',
      desc: 'Actionable & soothing steps forward',
      icon: '🌱',
    },
    {
      id: 'summary',
      label: 'Essential Bouquet',
      desc: 'Extracting key takeaways & core feelings',
      icon: '✨',
    },
  ];

  const handleApplyPrompt = () => {
    if (!dailyPromptText) return;
    setEntryText((prev) => (prev ? `${prev}\n\n${dailyPromptText}` : dailyPromptText));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryText.trim() || isLoading) return;

    // Trigger soft blossom confetti ripple matching theme particles
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
      colors: theme.particleColors,
    });

    await onSubmit(entryText, mode, selectedMood);
  };

  const wordCount = entryText.trim() ? entryText.trim().split(/\s+/).length : 0;

  // Toggle breathing exercise
  const toggleBreathing = () => {
    setShowBreathingGuide((prev) => !prev);
  };

  React.useEffect(() => {
    if (!showBreathingGuide) return;
    const interval = setInterval(() => {
      setBreathingPhase((prev) => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [showBreathingGuide]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        backgroundColor: theme.cardBg,
        borderColor: theme.borderColor,
        boxShadow: `0 15px 35px -15px ${theme.glowColor}`,
      }}
      className="w-full rounded-[40px] p-6 sm:p-10 border relative overflow-hidden transition-all duration-300"
    >
      {/* Decorative top accent line with theme gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300"
        style={{
          background: theme.gradient,
        }}
      />

      {/* Mood Selector Row */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label
            style={{ color: theme.textMuted }}
            className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5"
          >
            <Feather className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            <span>How does your heart feel today?</span>
          </label>
          <span
            style={{ color: theme.textMuted }}
            className="text-xs italic hidden sm:inline"
          >
            "{selectedMood.quote}"
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = selectedMood.id === mood.id;
            const effectTag =
              mood.id === 'calm'
                ? '🌸 Pink Flowers'
                : mood.id === 'cozy'
                ? '❄️ Snow Fall'
                : mood.id === 'inspired'
                ? '✨ Sparkles'
                : mood.id === 'tender'
                ? '🌧️ Rain & Thunder'
                : mood.id === 'reflective'
                ? '🍂 Dry Leaves'
                : '💖 Beating Heart';

            return (
              <motion.button
                key={mood.id}
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectMood(mood)}
                title={`${mood.label}: Click to experience ${effectTag}`}
                style={{
                  backgroundColor: isSelected ? theme.badgeBg : theme.bgCanvas,
                  borderColor: isSelected ? theme.primary : theme.borderColor,
                  color: isSelected ? theme.textHeading : theme.textBody,
                }}
                className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-2xl text-xs font-medium transition-all cursor-pointer border shadow-2xs relative group min-h-[56px]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{mood.emoji}</span>
                  <span className="font-medium truncate">{mood.label.split(' ')[0]}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: theme.primary }} />
                  )}
                </div>
                <span
                  style={{ color: isSelected ? theme.primary : theme.textMuted }}
                  className="text-[10px] tracking-tight font-normal opacity-90"
                >
                  {effectTag.split(' ').slice(1).join(' ')}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Daily Prompt Banner matching Theme */}
      {dailyPromptText && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            backgroundColor: theme.badgeBg,
            borderColor: theme.borderColor,
          }}
          className="mb-6 rounded-2xl p-4 border flex items-start justify-between gap-4 text-xs transition-colors duration-300"
        >
          <div className="flex items-start gap-2.5">
            <Quote className="w-4 h-4 mt-0.5 shrink-0" style={{ color: theme.primary }} />
            <div>
              <p
                style={{ color: theme.textMuted }}
                className="text-[10px] uppercase tracking-widest font-bold mb-1"
              >
                Daily Theme Spark
              </p>
              <p
                style={{ color: theme.textBody }}
                className="text-xs italic leading-relaxed"
              >
                '{dailyPromptText}'
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleApplyPrompt}
            style={{
              backgroundColor: theme.cardBg,
              color: theme.primary,
              borderColor: theme.borderColor,
            }}
            className="shrink-0 px-3 py-1.5 rounded-full border font-medium text-[11px] shadow-xs cursor-pointer transition-all"
          >
            Insert Spark
          </motion.button>
        </motion.div>
      )}

      {/* Mode Selection Tabs */}
      <div className="mb-5">
        <label
          style={{ color: theme.textMuted }}
          className="text-[10px] uppercase tracking-widest font-bold block mb-2.5"
        >
          Select Reflection Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {modes.map((m) => {
            const isActive = mode === m.id;
            return (
              <motion.button
                key={m.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode(m.id)}
                style={{
                  backgroundColor: isActive ? theme.badgeBg : theme.bgCanvas,
                  borderColor: isActive ? theme.primary : theme.borderColor,
                  color: isActive ? theme.textHeading : theme.textMuted,
                }}
                className="py-2.5 px-3.5 rounded-2xl text-xs font-medium text-left border transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span>{m.icon}</span>
                  <span className="font-semibold">{m.label.split(' ')[0]}</span>
                </div>
                <p
                  style={{ color: theme.textMuted }}
                  className="text-[10px] opacity-80 truncate"
                >
                  {m.desc}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Gentle Breathing Guide Accordion */}
      <div className="mb-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleBreathing}
            style={{ color: theme.textMuted }}
            className="inline-flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity cursor-pointer py-1"
          >
            <Wind className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            <span>{showBreathingGuide ? 'Hide Mindful Breathing' : 'Take a Mindful Breath First'}</span>
          </button>
        </div>

        <AnimatePresence>
          {showBreathingGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                backgroundColor: theme.badgeBg,
                borderColor: theme.subtleBorder,
              }}
              className="mt-2 p-5 rounded-3xl border flex items-center justify-center gap-6 transition-colors duration-300"
            >
              <motion.div
                animate={{
                  scale: breathingPhase === 'Inhale' ? 1.3 : breathingPhase === 'Hold' ? 1.3 : 0.9,
                }}
                transition={{ duration: 3.8, ease: 'easeInOut' }}
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.primary,
                }}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-inner border-2"
              >
                <Coffee className="w-6 h-6" style={{ color: theme.primary }} />
              </motion.div>
              <div>
                <span
                  style={{ color: theme.primary }}
                  className="text-xs uppercase tracking-widest font-bold block"
                >
                  {breathingPhase}
                </span>
                <p
                  style={{ color: theme.textBody }}
                  className="text-xs opacity-90 mt-0.5"
                >
                  {breathingPhase === 'Inhale' && 'Breathe in warmth, peace, and quiet presence.'}
                  {breathingPhase === 'Hold' && 'Hold gently and rest in this still center.'}
                  {breathingPhase === 'Exhale' && 'Release tension like steam from a fresh warm latte.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Journal Input */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            backgroundColor: theme.bgCanvas,
            borderColor: theme.borderColor,
          }}
          className="relative mb-6 rounded-3xl p-2 border focus-within:ring-2 focus-within:ring-black/5 transition-colors duration-300"
        >
          <textarea
            id="journal-input"
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            disabled={isLoading}
            rows={7}
            placeholder="How was your latte today? What’s on your mind? Pour your thoughts freely..."
            style={{
              color: theme.textBody,
            }}
            className="w-full p-4 resize-none border-none outline-none text-base sm:text-lg leading-relaxed placeholder:opacity-50 bg-transparent font-light"
          />

          {/* Stats & Word count footer */}
          <div
            style={{ color: theme.textMuted }}
            className="flex items-center justify-between px-4 pb-2 text-[11px] font-mono opacity-80"
          >
            <span>{wordCount} words</span>
            <span>{entryText.length} characters</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            style={{ color: theme.textMuted }}
            className="text-xs italic text-center sm:text-left"
          >
            ✨ Stored safely in your private Firestore vault with owner isolation.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {entryText && (
              <button
                type="button"
                onClick={() => setEntryText('')}
                disabled={isLoading}
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.subtleBorder,
                  color: theme.textMuted,
                }}
                className="px-5 py-2.5 rounded-full text-xs font-medium border transition-colors cursor-pointer hover:opacity-80"
              >
                Clear
              </button>
            )}

            <motion.button
              id="reflect-submit-button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || !entryText.trim()}
              style={{
                backgroundColor: theme.primary,
                color: '#FFFFFF',
                boxShadow: `0 8px 24px -4px ${theme.primary}55`,
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Brewing Reflection...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Send to Gemini</span>
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
