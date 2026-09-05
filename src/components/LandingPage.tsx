import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, ShieldCheck, Feather, ArrowRight, X, Palette } from 'lucide-react';
import { ThemeOption } from '../types';
import confetti from 'canvas-confetti';

interface LandingPageProps {
  theme: ThemeOption;
  onSignIn: () => Promise<void>;
  onGuestExplore?: (name?: string) => void;
  onOpenThemeModal?: () => void;
  isLoading: boolean;
  error: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  onSignIn,
  onGuestExplore,
  onOpenThemeModal,
  isLoading,
  error,
}) => {
  const [signingIn, setSigningIn] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');

  const handleSignInClick = async () => {
    try {
      setSigningIn(true);
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: theme.particleColors,
      });
      await onSignIn();
    } catch {
      // Error handled by parent
    } finally {
      setSigningIn(false);
    }
  };

  const handleConfirmGuestName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = guestName.trim();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: theme.particleColors,
    });
    setIsNameModalOpen(false);
    onGuestExplore?.(trimmed || 'Friend');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-4 sm:px-8 py-10 z-10">
      {/* Header Brand */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div
            style={{ backgroundColor: theme.primary }}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-inner text-white transition-colors duration-300"
          >
            <div
              className="w-5 h-5 bg-white rounded-full opacity-80"
              style={{ clipPath: 'ellipse(50% 40% at 50% 50%)' }}
            />
          </div>
          <div>
            <span
              style={{ color: theme.textHeading }}
              className="text-xl sm:text-2xl font-bold tracking-tight font-serif block transition-colors duration-300"
            >
              Dearly
            </span>
            <span
              style={{ color: theme.textMuted }}
              className="text-[10px] uppercase tracking-widest font-bold block transition-colors duration-300"
            >
              Bloom & Brew • {theme.name}
            </span>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          {onOpenThemeModal && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onOpenThemeModal}
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.borderColor,
                color: theme.primary,
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold shadow-2xs cursor-pointer transition-colors duration-300"
              title="Change Aesthetic Palette"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Palette</span>
            </motion.button>
          )}

          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.subtleBorder,
            }}
            className="flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-full border shadow-2xs transition-colors duration-300"
          >
            <span
              style={{ backgroundColor: theme.primary }}
              className="w-2 h-2 rounded-full animate-pulse"
            />
            <span style={{ color: theme.textBody }}>Gemini 3.6 Flash</span>
          </div>
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="max-w-4xl mx-auto w-full my-auto py-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.borderColor,
            boxShadow: `0 20px 40px -15px ${theme.glowColor}`,
          }}
          className="relative w-full max-w-2xl rounded-[40px] p-8 sm:p-14 border transition-all duration-300"
        >
          {/* Subtle Decorative Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              backgroundColor: theme.badgeBg,
              borderColor: theme.borderColor,
              color: theme.primary,
            }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border transition-colors duration-300"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            <span>Turn Your Thoughts into Blossoms</span>
          </motion.div>

          <h1
            style={{ color: theme.textHeading }}
            className="text-3xl sm:text-5xl font-normal tracking-tight font-serif italic leading-tight mb-4 transition-colors duration-300"
          >
            Pour your thoughts like warm milk into morning coffee.
          </h1>

          <p
            style={{ color: theme.textBody }}
            className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8 font-light transition-colors duration-300"
          >
            Capture your reflections in a cozy, calming journal. Converse with Gemini for empathetic
            insights, gentle synopses, and daily sparks — with every thought privately safeguarded in
            Cloud Firestore.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl text-xs bg-rose-50 text-rose-800 border border-rose-200 text-left flex items-start gap-2"
            >
              <span className="font-bold">Notice:</span>
              <span>{error}</span>
            </motion.div>
          )}

          {/* Primary Action: Google Sign In & Demo Session */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              id="google-signin-button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignInClick}
              disabled={isLoading || signingIn}
              style={{
                backgroundColor: theme.primary,
                color: '#FFFFFF',
                boxShadow: `0 8px 24px -4px ${theme.primary}55`,
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full text-sm font-medium transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#FFF"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#FFF"
                  opacity="0.9"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FFF"
                  opacity="0.8"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#FFF"
                  opacity="0.95"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading || signingIn ? 'Connecting...' : 'Sign in with Google'}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </motion.button>

            {onGuestExplore && (
              <motion.button
                id="try-demo-session-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsNameModalOpen(true)}
                style={{
                  backgroundColor: theme.bgCanvas,
                  borderColor: theme.borderColor,
                  color: theme.textBody,
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium border hover:opacity-90 transition-all cursor-pointer shadow-2xs"
              >
                <Feather className="w-4 h-4" style={{ color: theme.primary }} />
                <span>Try Demo Session</span>
              </motion.button>
            )}
          </div>

          {/* Privacy & Architecture Features */}
          <div
            style={{ borderTopColor: theme.subtleBorder }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t text-left"
          >
            <div className="flex items-start gap-3">
              <div
                style={{
                  backgroundColor: theme.badgeBg,
                  borderColor: theme.borderColor,
                }}
                className="w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0"
              >
                <ShieldCheck className="w-4 h-4" style={{ color: theme.primary }} />
              </div>
              <div>
                <h4 style={{ color: theme.textHeading }} className="text-xs font-bold">
                  Private Firestore Vault
                </h4>
                <p style={{ color: theme.textMuted }} className="text-[11px] leading-relaxed mt-0.5">
                  Strict user-isolated security rules ensure only you can access your reflections.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                style={{
                  backgroundColor: theme.badgeBg,
                  borderColor: theme.borderColor,
                }}
                className="w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0"
              >
                <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
              </div>
              <div>
                <h4 style={{ color: theme.textHeading }} className="text-xs font-bold">
                  Gemini 3.6 Flash
                </h4>
                <p style={{ color: theme.textMuted }} className="text-[11px] leading-relaxed mt-0.5">
                  Empathetic multi-turn reflections with automated model fallback resilience.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                style={{
                  backgroundColor: theme.badgeBg,
                  borderColor: theme.borderColor,
                }}
                className="w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0"
              >
                <Heart className="w-4 h-4" style={{ color: theme.primary }} />
              </div>
              <div>
                <h4 style={{ color: theme.textHeading }} className="text-xs font-bold">
                  Aesthetic Palettes
                </h4>
                <p style={{ color: theme.textMuted }} className="text-[11px] leading-relaxed mt-0.5">
                  6 harmonious palettes from Sakura Latte to Kyoto Matcha and Golden Chai.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Demo Name Modal */}
      <AnimatePresence>
        {isNameModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNameModalOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs"
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
              className="relative w-full max-w-md rounded-[32px] p-6 sm:p-8 border z-10"
            >
              <div
                style={{ borderBottomColor: theme.subtleBorder }}
                className="flex items-center justify-between pb-4 border-b"
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: theme.primary }}
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner text-white"
                  >
                    <Feather className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      style={{ color: theme.textHeading }}
                      className="font-serif font-bold text-lg"
                    >
                      Welcome to Dearly
                    </h3>
                    <p style={{ color: theme.textMuted }} className="text-xs">
                      Bloom & Brew • Enter your name to begin your mindful demo
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNameModalOpen(false)}
                  style={{ color: theme.textMuted }}
                  className="p-2 rounded-xl hover:opacity-80 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmGuestName} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="guest-name-input"
                    style={{ color: theme.primary }}
                    className="block text-xs font-bold uppercase tracking-wider mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    id="guest-name-input"
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your name (e.g. Maya, Elena, Alex...)"
                    autoFocus
                    maxLength={40}
                    style={{
                      backgroundColor: theme.bgCanvas,
                      borderColor: theme.borderColor,
                      color: theme.textBody,
                    }}
                    className="w-full px-4 py-3 rounded-2xl border outline-none text-sm placeholder:opacity-50"
                  />
                  <p style={{ color: theme.textMuted }} className="text-[11px] mt-1.5">
                    Your journal will address you by this name and personalize your experience.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsNameModalOpen(false)}
                    style={{ color: theme.textMuted }}
                    className="px-5 py-2.5 rounded-full text-xs font-medium hover:opacity-80 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="confirm-demo-name-button"
                    style={{
                      backgroundColor: theme.primary,
                      color: '#FFFFFF',
                      boxShadow: `0 4px 14px -3px ${theme.primary}55`,
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>Enter Journal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer
        style={{ color: theme.textMuted }}
        className="max-w-6xl mx-auto w-full text-center py-4 text-xs transition-colors duration-300"
      >
        <p>
          Crafted with mindful care • {theme.name} Ambiance
        </p>
      </footer>
    </div>
  );
};
