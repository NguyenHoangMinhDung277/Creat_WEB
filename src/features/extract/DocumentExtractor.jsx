import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  FileText,
  UploadCloud,
  Sparkles,
  Filter,
  CheckSquare,
  Bookmark,
  AlertTriangle,
  RefreshCw,
  Search
} from 'lucide-react';
import ExtractedItemCard from './ExtractedItemCard';
import Button from '../../components/common/Button';
import { CardSkeleton } from '../../components/common/Skeleton';
import { chunkText, deduplicateItems } from '../../utils/chunkText';
import { GeminiClient } from '../../services/geminiClient';
import { StorageService } from '../../services/storage';
import { SFX } from '../../services/sfx';

// Configure pdfjs-dist worker safely
try {
  if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  }
} catch {
  // Fallback
}

const SAMPLE_TEXT = `Climate change is no longer a distant threat; it has become an urgent reality. Global temperatures are climbing, and we must figure out how to mitigate risk before it is too late. Renewable energy plays a vital role in curbing greenhouse gas emissions. However, transitioning our entire energy grid essentially boils down to securing sustained economic feasibility. Policymakers must strike a balance between aggressive industrial regulation and economic prosperity, taking into account the nuanced needs of developing nations.`;

export default function DocumentExtractor({
  onItemsAddedToDeck,
  uiLang,
  t
}) {
  const [activeInputTab, setActiveInputTab] = useState('paste'); // 'paste' | 'upload'
  const [rawText, setRawText] = useState(SAMPLE_TEXT);
  const [extractedItems, setExtractedItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [addedIds, setAddedIds] = useState(new Set());
  const [isExtracting, setIsExtracting] = useState(false);
  const [progressInfo, setProgressInfo] = useState('');
  const [extractError, setExtractError] = useState(null);
  const [pdfWarning, setPdfWarning] = useState(null);

  // Filters
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Handle PDF / TXT upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfWarning(null);
    setExtractError(null);

    if (file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawText(event.target.result || '');
        setActiveInputTab('paste');
      };
      reader.readAsText(file);
      return;
    }

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      try {
        setIsExtracting(true);
        setProgressInfo('Reading PDF file pages...');
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let accumulatedText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          setProgressInfo(`Extracting text from PDF page ${i}/${pdf.numPages}...`);
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageStr = textContent.items.map(item => item.str).join(' ');
          accumulatedText += pageStr + '\n';
        }

        if (accumulatedText.trim().length < 60) {
          setPdfWarning(t.pdfWarningScanned);
        }

        setRawText(accumulatedText.trim());
        setActiveInputTab('paste');
      } catch (err) {
        console.error('PDF parsing error:', err);
        setExtractError(`Failed to parse PDF: ${err.message}. Please copy and paste the text directly.`);
      } finally {
        setIsExtracting(false);
        setProgressInfo('');
      }
    }
  };

  // Run AI Extraction
  const handleExtract = async () => {
    if (!rawText.trim()) return;

    setIsExtracting(true);
    setExtractError(null);
    setProgressInfo('Splitting text and analyzing with Gemini...');
    SFX.playClick();

    try {
      const chunks = chunkText(rawText, 2500, 150);
      let combinedItems = [];

      for (let i = 0; i < chunks.length; i++) {
        setProgressInfo(`Processing segment ${i + 1} of ${chunks.length}...`);
        const chunkResults = await GeminiClient.extractContent(chunks[i]);
        if (Array.isArray(chunkResults)) {
          combinedItems = combinedItems.concat(chunkResults);
        }
      }

      const deduplicated = deduplicateItems(combinedItems);
      setExtractedItems(deduplicated);
      // Select all by default
      setSelectedIds(new Set(deduplicated.map(item => item.id)));

      if (deduplicated.length > 0) {
        SFX.playLevelUp();
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setExtractError(err.message || 'Failed to extract items. Please try again.');
      SFX.playWrong();
    } finally {
      setIsExtracting(false);
      setProgressInfo('');
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleAddSingleToDeck = (item) => {
    StorageService.addToDeck(item);
    setAddedIds(prev => new Set(prev).add(item.id));
    SFX.playClick();
    if (onItemsAddedToDeck) onItemsAddedToDeck([item]);
  };

  const handleAddSelectedToDeck = () => {
    const toAdd = extractedItems.filter(item => selectedIds.has(item.id));
    toAdd.forEach(item => StorageService.addToDeck(item));
    setAddedIds(prev => {
      const next = new Set(prev);
      toAdd.forEach(i => next.add(i.id));
      return next;
    });
    SFX.playFanfare();
    if (onItemsAddedToDeck) onItemsAddedToDeck(toAdd);
  };

  // Filtered Items
  const filteredItems = extractedItems.filter(item => {
    if (filterLevel !== 'all' && item.level !== filterLevel) return false;
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.english.toLowerCase().includes(q) ||
        item.vietnamese.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title & Introduction */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <FileText className="w-7 h-7 text-cyan-400" />
          <span>{t.extractTitle}</span>
        </h1>
        <p className="text-sm text-cyan-300 font-medium max-w-3xl leading-relaxed">
          {t.extractSubtitle}
        </p>
      </div>

      {/* Input Area (Paste or Upload) */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col gap-4 shadow-xl">
        {/* Input Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveInputTab('paste')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeInputTab === 'paste'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.pasteTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveInputTab('upload')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeInputTab === 'upload'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{t.uploadTab}</span>
          </button>
        </div>

        {/* Tab 1: Paste Text */}
        {activeInputTab === 'paste' && (
          <div className="flex flex-col gap-3">
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste English article, essay, or dialogue here..."
              className="w-full glass-input p-4 rounded-2xl text-sm leading-relaxed resize-y focus:outline-none font-sans"
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{rawText.length} characters</span>
              <button
                type="button"
                onClick={() => setRawText(SAMPLE_TEXT)}
                className="text-cyan-400 hover:underline"
              >
                Load Sample English Passage
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Upload File */}
        {activeInputTab === 'upload' && (
          <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 hover:border-cyan-400/50 transition-colors bg-white/5">
            <UploadCloud className="w-10 h-10 text-cyan-400 animate-bounce" />
            <div>
              <p className="text-sm font-bold text-slate-200">
                Click to browse or drag and drop a file
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Supports .TXT and text-based .PDF documents
              </p>
            </div>
            <input
              type="file"
              accept=".pdf,.txt,text/plain,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              className="cursor-pointer px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold text-xs hover:bg-cyan-500/30 transition-all"
            >
              Choose File
            </label>
          </div>
        )}

        {/* Scanned PDF warning notice */}
        {pdfWarning && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>{pdfWarning}</span>
          </div>
        )}

        {/* Error notice */}
        {extractError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{extractError}</span>
          </div>
        )}

        {/* Extract Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400 italic">
            {progressInfo || 'Runs locally via Gemini API (JSON Schema mode) with automatic fallback.'}
          </span>
          <Button
            variant="rainbow"
            size="md"
            onClick={handleExtract}
            disabled={isExtracting || !rawText.trim()}
            icon={isExtracting ? RefreshCw : Sparkles}
            className={isExtracting ? 'animate-pulse' : ''}
          >
            {isExtracting ? t.extracting : t.extractAction}
          </Button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isExtracting && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-cyan-300 font-semibold animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{progressInfo || t.extracting}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      )}

      {/* Extracted Results Section */}
      {!isExtracting && extractedItems.length > 0 && (
        <div className="flex flex-col gap-6">
          {/* Controls Bar: Filters, Search, Batch Add */}
          <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Select All Checkbox */}
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200"
              >
                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {selectedIds.size === filteredItems.length ? 'Deselect All' : `Select All (${filteredItems.length})`}
                </span>
              </button>

              {/* Filter by CEFR Level */}
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="glass-input px-3 py-1.5 rounded-xl text-xs bg-ocean-950 text-slate-200 focus:outline-none"
              >
                <option value="all">{t.allLevels}</option>
                <option value="A1">A1 Beginner</option>
                <option value="A2">A2 Elementary</option>
                <option value="B1">B1 Intermediate</option>
                <option value="B2">B2 Upper-Intermediate</option>
                <option value="C1">C1 Advanced</option>
                <option value="C2">C2 Proficiency</option>
              </select>

              {/* Filter by Item Type */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="glass-input px-3 py-1.5 rounded-xl text-xs bg-ocean-950 text-slate-200 focus:outline-none"
              >
                <option value="all">{t.allTypes}</option>
                <option value="word">Words</option>
                <option value="phrasal_verb">Phrasal Verbs</option>
                <option value="idiom">Idioms</option>
                <option value="collocation">Collocations</option>
              </select>
            </div>

            {/* Batch Add to Deck Button */}
            <div className="flex items-center gap-3">
              <Button
                variant="neon"
                size="sm"
                onClick={handleAddSelectedToDeck}
                disabled={selectedIds.size === 0}
                icon={Bookmark}
              >
                {t.addDeck} ({selectedIds.size})
              </Button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <ExtractedItemCard
                key={item.id}
                item={item}
                isSelected={selectedIds.has(item.id)}
                onToggleSelect={handleToggleSelect}
                isAdded={addedIds.has(item.id)}
                onAddToDeck={handleAddSingleToDeck}
                uiLang={uiLang}
                t={t}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
