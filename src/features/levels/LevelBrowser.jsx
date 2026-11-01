import React, { useState, useMemo } from 'react';
import { Layers, Search, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';
import { CEFR_LEVELS, SEED_ITEMS } from '../../data/seedContent';
import TopicDetail from './TopicDetail';
import Badge from '../../components/common/Badge';

export default function LevelBrowser({
  onItemAddedToDeck,
  uiLang,
  t
}) {
  const [selectedLevelId, setSelectedLevelId] = useState('A1');
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dynamicItems, setDynamicItems] = useState(SEED_ITEMS);

  const selectedLevel = useMemo(() => {
    return CEFR_LEVELS.find(l => l.id === selectedLevelId) || CEFR_LEVELS[0];
  }, [selectedLevelId]);

  const selectedTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    return selectedLevel.topics.find(t => t.id === selectedTopicId) || null;
  }, [selectedLevel, selectedTopicId]);

  // Merge items for the chosen topic
  const topicItems = useMemo(() => {
    if (!selectedTopicId) return [];
    return dynamicItems.filter(item => {
      const matchTopic = item.topicId === selectedTopicId || (item.level === selectedLevelId && !item.topicId);
      if (!matchTopic) return false;
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.english.toLowerCase().includes(q) ||
          item.vietnamese.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedTopicId, selectedLevelId, dynamicItems, filterType, searchQuery]);

  const handleItemsGenerated = (newItems) => {
    setDynamicItems(prev => [...newItems, ...prev]);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header & CEFR Level Selector Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-cyan-400" />
              <span>{t.navLevels} (A1 — C2)</span>
            </h1>
            <p className="text-sm text-cyan-300 font-medium">
              {uiLang === 'vi'
                ? 'Khám phá từ vựng, thành ngữ và collocation chuẩn bản ngữ kèm giải nghĩa tiếng Việt.'
                : 'Explore native vocabulary, idioms, and collocations with precise Vietnamese explanations.'}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full glass-input pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Level Tabs Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CEFR_LEVELS.map((lvl) => {
            const isSelected = lvl.id === selectedLevelId;
            return (
              <button
                key={lvl.id}
                onClick={() => {
                  setSelectedLevelId(lvl.id);
                  setSelectedTopicId(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs sm:text-sm transition-all shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border-cyan-400 shadow-glass-glow'
                    : 'glass-panel text-slate-300 hover:text-white hover:border-white/20'
                }`}
              >
                <Badge level={lvl.id} size="xs" />
                <span>{lvl.id} - {uiLang === 'vi' ? lvl.nameVi : lvl.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Level Description Banner */}
      <div className="p-4 rounded-2xl glass-panel-subtle border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            CEFR {selectedLevel.id} Competency
          </span>
          <p className="text-sm text-slate-200 font-medium">
            {selectedLevel.description}
          </p>
          <p className="text-xs text-cyan-300 italic">
            ↳ {selectedLevel.descriptionVi}
          </p>
        </div>
        <span className="text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 shrink-0">
          {selectedLevel.topics.length} Topics available
        </span>
      </div>

      {/* Topics View OR Topic Details View */}
      {!selectedTopic ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedLevel.topics.map((topic) => {
            const count = dynamicItems.filter(i => i.topicId === topic.id || (i.level === selectedLevelId && !i.topicId)).length;
            return (
              <div
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-cyan-400/50 hover:shadow-glass-glow transition-all cursor-pointer group flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full">
                      {count > 0 ? `${count} items` : '10+ items'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {topic.name}
                  </h3>
                  <p className="text-xs text-cyan-200/80 font-medium mt-0.5">
                    {topic.nameVi}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
                  <span>Explore vocabulary & idioms</span>
                  <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setSelectedTopicId(null)}
            className="self-start flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all {selectedLevel.id} Topics</span>
          </button>

          <TopicDetail
            topic={selectedTopic}
            level={selectedLevel}
            items={topicItems.length > 0 ? topicItems : dynamicItems.filter(i => i.level === selectedLevelId)}
            onItemAddedToDeck={onItemAddedToDeck}
            onItemsGenerated={handleItemsGenerated}
            uiLang={uiLang}
            t={t}
          />
        </div>
      )}
    </div>
  );
}
