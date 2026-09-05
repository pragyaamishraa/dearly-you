import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Palette, Check, Sparkles } from 'lucide-react';
import { ThemeOption } from '../types';
import { THEME_OPTIONS } from '../lib/themes';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeOption;
  onSelectTheme: (theme: ThemeOption) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  onSelectTheme,
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
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            style={{
              backgroundColor: activeTheme.cardBg,
              borderColor: activeTheme.borderColor,
              boxShadow: `0 25px 50px -12px ${activeTheme.glowColor}`,
            }}
            className="relative w-full max-w-lg rounded-[32px] p-6 sm:p-8 border z-10 max-h-[90vh] flex flex-col transition-colors duration-300"
          >
            {/* Header */}
            <div
              style={{ borderBottomColor: activeTheme.subtleBorder }}
              className="flex items-center justify-between pb-4 border-b shrink-0"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: activeTheme.primary }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner text-white transition-colors duration-300"
                >
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    style={{ color: activeTheme.textHeading }}
                    className="font-serif font-bold text-lg transition-colors duration-300"
                  >
                    Aesthetic Palette Themes
                  </h3>
                  <p
                    style={{ color: activeTheme.textMuted }}
                    className="text-xs transition-colors duration-300"
                  >
                    Choose your latte art & bloom ambiance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{ color: activeTheme.textMuted }}
                className="p-2 rounded-xl hover:opacity-80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Themes List */}
            <div className="py-4 space-y-3 overflow-y-auto flex-1 pr-1">
              {THEME_OPTIONS.map((th) => {
                const isSelected = activeTheme.id === th.id;
                return (
                  <motion.div
                    key={th.id}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => {
                      onSelectTheme(th);
                    }}
                    style={{
                      backgroundColor: isSelected ? th.badgeBg : th.cardBg,
                      borderColor: isSelected ? th.primary : th.borderColor,
                      boxShadow: isSelected ? `0 4px 14px -3px ${th.primary}44` : 'none',
                    }}
                    className="p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          style={{ color: th.textHeading }}
                          className="font-serif font-bold text-sm"
                        >
                          {th.name}
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              backgroundColor: th.primary,
                              color: '#FFFFFF',
                            }}
                            className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                      <p
                        style={{ color: th.textBody }}
                        className="text-xs font-light leading-relaxed"
                      >
                        {th.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                      {/* Color Palette Chips Preview */}
                      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/70 border border-black/5">
                        <div
                          title="Primary Roast"
                          className="w-5 h-5 rounded-full shadow-2xs border border-white"
                          style={{ backgroundColor: th.primary }}
                        />
                        <div
                          title="Blossom Accent"
                          className="w-5 h-5 rounded-full shadow-2xs border border-white"
                          style={{ backgroundColor: th.accent }}
                        />
                        <div
                          title="Deep Tone"
                          className="w-5 h-5 rounded-full shadow-2xs border border-white"
                          style={{ backgroundColor: th.secondary }}
                        />
                        <div
                          title="Milk Canvas"
                          className="w-5 h-5 rounded-full shadow-2xs border border-black/10"
                          style={{ backgroundColor: th.bgCanvas }}
                        />
                      </div>

                      {isSelected ? (
                        <div
                          style={{ backgroundColor: th.primary }}
                          className="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-sm shrink-0"
                        >
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          style={{
                            borderColor: th.borderColor,
                            color: th.primary,
                            backgroundColor: th.badgeBg,
                          }}
                          className="px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer hover:opacity-90"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer Tip */}
            <div
              style={{ borderTopColor: activeTheme.subtleBorder }}
              className="pt-3 border-t flex items-center justify-between text-xs shrink-0"
            >
              <span style={{ color: activeTheme.textMuted }}>
                Changes ambiance, buttons, backgrounds & reflections instantly.
              </span>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: activeTheme.primary,
                  color: '#FFFFFF',
                }}
                className="px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
