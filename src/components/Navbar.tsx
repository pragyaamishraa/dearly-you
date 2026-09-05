import React from 'react';
import { motion } from 'motion/react';
import { Palette, BookOpen, Sparkles, LogOut, PlusCircle, Coffee } from 'lucide-react';
import { ThemeOption, UserProfile } from '../types';

interface NavbarProps {
  theme: ThemeOption;
  user: UserProfile | null;
  entryCount: number;
  onOpenThemeModal: () => void;
  onOpenPromptsModal: () => void;
  onOpenHistory: () => void;
  onOpenWrapped: () => void;
  onNewReflection: () => void;
  onSignOut: () => void;
  isHistoryOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  user,
  entryCount,
  onOpenThemeModal,
  onOpenPromptsModal,
  onOpenHistory,
  onOpenWrapped,
  onNewReflection,
  onSignOut,
  isHistoryOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-4">
      <div
        style={{
          borderColor: theme.subtleBorder,
          boxShadow: `0 10px 30px -15px ${theme.glowColor}`,
        }}
        className="max-w-7xl mx-auto flex items-center justify-between bg-white/90 backdrop-blur-md px-5 sm:px-7 py-3 rounded-full border transition-all duration-300"
      >
        {/* Brand */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={onNewReflection}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div
            style={{ backgroundColor: theme.primary }}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner transition-colors duration-300"
          >
            <div
              className="w-5 h-5 bg-white rounded-full opacity-80"
              style={{ clipPath: 'ellipse(50% 40% at 50% 50%)' }}
            />
          </div>
          <div>
            <span
              style={{ color: theme.textHeading }}
              className="text-xl font-bold tracking-tight font-serif block transition-colors duration-300"
            >
              Dearly
            </span>
            <span
              style={{ color: theme.textMuted }}
              className="text-[10px] block -mt-0.5 tracking-wide transition-colors duration-300"
            >
              Bloom & Brew • {theme.name}
            </span>
          </div>
        </motion.div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* New Entry Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onNewReflection}
            style={{
              backgroundColor: theme.primary,
              boxShadow: `0 4px 14px -3px ${theme.primary}66`,
            }}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-white cursor-pointer transition-all duration-300"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Blossom</span>
          </motion.button>

          {/* Daily Prompts */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenPromptsModal}
            title="Daily Thoughtful Sparks"
            style={{
              borderColor: theme.borderColor,
              color: theme.textBody,
              backgroundColor: theme.badgeBg,
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border cursor-pointer transition-all duration-300 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            <span className="hidden sm:inline">Daily Spark</span>
          </motion.button>

          {/* Dearly Wrapped Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenWrapped}
            title="Dearly Wrapped: Weekly & Monthly Reflections"
            style={{
              borderColor: theme.borderColor,
              color: theme.textHeading,
              background: `linear-gradient(135deg, ${theme.badgeBg} 0%, #FFFFFF 100%)`,
            }}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full text-xs font-medium border cursor-pointer transition-all duration-300 shadow-2xs"
          >
            <Coffee className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            <span className="hidden sm:inline">Wrapped</span>
            <span
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.primary,
                borderColor: theme.borderColor,
              }}
              className="text-[10px] px-1.5 py-0.2 rounded-full border font-bold"
            >
              🌸
            </span>
          </motion.button>

          {/* History Drawer Toggle */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenHistory}
            title="Past Reflections"
            style={{
              backgroundColor: isHistoryOpen ? theme.badgeBg : 'white',
              borderColor: isHistoryOpen ? theme.primary : theme.borderColor,
              color: isHistoryOpen ? theme.textHeading : theme.textBody,
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border cursor-pointer transition-all duration-300 shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            <span className="hidden sm:inline">Reflections</span>
            {entryCount > 0 && (
              <span
                style={{ backgroundColor: theme.primary }}
                className="px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white"
              >
                {entryCount}
              </span>
            )}
          </motion.button>

          {/* Theme Switcher */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenThemeModal}
            title="Design Palette"
            style={{
              borderColor: theme.borderColor,
              backgroundColor: theme.badgeBg,
              color: theme.primary,
            }}
            className="p-2.5 rounded-full border cursor-pointer transition-all duration-300 shadow-2xs"
          >
            <Palette className="w-3.5 h-3.5" />
          </motion.button>

          {/* User Profile & Sign Out */}
          {user && (
            <div
              style={{ borderLeftColor: theme.subtleBorder }}
              className="flex items-center pl-2 border-l ml-1 gap-2"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  style={{ backgroundColor: theme.badgeBg, color: theme.primary }}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold"
                >
                  {(user.displayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              <div className="hidden sm:block text-left">
                <p
                  style={{ color: theme.textHeading }}
                  className="text-xs font-bold leading-none transition-colors duration-300"
                >
                  {user.displayName?.split(' ')[0] || 'Member'}
                </p>
                <p
                  style={{ color: theme.textMuted }}
                  className="text-[10px] mt-0.5 transition-colors duration-300"
                >
                  Bloom & Brew
                </p>
              </div>

              <motion.button
                id="logout-button"
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSignOut();
                }}
                title="Log Out"
                aria-label="Log Out"
                style={{ color: theme.textMuted }}
                className="p-2 rounded-full hover:opacity-80 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
