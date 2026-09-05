import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { DailyPrompt, ThemeOption } from '../types';

interface DailyPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: DailyPrompt[];
  onSelectPrompt: (promptText: string) => void;
  theme: ThemeOption;
}

export const DailyPromptsModal: React.FC<DailyPromptsModalProps> = ({
  isOpen,
  onClose,
  prompts,
  onSelectPrompt,
  theme,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/25 backdrop-blur-xs transition-opacity"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.borderColor,
              boxShadow: `0 25px 50px -12px ${theme.glowColor}`,
            }}
            className="relative w-full max-w-lg rounded-[32px] p-6 sm:p-8 border max-h-[85vh] flex flex-col z-10 transition-colors duration-300"
          >
            {/* Header */}
            <div
              style={{ borderBottomColor: theme.subtleBorder }}
              className="flex items-center justify-between pb-4 border-b shrink-0"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: theme.primary }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner text-white"
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    style={{ color: theme.textHeading }}
                    className="font-serif font-bold text-lg"
                  >
                    Daily Mindful Sparks
                  </h3>
                  <p
                    style={{ color: theme.textMuted }}
                    className="text-xs"
                  >
                    Gentle thoughts to inspire your reflection today
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{ color: theme.textMuted }}
                className="p-2 rounded-xl hover:opacity-80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {prompts.map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.015 }}
                  style={{
                    backgroundColor: theme.bgCanvas,
                    borderColor: theme.borderColor,
                  }}
                  className="p-4 rounded-2xl border shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
                  onClick={() => {
                    onSelectPrompt(p.prompt);
                    onClose();
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      style={{ color: theme.textMuted }}
                      className="text-[10px] uppercase tracking-widest font-bold"
                    >
                      {p.category}
                    </span>
                    <span
                      style={{
                        backgroundColor: theme.badgeBg,
                        color: theme.primary,
                        borderColor: theme.borderColor,
                      }}
                      className="text-xs capitalize px-2.5 py-0.5 rounded-full font-medium border"
                    >
                      {p.mood}
                    </span>
                  </div>
                  <p
                    style={{ color: theme.textHeading }}
                    className="text-sm font-normal leading-relaxed mb-2 font-serif italic"
                  >
                    "{p.prompt}"
                  </p>
                  <div
                    style={{ color: theme.textMuted }}
                    className="flex items-center text-xs font-semibold group-hover:opacity-100 transition-colors gap-1"
                  >
                    <span style={{ color: theme.primary }}>Use this prompt</span>
                    <ArrowRight
                      className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
                      style={{ color: theme.primary }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
