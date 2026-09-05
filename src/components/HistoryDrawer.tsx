import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  BookOpen,
  Calendar,
  Trash2,
  ChevronRight,
  Filter,
  Download,
} from 'lucide-react';
import { JournalInteraction, ThemeOption } from '../types';
import { MOOD_OPTIONS } from '../lib/themes';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  interactions: JournalInteraction[];
  onSelectInteraction: (interaction: JournalInteraction) => void;
  onDeleteInteraction: (id: string) => Promise<void>;
  theme: ThemeOption;
  activeInteractionId?: string;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  interactions,
  onSelectInteraction,
  onDeleteInteraction,
  theme,
  activeInteractionId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredInteractions = interactions.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.initialEntry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesMood =
      selectedMoodFilter === 'all' || item.mood.toLowerCase() === selectedMoodFilter.toLowerCase();

    return matchesSearch && matchesMood;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this journal reflection?')) {
      setDeletingId(id);
      try {
        await onDeleteInteraction(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleExportAll = () => {
    const markdownContent = interactions
      .map(
        (i) => `## ${i.title || 'Journal Reflection'}
*Date: ${new Date(i.createdAt).toLocaleString()} | Mood: ${i.mood}*

### Reflection:
${i.initialEntry}

### Gemini Insights:
${i.geminiResponse}

${i.summary ? `### Summary:\n${i.summary}\n` : ''}
---
`
      )
      .join('\n\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloom-and-brew-reflections-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/25 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Drawer Panel matching Dynamic Theme */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              backgroundColor: theme.badgeBg,
              borderLeftColor: theme.borderColor,
            }}
            className="fixed top-0 right-0 h-full w-full max-w-md shadow-2xl z-50 flex flex-col border-l overflow-hidden transition-colors duration-300"
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: theme.cardBg,
                borderBottomColor: theme.subtleBorder,
              }}
              className="p-6 border-b flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: theme.primary }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner text-white"
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    style={{ color: theme.textHeading }}
                    className="font-serif font-bold text-lg"
                  >
                    Recent Reflections
                  </h3>
                  <p
                    style={{ color: theme.textMuted }}
                    className="text-[11px]"
                  >
                    {interactions.length} {interactions.length === 1 ? 'reflection' : 'reflections'} preserved
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {interactions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportAll}
                    title="Export All to Markdown"
                    style={{ color: theme.textMuted }}
                    className="p-2 rounded-xl hover:opacity-80 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  style={{ color: theme.textMuted }}
                  className="p-2 rounded-xl hover:opacity-80 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div
              style={{
                backgroundColor: theme.cardBg,
                borderBottomColor: theme.subtleBorder,
              }}
              className="p-5 border-b space-y-3"
            >
              <div className="relative">
                <Search
                  className="w-4 h-4 absolute left-3 top-2.5"
                  style={{ color: theme.textMuted }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search thoughts, blossoms, or tags..."
                  style={{
                    backgroundColor: theme.bgCanvas,
                    borderColor: theme.borderColor,
                    color: theme.textBody,
                  }}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-hidden placeholder:opacity-50"
                />
              </div>

              {/* Mood Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedMoodFilter('all')}
                  style={{
                    backgroundColor: selectedMoodFilter === 'all' ? theme.primary : theme.bgCanvas,
                    color: selectedMoodFilter === 'all' ? '#FFFFFF' : theme.textBody,
                    borderColor: selectedMoodFilter === 'all' ? theme.primary : theme.borderColor,
                  }}
                  className="px-3 py-1 rounded-full shrink-0 font-medium transition-colors cursor-pointer text-[11px] border shadow-2xs"
                >
                  All Moods
                </button>

                {MOOD_OPTIONS.map((m) => {
                  const isSelected = selectedMoodFilter === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMoodFilter(m.id)}
                      style={{
                        backgroundColor: isSelected ? theme.primary : theme.bgCanvas,
                        color: isSelected ? '#FFFFFF' : theme.textBody,
                        borderColor: isSelected ? theme.primary : theme.borderColor,
                      }}
                      className="px-3 py-1 rounded-full shrink-0 font-medium transition-colors cursor-pointer text-[11px] flex items-center gap-1 border shadow-2xs"
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Entries List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <p
                style={{ color: theme.textMuted }}
                className="text-[10px] uppercase tracking-widest font-bold"
              >
                Archive Timeline
              </p>

              {filteredInteractions.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div
                    style={{ backgroundColor: theme.cardBg }}
                    className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 shadow-2xs"
                  >
                    <Filter className="w-5 h-5" style={{ color: theme.primary }} />
                  </div>
                  <h4
                    style={{ color: theme.textHeading }}
                    className="font-serif font-medium mb-1"
                  >
                    {interactions.length === 0 ? 'No reflections yet' : 'No matching reflections'}
                  </h4>
                  <p
                    style={{ color: theme.textMuted }}
                    className="text-xs max-w-xs mx-auto"
                  >
                    {interactions.length === 0
                      ? 'Pour your thoughts into the journal editor to brew your first reflection.'
                      : 'Try adjusting your search terms or mood filter.'}
                  </p>
                </div>
              ) : (
                filteredInteractions.map((item) => {
                  const isActive = activeInteractionId === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        onSelectInteraction(item);
                        onClose();
                      }}
                      style={{
                        backgroundColor: theme.cardBg,
                        borderColor: isActive ? theme.primary : theme.borderColor,
                        boxShadow: isActive
                          ? `0 4px 14px -3px ${theme.primary}44`
                          : `0 2px 8px -2px ${theme.glowColor}`,
                      }}
                      className="p-4 rounded-2xl border-2 transition-all cursor-pointer relative group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span
                          style={{ color: theme.primary }}
                          className="text-xs font-semibold capitalize"
                        >
                          {item.mood}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            style={{ color: theme.textMuted }}
                            className="text-[11px] flex items-center gap-1"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(item.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, item.id)}
                            disabled={deletingId === item.id}
                            style={{ color: theme.textMuted }}
                            className="opacity-0 group-hover:opacity-100 hover:text-rose-600 transition-opacity p-1 cursor-pointer"
                            title="Delete reflection"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4
                        style={{ color: theme.textHeading }}
                        className="text-sm font-semibold mb-1 line-clamp-1 font-serif"
                      >
                        {item.title || 'Untitled Reflection'}
                      </h4>

                      <p
                        style={{ color: theme.textBody }}
                        className="text-xs line-clamp-2 leading-relaxed mb-2 font-light opacity-90"
                      >
                        {item.summary || item.initialEntry}
                      </p>

                      <div
                        style={{ borderTopColor: theme.subtleBorder, color: theme.textMuted }}
                        className="flex items-center justify-between text-[11px] pt-2 border-t"
                      >
                        <span className="truncate">
                          {item.conversation ? `${item.conversation.length} moments` : '1 reflection'}
                        </span>
                        <ChevronRight
                          className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
                          style={{ color: theme.primary }}
                        />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
