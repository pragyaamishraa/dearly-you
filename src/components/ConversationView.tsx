import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Send,
  Coffee,
  Bookmark,
  Copy,
  Check,
  Tag,
  Clock,
  RefreshCw,
  PlusCircle,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { JournalInteraction, ThemeOption } from '../types';
import { TypewriterText } from './TypewriterText';
import confetti from 'canvas-confetti';

interface ConversationViewProps {
  theme: ThemeOption;
  interaction: JournalInteraction;
  onSendMessage: (text: string) => Promise<void>;
  onGenerateSummary: () => Promise<void>;
  onNewEntry: () => void;
  isLoading: boolean;
  isSummarizing: boolean;
  onTriggerMoodEffect?: (moodName: string) => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  theme,
  interaction,
  onSendMessage,
  onGenerateSummary,
  onNewEntry,
  isLoading,
  isSummarizing,
  onTriggerMoodEffect,
}) => {
  const [replyInput, setReplyInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interaction.conversation.length, isLoading]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || isLoading) return;
    const msg = replyInput.trim();
    setReplyInput('');
    await onSendMessage(msg);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSummaryClick = async () => {
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.5 },
      colors: theme.particleColors,
    });
    await onGenerateSummary();
  };

  return (
    <div className="w-full space-y-6">
      {/* Reflection Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: theme.badgeBg,
          borderColor: theme.borderColor,
          boxShadow: `0 15px 35px -15px ${theme.glowColor}`,
        }}
        className="w-full rounded-[32px] p-6 sm:p-8 border relative overflow-hidden transition-all duration-300"
      >
        {/* Decorative corner blossom orb from design */}
        <div
          style={{ backgroundColor: theme.cardBg }}
          className="absolute top-0 right-0 w-28 h-28 opacity-40 rounded-full -mr-12 -mt-12 pointer-events-none"
        />

        <div
          style={{ borderBottomColor: theme.subtleBorder }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b relative z-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => onTriggerMoodEffect?.(interaction.mood || 'Calm')}
                title="Click to replay this entry's mood aesthetic atmosphere"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.borderColor,
                  color: theme.primary,
                }}
                className="px-3.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-all group"
              >
                <Bookmark className="w-3 h-3" style={{ color: theme.primary }} />
                <span className="capitalize">{interaction.mood || 'Calm Mood'}</span>
                <span className="text-[10px] opacity-75 group-hover:animate-spin">✨</span>
              </button>
              <span
                style={{ color: theme.textMuted }}
                className="text-xs flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(interaction.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>
              {interaction.modelUsed && (
                <span
                  style={{
                    backgroundColor: theme.bgCanvas,
                    borderColor: theme.subtleBorder,
                    color: theme.textMuted,
                  }}
                  className="text-[10px] px-2.5 py-0.5 rounded-full font-mono border"
                >
                  {interaction.modelUsed}
                </span>
              )}
            </div>
            <h2
              style={{ color: theme.textHeading }}
              className="text-2xl sm:text-3xl font-serif italic tracking-tight"
            >
              {interaction.title || 'Gemini’s Reflection'}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {!interaction.summary && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleSummaryClick}
                disabled={isSummarizing}
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.borderColor,
                  color: theme.primary,
                }}
                className="px-4 py-2 rounded-full text-xs font-medium border hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                {isSummarizing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: theme.primary }} />
                    <span>Brewing Summary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                    <span>Generate AI Summary</span>
                  </>
                )}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onNewEntry}
              style={{
                backgroundColor: theme.primary,
                color: '#FFFFFF',
                boxShadow: `0 4px 14px -3px ${theme.primary}55`,
              }}
              className="px-4 py-2 rounded-full text-xs font-medium hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Blossom</span>
            </motion.button>
          </div>
        </div>

        {/* AI Summary and Takeaways Box */}
        {interaction.summary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.borderColor,
            }}
            className="mt-5 p-5 rounded-[24px] border shadow-2xs relative z-10"
          >
            <div
              style={{ color: theme.textMuted }}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-2"
            >
              <FileText className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              <span>Gemini Empathetic Synopsis</span>
            </div>
            <p
              style={{ color: theme.textBody }}
              className="text-sm leading-relaxed mb-3 font-normal"
            >
              {interaction.summary}
            </p>

            {interaction.takeaways && interaction.takeaways.length > 0 && (
              <div
                style={{ borderTopColor: theme.subtleBorder }}
                className="mt-3 pt-3 border-t"
              >
                <span
                  style={{ color: theme.textMuted }}
                  className="text-xs font-semibold block mb-1.5"
                >
                  Mindful Takeaways:
                </span>
                <ul className="space-y-1">
                  {interaction.takeaways.map((takeaway, idx) => (
                    <li
                      key={idx}
                      style={{ color: theme.textBody }}
                      className="text-xs flex items-start gap-2"
                    >
                      <span style={{ color: theme.primary }} className="font-bold">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {interaction.tags && interaction.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-2">
                {interaction.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: theme.bgCanvas,
                      borderColor: theme.borderColor,
                      color: theme.textMuted,
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
                  >
                    <Tag className="w-2.5 h-2.5" style={{ color: theme.primary }} />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Mood Map Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.borderColor,
          boxShadow: `0 10px 25px -10px ${theme.glowColor}`,
        }}
        className="w-full border rounded-[32px] p-6 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            style={{ color: theme.textMuted }}
            className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <TrendingUp className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            <span>Weekly Mood & Energy Rhythm</span>
          </h3>
          <span
            style={{ color: theme.textMuted }}
            className="text-[11px] font-mono"
          >
            Current: {interaction.mood || 'Calm'}
          </span>
        </div>
        <div className="flex items-end justify-between h-20 px-4 pt-2">
          <div className="flex flex-col items-center gap-2">
            <div
              style={{ backgroundColor: theme.accent }}
              className="w-7 rounded-t-full h-10 transition-all hover:opacity-80"
            />
            <span style={{ color: theme.textMuted }} className="text-[10px] font-bold">M</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              style={{ backgroundColor: theme.subtleBorder }}
              className="w-7 rounded-t-full h-14 transition-all hover:opacity-80"
            />
            <span style={{ color: theme.textMuted }} className="text-[10px] font-bold">T</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              style={{ backgroundColor: theme.primary }}
              className="w-7 rounded-t-full h-18 shadow-sm transition-all hover:opacity-80"
            />
            <span style={{ color: theme.primary }} className="text-[10px] font-bold">W</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              style={{ backgroundColor: theme.accent }}
              className="w-7 rounded-t-full h-12 transition-all hover:opacity-80"
            />
            <span style={{ color: theme.textMuted }} className="text-[10px] font-bold">T</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              style={{ backgroundColor: theme.subtleBorder }}
              className="w-7 rounded-t-full h-8 transition-all hover:opacity-80"
            />
            <span style={{ color: theme.textMuted }} className="text-[10px] font-bold">F</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              style={{ backgroundColor: theme.primary }}
              className="w-7 rounded-t-full h-16 shadow-sm transition-all hover:opacity-80"
            />
            <span style={{ color: theme.textMuted }} className="text-[10px] font-bold">S</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              style={{ backgroundColor: theme.badgeBg, borderColor: theme.borderColor }}
              className="w-7 rounded-t-full h-11 transition-all hover:opacity-80 border"
            />
            <span style={{ color: theme.textMuted }} className="text-[10px] font-bold">S</span>
          </div>
        </div>
      </motion.div>

      {/* Multi-turn Conversation Dialogue */}
      <div className="space-y-4">
        {interaction.conversation.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isLatestModel = !isUser && index === interaction.conversation.length - 1;

          return (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div
                  style={{ backgroundColor: theme.primary }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner mt-1 text-white"
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full opacity-80"
                    style={{ clipPath: 'ellipse(50% 40% at 50% 50%)' }}
                  />
                </div>
              )}

              <div
                style={{
                  backgroundColor: isUser ? theme.primary : theme.cardBg,
                  color: isUser ? '#FFFFFF' : theme.textBody,
                  borderColor: isUser ? 'transparent' : theme.borderColor,
                  boxShadow: isUser
                    ? `0 8px 20px -5px ${theme.primary}44`
                    : `0 4px 15px -3px ${theme.glowColor}`,
                }}
                className={`relative max-w-2xl p-6 rounded-[28px] leading-relaxed border ${
                  isUser ? 'rounded-br-xs' : 'rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2 opacity-80 text-xs font-medium">
                  <span className={isUser ? 'text-white/90' : ''} style={{ color: isUser ? '#FFFFFF' : theme.textMuted }}>
                    {isUser ? 'You' : 'Dearly (Gemini)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.text, msg.id || String(index))}
                      className="hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                      title="Copy message"
                    >
                      {copiedId === (msg.id || String(index)) ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <span className="text-[11px] opacity-75">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {isLatestModel ? (
                  <TypewriterText text={msg.text} speed={8} />
                ) : (
                  <div className="whitespace-pre-wrap text-sm sm:text-base font-light">
                    {msg.text}
                  </div>
                )}
              </div>

              {isUser && (
                <div
                  style={{
                    backgroundColor: theme.badgeBg,
                    borderColor: theme.borderColor,
                    color: theme.primary,
                  }}
                  className="w-10 h-10 rounded-full border-2 shadow-sm flex items-center justify-center shrink-0 mt-1 text-xs font-bold"
                >
                  You
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 justify-start"
          >
            <div
              style={{ backgroundColor: theme.primary }}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner text-white"
            >
              <Coffee className="w-4 h-4 animate-steam" />
            </div>
            <div
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.borderColor,
                color: theme.textMuted,
              }}
              className="p-4 rounded-2xl border flex items-center gap-2 text-xs shadow-2xs"
            >
              <span
                style={{ backgroundColor: theme.primary }}
                className="w-2 h-2 rounded-full animate-bounce"
              />
              <span
                style={{ backgroundColor: theme.primary }}
                className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]"
              />
              <span
                style={{ backgroundColor: theme.primary }}
                className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s]"
              />
              <span className="ml-2 font-medium">Brewing a thoughtful reflection with Gemini...</span>
            </div>
          </motion.div>
        )}

        <div ref={scrollEndRef} />
      </div>

      {/* Multi-turn Reply Input */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleReplySubmit}
        className="sticky bottom-4 z-30 max-w-3xl mx-auto w-full"
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: theme.borderColor,
            boxShadow: `0 10px 30px -15px ${theme.glowColor}`,
          }}
          className="relative flex items-center backdrop-blur-md rounded-full border p-2"
        >
          <input
            id="multi-turn-reply-input"
            type="text"
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            disabled={isLoading}
            placeholder="Reply to Gemini... explore how to maintain that calm..."
            style={{ color: theme.textBody }}
            className="flex-1 px-4 py-2 text-sm placeholder:opacity-50 focus:outline-hidden bg-transparent"
          />

          <motion.button
            id="multi-turn-send-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || !replyInput.trim()}
            style={{
              backgroundColor: theme.primary,
              color: '#FFFFFF',
              boxShadow: `0 4px 14px -3px ${theme.primary}55`,
            }}
            className="px-6 py-2.5 rounded-full font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};
