import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Calendar,
  Coffee,
  Heart,
  Download,
  Copy,
  Check,
  RefreshCw,
  Quote,
  Feather,
  Sun,
  AlertCircle,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { DearlyWrappedResult, JournalInteraction, ThemeOption, WrappedPeriod } from '../types';

interface DearlyWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  interactions: JournalInteraction[];
  theme: ThemeOption;
  userName: string;
  onTriggerMoodEffect?: (moodName: string) => void;
  onNewReflection?: () => void;
}

export const DearlyWrappedModal: React.FC<DearlyWrappedModalProps> = ({
  isOpen,
  onClose,
  interactions,
  theme,
  userName,
  onTriggerMoodEffect,
  onNewReflection,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<WrappedPeriod>('month');

  // Custom date range state (default to past 30 days)
  const defaultEndDate = new Date().toISOString().slice(0, 10);
  const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const [customStart, setCustomStart] = useState(defaultStartDate);
  const [customEnd, setCustomEnd] = useState(defaultEndDate);

  // Result and state
  const [isBrewing, setIsBrewing] = useState(false);
  const [wrappedResult, setWrappedResult] = useState<DearlyWrappedResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter entries based on the chosen period
  const { filteredEntries, periodLabel, dateRangeStr } = useMemo(() => {
    const now = new Date();
    let startBoundary: Date;
    let endBoundary: Date = new Date();
    let label = 'This Month';

    if (selectedPeriod === 'week') {
      label = 'This Week';
      startBoundary = new Date();
      startBoundary.setDate(now.getDate() - 7);
      startBoundary.setHours(0, 0, 0, 0);
    } else if (selectedPeriod === 'month') {
      label = 'This Month';
      startBoundary = new Date();
      startBoundary.setDate(now.getDate() - 30);
      startBoundary.setHours(0, 0, 0, 0);
    } else {
      label = 'Custom Window';
      startBoundary = new Date(customStart + 'T00:00:00');
      endBoundary = new Date(customEnd + 'T23:59:59');
    }

    const matched = interactions.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startBoundary && itemDate <= endBoundary;
    });

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const rangeStr = `${startBoundary.toLocaleDateString(undefined, options)} – ${endBoundary.toLocaleDateString(undefined, options)}`;

    return {
      filteredEntries: matched,
      periodLabel: label,
      dateRangeStr: rangeStr,
    };
  }, [interactions, selectedPeriod, customStart, customEnd]);

  // Brew Dearly Wrapped
  const handleBrewWrapped = async () => {
    if (filteredEntries.length < 2) return;
    setIsBrewing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/wrapped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: filteredEntries,
          periodLabel,
          dateRangeStr,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to brew your reflection letter.');
      }

      setWrappedResult(data);

      // Trigger ambient aesthetic effect based on dominant mood if available
      if (data.dominantMood && onTriggerMoodEffect) {
        onTriggerMoodEffect(data.dominantMood);
      }
    } catch (err: any) {
      console.error('Error brewing Dearly Wrapped:', err);
      setErrorMessage(err.message || 'Something unexpected happened while brewing your letter.');
    } finally {
      setIsBrewing(false);
    }
  };

  // Copy letter to clipboard
  const handleCopy = () => {
    if (!wrappedResult) return;
    const text = `# 🌸 Dearly Wrapped: ${wrappedResult.cupHeadline}
*Period: ${wrappedResult.periodLabel} (${wrappedResult.dateRangeStr}) | Reflections Analyzed: ${wrappedResult.entryCount}*

${wrappedResult.overallSummary}

### ☕ What kept coming up
${wrappedResult.recurringThemes.map((t) => `- ${t}`).join('\n')}

### 🌸 Little things that made you happy
${wrappedResult.joyfulMoments.map((j) => `- ${j}`).join('\n')}

### 🌧️ Things that felt heavy
${wrappedResult.heavyMoments.map((h) => `- ${h}`).join('\n')}

### ✨ Wins you may have forgotten
${wrappedResult.subtleWins.map((w) => `- ${w}`).join('\n')}

### 🌿 Patterns in your thoughts
${wrappedResult.patternsObserved.map((p) => `- ${p}`).join('\n')}

### 💭 Something to think about
${wrappedResult.reflectionQuestions.map((q) => `- ${q}`).join('\n')}

### 💌 A little note from Dearly
${wrappedResult.closingNote}

---
*Dearly: Bloom & Brew • Tender reflections for a growing soul.*
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Export letter to markdown file
  const handleDownload = () => {
    if (!wrappedResult) return;
    const markdownContent = `# 🌸 Dearly Wrapped: ${wrappedResult.cupHeadline}
*Period: ${wrappedResult.periodLabel} (${wrappedResult.dateRangeStr}) | Reflections Analyzed: ${wrappedResult.entryCount}*

${wrappedResult.overallSummary}

---

## ☕ What Kept Coming Up
${wrappedResult.recurringThemes.map((t) => `- ${t}`).join('\n')}

## 🌸 Little Things That Made You Happy
${wrappedResult.joyfulMoments.map((j) => `- ${j}`).join('\n')}

## 🌧️ Things That Felt Heavy
${wrappedResult.heavyMoments.map((h) => `- ${h}`).join('\n')}

## ✨ Wins You May Have Forgotten
${wrappedResult.subtleWins.map((w) => `- ${w}`).join('\n')}

## 🌿 Patterns In Your Thoughts
${wrappedResult.patternsObserved.map((p) => `- ${p}`).join('\n')}

## 💭 Something To Think About
${wrappedResult.reflectionQuestions.map((q) => `- ${q}`).join('\n')}

---

## 💌 A Little Note From Dearly
${wrappedResult.closingNote}

*Dominant Aura: ${wrappedResult.dominantMood}*
*Metaphor: "${wrappedResult.flowerOrCupMetaphor}"*
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dearly-wrapped-${selectedPeriod}-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Soft backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-sm transition-opacity"
        />

        {/* Modal card styled like delicate parchment stationery */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{
            backgroundColor: '#FFFAF7',
            borderColor: theme.borderColor,
            boxShadow: `0 25px 50px -12px ${theme.glowColor}, 0 0 0 1px ${theme.subtleBorder}`,
          }}
          className="relative z-10 w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border overflow-hidden shadow-2xl transition-colors duration-300"
        >
          {/* Top Decorative Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${theme.badgeBg} 0%, #FFFFFF 100%)`,
              borderBottomColor: theme.subtleBorder,
            }}
            className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: theme.primary }}
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    style={{ color: theme.textHeading }}
                    className="font-serif font-bold text-lg tracking-tight"
                  >
                    Dearly Wrapped
                  </h3>
                  <span
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.primary,
                      borderColor: theme.borderColor,
                    }}
                    className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border tracking-wider"
                  >
                    🌸 Retrospective
                  </span>
                </div>
                <p style={{ color: theme.textMuted }} className="text-xs">
                  A tender letter weaving your thoughts, joys, and quiet growth over time.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{ color: theme.textMuted }}
              className="p-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
            {/* Period Selector Tabs */}
            <div
              style={{
                backgroundColor: theme.bgCanvas,
                borderColor: theme.borderColor,
              }}
              className="p-1.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPeriod('week');
                    setWrappedResult(null);
                  }}
                  style={{
                    backgroundColor: selectedPeriod === 'week' ? theme.primary : 'transparent',
                    color: selectedPeriod === 'week' ? '#FFFFFF' : theme.textBody,
                  }}
                  className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer shadow-2xs"
                >
                  This Week (7d)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPeriod('month');
                    setWrappedResult(null);
                  }}
                  style={{
                    backgroundColor: selectedPeriod === 'month' ? theme.primary : 'transparent',
                    color: selectedPeriod === 'month' ? '#FFFFFF' : theme.textBody,
                  }}
                  className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer shadow-2xs"
                >
                  This Month (30d)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPeriod('custom');
                    setWrappedResult(null);
                  }}
                  style={{
                    backgroundColor: selectedPeriod === 'custom' ? theme.primary : 'transparent',
                    color: selectedPeriod === 'custom' ? '#FFFFFF' : theme.textBody,
                  }}
                  className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer shadow-2xs"
                >
                  Custom Range
                </button>
              </div>

              {/* Status pill showing count */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium">
                <BookOpen className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                <span style={{ color: theme.textMuted }}>
                  {filteredEntries.length}{' '}
                  {filteredEntries.length === 1 ? 'reflection' : 'reflections'} found
                </span>
              </div>
            </div>

            {/* Custom Date Range Controls */}
            {selectedPeriod === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.borderColor,
                }}
                className="p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-3 text-xs"
              >
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span style={{ color: theme.textMuted }}>From:</span>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => {
                      setCustomStart(e.target.value);
                      setWrappedResult(null);
                    }}
                    style={{
                      borderColor: theme.borderColor,
                      color: theme.textBody,
                      backgroundColor: theme.bgCanvas,
                    }}
                    className="px-3 py-1.5 rounded-xl border focus:outline-hidden"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span style={{ color: theme.textMuted }}>To:</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => {
                      setCustomEnd(e.target.value);
                      setWrappedResult(null);
                    }}
                    style={{
                      borderColor: theme.borderColor,
                      color: theme.textBody,
                      backgroundColor: theme.bgCanvas,
                    }}
                    className="px-3 py-1.5 rounded-xl border focus:outline-hidden"
                  />
                </div>
                <span style={{ color: theme.textMuted }} className="sm:ml-auto text-[11px] italic">
                  {dateRangeStr}
                </span>
              </motion.div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="flex-1">{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="font-bold text-rose-600 hover:text-rose-900 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* If Not Generated Yet & Entries < 2 (Graceful Guidance State) */}
            {!wrappedResult && !isBrewing && filteredEntries.length < 2 && (
              <div
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.subtleBorder,
                }}
                className="text-center py-12 px-6 rounded-3xl border space-y-4 max-w-lg mx-auto"
              >
                <div
                  style={{
                    backgroundColor: theme.badgeBg,
                    borderColor: theme.borderColor,
                  }}
                  className="w-16 h-16 mx-auto rounded-3xl border flex items-center justify-center shadow-xs"
                >
                  <Coffee className="w-8 h-8" style={{ color: theme.primary }} />
                </div>

                <div className="space-y-1">
                  <h4
                    style={{ color: theme.textHeading }}
                    className="font-serif font-bold text-lg"
                  >
                    Dearly needs a little more to work with ☕
                  </h4>
                  <p
                    style={{ color: theme.textMuted }}
                    className="text-xs leading-relaxed max-w-md mx-auto"
                  >
                    To discover meaningful threads and gentle patterns in your thoughts, Dearly needs
                    at least <strong className="font-semibold text-[#5D4037]">2 journal entries</strong>{' '}
                    in this time window. You currently have{' '}
                    <strong className="font-semibold text-[#5D4037]">
                      {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                    </strong>
                    .
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  {onNewReflection && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNewReflection();
                      }}
                      style={{
                        backgroundColor: theme.primary,
                        boxShadow: `0 4px 14px -3px ${theme.primary}55`,
                      }}
                      className="px-5 py-2.5 rounded-full text-white text-xs font-medium cursor-pointer transition-transform hover:scale-105"
                    >
                      Write a New Entry 🌸
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPeriod('month');
                    }}
                    style={{
                      borderColor: theme.borderColor,
                      color: theme.textBody,
                      backgroundColor: theme.bgCanvas,
                    }}
                    className="px-4 py-2.5 rounded-full border text-xs font-medium cursor-pointer hover:bg-black/5"
                  >
                    Expand to This Month
                  </button>
                </div>
              </div>
            )}

            {/* Ready to Brew CTA */}
            {!wrappedResult && !isBrewing && filteredEntries.length >= 2 && (
              <div
                style={{
                  background: `linear-gradient(135deg, ${theme.badgeBg} 0%, #FFFFFF 100%)`,
                  borderColor: theme.borderColor,
                }}
                className="text-center py-12 px-6 rounded-3xl border space-y-5"
              >
                <div
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.borderColor,
                  }}
                  className="w-16 h-16 mx-auto rounded-3xl border flex items-center justify-center shadow-md animate-pulse"
                >
                  <Sparkles className="w-8 h-8" style={{ color: theme.primary }} />
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4
                    style={{ color: theme.textHeading }}
                    className="font-serif font-bold text-xl"
                  >
                    Your thoughts are ready to bloom
                  </h4>
                  <p style={{ color: theme.textMuted }} className="text-xs leading-relaxed">
                    Dearly will lovingly review your{' '}
                    <span className="font-semibold">{filteredEntries.length} reflections</span> from{' '}
                    <span className="font-semibold">{periodLabel}</span> and brew a cozy reflection
                    letter just for you.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBrewWrapped}
                  style={{
                    backgroundColor: theme.primary,
                    boxShadow: `0 8px 24px -6px ${theme.primary}66`,
                  }}
                  className="px-7 py-3 rounded-full text-white text-sm font-serif italic tracking-wide cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Brew Dearly Wrapped ☕</span>
                </button>
              </div>
            )}

            {/* Brewing Animation State */}
            {isBrewing && (
              <div className="py-20 text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                    style={{ borderColor: `${theme.primary}33`, borderTopColor: theme.primary }}
                    className="w-full h-full rounded-full border-4"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Coffee className="w-8 h-8 animate-bounce" style={{ color: theme.primary }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4
                    style={{ color: theme.textHeading }}
                    className="font-serif font-bold text-lg italic"
                  >
                    Steeping your thoughts with care...
                  </h4>
                  <p style={{ color: theme.textMuted }} className="text-xs max-w-xs mx-auto">
                    Reading your words, gathering your quiet wins, and pouring them into a warm little
                    cup ☕
                  </p>
                </div>
              </div>
            )}

            {/* Wrapped Letter Result Display */}
            {wrappedResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Letter Header Ribbon */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${theme.cardBg} 0%, #FFFFFF 100%)`,
                    borderColor: theme.borderColor,
                  }}
                  className="p-6 sm:p-8 rounded-3xl border text-center relative overflow-hidden shadow-sm"
                >
                  {/* Subtle top stamp */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span
                      style={{
                        backgroundColor: theme.badgeBg,
                        color: theme.primary,
                        borderColor: theme.borderColor,
                      }}
                      className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest border"
                    >
                      {wrappedResult.periodLabel} Reflection Letter
                    </span>
                    <span
                      style={{
                        backgroundColor: theme.badgeBg,
                        color: theme.textMuted,
                        borderColor: theme.borderColor,
                      }}
                      className="px-3 py-1 rounded-full text-[10px] font-medium border"
                    >
                      {wrappedResult.entryCount} Entries Analyzed
                    </span>
                  </div>

                  <h3
                    style={{ color: theme.textHeading }}
                    className="font-serif italic font-bold text-2xl sm:text-3xl tracking-tight mt-1"
                  >
                    "{wrappedResult.cupHeadline}"
                  </h3>

                  <p
                    style={{ color: theme.textMuted }}
                    className="text-xs sm:text-sm max-w-xl mx-auto mt-2 leading-relaxed"
                  >
                    {wrappedResult.overallSummary}
                  </p>

                  {wrappedResult.flowerOrCupMetaphor && (
                    <div
                      style={{
                        backgroundColor: theme.badgeBg,
                        borderColor: theme.borderColor,
                        color: theme.textHeading,
                      }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-serif italic mt-4 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                      <span>{wrappedResult.flowerOrCupMetaphor}</span>
                    </div>
                  )}
                </div>

                {/* The Letter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* What kept coming up */}
                  <div
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.borderColor,
                    }}
                    className="p-5 rounded-2xl border shadow-2xs space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: theme.badgeBg }}
                        className="w-7 h-7 rounded-xl flex items-center justify-center"
                      >
                        <Coffee className="w-4 h-4" style={{ color: theme.primary }} />
                      </div>
                      <h4
                        style={{ color: theme.textHeading }}
                        className="font-serif font-bold text-sm"
                      >
                        What kept coming up
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs" style={{ color: theme.textBody }}>
                      {wrappedResult.recurringThemes.map((themeItem, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span
                            style={{ color: theme.primary }}
                            className="font-bold text-sm leading-none"
                          >
                            •
                          </span>
                          <span className="leading-relaxed">{themeItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Little things that made you happy */}
                  <div
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.borderColor,
                    }}
                    className="p-5 rounded-2xl border shadow-2xs space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: theme.badgeBg }}
                        className="w-7 h-7 rounded-xl flex items-center justify-center"
                      >
                        <Sun className="w-4 h-4" style={{ color: theme.primary }} />
                      </div>
                      <h4
                        style={{ color: theme.textHeading }}
                        className="font-serif font-bold text-sm"
                      >
                        Little things that made you happy
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs" style={{ color: theme.textBody }}>
                      {wrappedResult.joyfulMoments.map((joy, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span
                            style={{ color: theme.primary }}
                            className="font-bold text-sm leading-none"
                          >
                            🌸
                          </span>
                          <span className="leading-relaxed">{joy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Things that felt heavy */}
                  <div
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.borderColor,
                    }}
                    className="p-5 rounded-2xl border shadow-2xs space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: theme.badgeBg }}
                        className="w-7 h-7 rounded-xl flex items-center justify-center"
                      >
                        <Feather className="w-4 h-4" style={{ color: theme.primary }} />
                      </div>
                      <h4
                        style={{ color: theme.textHeading }}
                        className="font-serif font-bold text-sm"
                      >
                        Things that felt heavy
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs" style={{ color: theme.textBody }}>
                      {wrappedResult.heavyMoments.map((heavy, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span
                            style={{ color: theme.textMuted }}
                            className="font-bold text-sm leading-none"
                          >
                            🌧️
                          </span>
                          <span className="leading-relaxed">{heavy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Wins you may have forgotten */}
                  <div
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.borderColor,
                    }}
                    className="p-5 rounded-2xl border shadow-2xs space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: theme.badgeBg }}
                        className="w-7 h-7 rounded-xl flex items-center justify-center"
                      >
                        <Heart className="w-4 h-4" style={{ color: theme.primary }} />
                      </div>
                      <h4
                        style={{ color: theme.textHeading }}
                        className="font-serif font-bold text-sm"
                      >
                        Wins you may have forgotten
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs" style={{ color: theme.textBody }}>
                      {wrappedResult.subtleWins.map((win, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span
                            style={{ color: theme.primary }}
                            className="font-bold text-sm leading-none"
                          >
                            ✨
                          </span>
                          <span className="leading-relaxed">{win}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Patterns in your thoughts */}
                  <div
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.borderColor,
                    }}
                    className="p-5 rounded-2xl border shadow-2xs space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: theme.badgeBg }}
                        className="w-7 h-7 rounded-xl flex items-center justify-center"
                      >
                        <RefreshCw className="w-4 h-4" style={{ color: theme.primary }} />
                      </div>
                      <h4
                        style={{ color: theme.textHeading }}
                        className="font-serif font-bold text-sm"
                      >
                        Patterns in your thoughts
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs" style={{ color: theme.textBody }}>
                      {wrappedResult.patternsObserved.map((pat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span
                            style={{ color: theme.primary }}
                            className="font-bold text-sm leading-none"
                          >
                            🌿
                          </span>
                          <span className="leading-relaxed">{pat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Something to think about */}
                  <div
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.borderColor,
                    }}
                    className="p-5 rounded-2xl border shadow-2xs space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: theme.badgeBg }}
                        className="w-7 h-7 rounded-xl flex items-center justify-center"
                      >
                        <Quote className="w-4 h-4" style={{ color: theme.primary }} />
                      </div>
                      <h4
                        style={{ color: theme.textHeading }}
                        className="font-serif font-bold text-sm"
                      >
                        Something to think about
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs" style={{ color: theme.textBody }}>
                      {wrappedResult.reflectionQuestions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span
                            style={{ color: theme.primary }}
                            className="font-bold text-sm leading-none"
                          >
                            💭
                          </span>
                          <span className="leading-relaxed italic">{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* A little note from Dearly */}
                <div
                  style={{
                    backgroundColor: theme.badgeBg,
                    borderColor: theme.borderColor,
                  }}
                  className="p-6 rounded-3xl border space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" style={{ color: theme.primary }} />
                    <h4
                      style={{ color: theme.textHeading }}
                      className="font-serif font-bold text-sm"
                    >
                      A little note from Dearly
                    </h4>
                  </div>
                  <p
                    style={{ color: theme.textBody }}
                    className="text-xs sm:text-sm leading-relaxed font-serif italic"
                  >
                    "{wrappedResult.closingNote}"
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px]">
                    <span style={{ color: theme.textMuted }}>
                      With warmth & coffee steam, Dearly • Bloom & Brew
                    </span>
                    <span
                      style={{ color: theme.primary }}
                      className="font-medium bg-white/70 px-2.5 py-0.5 rounded-full border border-white"
                    >
                      Dominant Aura: {wrappedResult.dominantMood}
                    </span>
                  </div>
                </div>

                {/* Footer Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBrewWrapped}
                    style={{
                      borderColor: theme.borderColor,
                      color: theme.textBody,
                      backgroundColor: theme.cardBg,
                    }}
                    className="px-4 py-2 rounded-full border text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:bg-black/5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-brew Letter</span>
                  </button>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={handleCopy}
                      style={{
                        borderColor: theme.borderColor,
                        color: theme.textBody,
                        backgroundColor: theme.cardBg,
                      }}
                      className="px-4 py-2 rounded-full border text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:bg-black/5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Letter</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      style={{
                        backgroundColor: theme.primary,
                        boxShadow: `0 4px 14px -3px ${theme.primary}55`,
                      }}
                      className="px-5 py-2 rounded-full text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Letter (.md)</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
