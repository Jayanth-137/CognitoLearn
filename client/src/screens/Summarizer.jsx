import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, Link, Download, Save, Highlighter,
    AlertCircle, Sparkles, BookOpen, Clock, Hash,
    ChevronRight, RefreshCw, ArrowLeft, Zap
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../api/client';

/* ─────────────────────────── animation variants ─────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};
const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

/* ─────────────────────────── small helpers ───────────────────────────────── */
const TABS = [
    { id: 'text', label: 'Text', icon: FileText },
    { id: 'upload', label: 'File', icon: Upload },
    { id: 'url', label: 'URL', icon: Link },
];

const ACCENT_COLORS = [
    'from-purple-500 to-violet-500',
    'from-pink-500   to-rose-500',
    'from-cyan-500   to-blue-500',
    'from-amber-500  to-orange-500',
    'from-emerald-500 to-teal-500',
];

const readingTime = (sections) => {
    if (!sections) return 0;
    const words = sections.reduce((acc, s) => acc + (s.content || '').split(' ').length, 0);
    return Math.max(1, Math.round(words / 200));
};

/* ═══════════════════════════ component ══════════════════════════════════════ */
const Summarizer = () => {
    const [activeTab, setActiveTab] = useState('text');
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    const fileInputRef = useRef(null);
    const summaryRef = useRef(null);

    useEffect(() => {
        if (summary && summaryRef.current) {
            summaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [summary]);

    /* ── handlers ── */
    const reset = () => {
        setSummary(null);
        setError(null);
        setTextInput('');
        setUrlInput('');
        setUploadedFile(null);
    };

    const submitToAPI = async (content, type = 'text') => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/summarize', { content, type });
            if (response.data.success) {
                setSummary(response.data.summary);
            } else {
                setError(response.data.error || 'Failed to generate summary');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate summary. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = () => {
        if (activeTab === 'text') {
            if (!textInput.trim()) { setError('Please enter some text to summarize'); return; }
            submitToAPI(textInput, 'text');
        } else if (activeTab === 'url') {
            if (!urlInput.trim()) { setError('Please enter a URL'); return; }
            submitToAPI(urlInput, 'url');
        }
    };

    const processFile = (file) => {
        if (!file) return;
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) { setError('File size must be less than 10MB'); return; }
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid file (TXT, PDF, or DOCX)');
            return;
        }
        if (file.type !== 'text/plain') {
            setError('PDF and DOCX extraction requires additional setup. Please use TXT or paste text directly.');
            return;
        }
        setUploadedFile(file);
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => submitToAPI(e.target?.result, 'text');
        reader.readAsText(file);
    };

    const handleFileChange = (e) => processFile(e.target.files?.[0]);
    const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files?.[0]); };
    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);

    const handleExport = () => {
        if (!summary) return;
        const md = `# ${summary.title}\n\n${summary.sections.map(s => `## ${s.heading}\n\n${s.content}`).join('\n\n')
            }\n\n## Key Takeaways\n\n${summary.keyPoints.map(p => `- ${p}`).join('\n')}`;
        const a = document.createElement('a');
        a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(md)}`;
        a.download = `summary_${Date.now()}.md`;
        a.click();
    };

    const isGenerateDisabled =
        loading ||
        (activeTab === 'text' && !textInput.trim()) ||
        (activeTab === 'url' && !urlInput.trim()) ||
        (activeTab === 'upload');

    /* ═══════════════════ RENDER ═══════════════════ */
    return (
        <div className="min-h-screen p-6 pb-20 relative z-10">
            <AnimatePresence mode="wait">
                {!summary ? (
                    /* ════════════ BEFORE GENERATION ════════════ */
                    <motion.div
                        key="input-view"
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="max-w-2xl mx-auto w-full"
                    >
                        {/* ── Hero header ── */}
                        <motion.div variants={fadeUp} className="text-center mb-10">
                            <p className="text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                Paste text, upload a file, or drop a URL — get a beautifully structured summary in seconds.
                            </p>
                        </motion.div>

                        {/* ── Input card ── */}
                        <motion.div variants={fadeUp}>
                            <div className="rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-slate-200/60 dark:shadow-black/40">

                                {/* Tab bar */}
                                <div className="flex border-b border-slate-100 dark:border-slate-700/60">
                                    {TABS.map(tab => {
                                        const Icon = tab.icon;
                                        const active = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => { setActiveTab(tab.id); setError(null); }}
                                                className={`relative flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all duration-200 ${active
                                                        ? 'text-purple-600 dark:text-purple-400'
                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                    }`}
                                            >
                                                <Icon size={15} />
                                                {tab.label}
                                                {active && (
                                                    <motion.div
                                                        layoutId="tab-indicator"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="p-6">
                                    {/* Error */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/60 rounded-xl flex gap-3 items-start">
                                                    <AlertCircle size={16} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Tab content */}
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'text' && (
                                            <motion.div key="text" variants={fadeUp} initial="hidden" animate="show" exit="exit">
                                                <textarea
                                                    value={textInput}
                                                    onChange={(e) => setTextInput(e.target.value)}
                                                    placeholder="Paste your article, notes, or any text here…"
                                                    rows={10}
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm leading-relaxed transition-all focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 resize-none"
                                                />
                                                {/* Char counter */}
                                                <div className="flex justify-between items-center mt-2 px-1">
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">Min. ~100 words recommended</span>
                                                    <span className={`text-xs font-medium ${textInput.length > 9000 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                                                        {textInput.length.toLocaleString()} / 10,000
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'upload' && (
                                            <motion.div key="upload" variants={fadeUp} initial="hidden" animate="show" exit="exit">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".txt,.pdf,.docx,.doc"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <motion.div
                                                    animate={{
                                                        borderColor: dragOver ? '#a855f7' : undefined,
                                                        backgroundColor: dragOver ? 'rgba(168,85,247,0.06)' : undefined,
                                                    }}
                                                    onDrop={handleDrop}
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-10 text-center cursor-pointer transition-colors hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-500/5 group"
                                                >
                                                    <motion.div
                                                        animate={dragOver ? { scale: 1.15, y: -4 } : { y: [0, -6, 0] }}
                                                        transition={dragOver ? { duration: 0.2 } : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                                        className="mb-4"
                                                    >
                                                        <Upload
                                                            size={44}
                                                            className={`mx-auto transition-colors ${dragOver ? 'text-purple-500' : 'text-slate-300 dark:text-slate-600 group-hover:text-purple-400'}`}
                                                        />
                                                    </motion.div>
                                                    {uploadedFile ? (
                                                        <>
                                                            <p className="font-semibold text-purple-600 dark:text-purple-400">{uploadedFile.name}</p>
                                                            <p className="text-xs text-slate-500 mt-1">{(uploadedFile.size / 1024).toFixed(1)} KB — click to replace</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
                                                                {dragOver ? 'Release to upload' : 'Drop file here or click to browse'}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">TXT, PDF, DOCX — up to 10 MB</p>
                                                        </>
                                                    )}
                                                </motion.div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'url' && (
                                            <motion.div key="url" variants={fadeUp} initial="hidden" animate="show" exit="exit" className="space-y-3">
                                                <div className="relative">
                                                    <Link size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                                    <input
                                                        type="url"
                                                        value={urlInput}
                                                        onChange={(e) => setUrlInput(e.target.value)}
                                                        placeholder="https://example.com/article"
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 pl-1">Paste any public article or web page URL to summarize its contents.</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Generate button */}
                                    <motion.button
                                        whileHover={isGenerateDisabled ? {} : { scale: 1.015, y: -1 }}
                                        whileTap={isGenerateDisabled ? {} : { scale: 0.98 }}
                                        onClick={handleGenerate}
                                        disabled={isGenerateDisabled}
                                        className={`mt-5 w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2.5 transition-all duration-200 ${isGenerateDisabled
                                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40'
                                            }`}
                                    >
                                        {loading ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                                                >
                                                    <RefreshCw size={16} />
                                                </motion.div>
                                                Generating summary…
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} />
                                                Generate Summary
                                            </>
                                        )}
                                    </motion.button>
                                </div>

                                {/* Footer pill */}
                                <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-center gap-4">
                                    {['Powered by Gemini AI', 'Structured output', 'Key takeaways'].map((label, i) => (
                                        <span key={i} className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                            <ChevronRight size={10} className="text-purple-400" />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature pills */}
                        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mt-8">
                            {[
                                { icon: BookOpen, label: 'Structured sections' },
                                { icon: Hash, label: 'Key takeaways' },
                                { icon: Clock, label: 'Reading estimate' },
                                { icon: Download, label: 'Export as Markdown' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 shadow-sm">
                                    <Icon size={12} className="text-purple-500" />
                                    {label}
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                ) : (
                    /* ════════════ AFTER GENERATION ════════════ */
                    <motion.div
                        key="summary-view"
                        ref={summaryRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-6xl mx-auto w-full"
                    >
                        {/* ── Top bar ── */}
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="flex items-center justify-between mb-8 gap-4 flex-wrap"
                        >
                            <button
                                onClick={reset}
                                className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                New summary
                            </button>

                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                    onClick={reset}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-purple-400 transition-all"
                                >
                                    <RefreshCw size={14} /> Regenerate
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                    onClick={handleExport}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-md shadow-purple-500/30 hover:shadow-lg transition-all"
                                >
                                    <Download size={14} /> Export .md
                                </motion.button>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

                            {/* ── MAIN CONTENT ── */}
                            <div className="min-w-0">
                                {/* Title card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45 }}
                                    className="rounded-2xl p-8 mb-6 bg-gradient-to-br from-purple-600 via-violet-600 to-pink-600 text-white shadow-2xl shadow-purple-500/30 relative overflow-hidden"
                                >
                                    {/* Decorative blobs */}
                                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-pink-300/20 blur-2xl pointer-events-none" />

                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">AI Summary</span>
                                        </div>
                                        <h1 className="text-2xl lg:text-3xl font-extrabold mb-4 leading-snug">{summary.title}</h1>
                                        <div className="flex flex-wrap gap-4 text-sm text-purple-100">
                                            <span className="flex items-center gap-1.5">
                                                <BookOpen size={14} />
                                                {summary.sections?.length || 0} sections
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Hash size={14} />
                                                {summary.keyPoints?.length || 0} takeaways
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                ~{readingTime(summary.sections)} min read
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Sections */}
                                <motion.div
                                    variants={stagger}
                                    initial="hidden"
                                    animate="show"
                                    className="space-y-4"
                                >
                                    {summary.sections && summary.sections.length > 0
                                        ? summary.sections.map((section, idx) => {
                                            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                                            return (
                                                <motion.div
                                                    key={idx}
                                                    variants={fadeUp}
                                                    className="group rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                                >
                                                    {/* Accent top bar */}
                                                    <div className={`h-1 bg-gradient-to-r ${accent}`} />
                                                    <div className="p-6 flex gap-4">
                                                        {/* Number badge */}
                                                        <div className={`flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-sm`}>
                                                            <span className="text-white text-sm font-bold">{idx + 1}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                                {section.heading}
                                                            </h2>
                                                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                                                {section.content.split(' ').map((word, wi) => {
                                                                    const isHL = section.highlights?.some(h =>
                                                                        word.toLowerCase().includes(h.toLowerCase())
                                                                    );
                                                                    return isHL ? (
                                                                        <mark key={wi} className="bg-yellow-200/80 dark:bg-yellow-500/30 text-slate-900 dark:text-white px-1 rounded font-semibold not-italic">
                                                                            {word}{' '}
                                                                        </mark>
                                                                    ) : (
                                                                        <span key={wi}>{word} </span>
                                                                    );
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                        : (
                                            <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300 text-sm">
                                                No sections were returned by the AI. Try again with more content.
                                            </div>
                                        )
                                    }
                                </motion.div>
                            </div>

                            {/* ── SIDEBAR ── */}
                            <div className="lg:sticky lg:top-6 space-y-4">
                                {/* Key Takeaways */}
                                {summary.keyPoints && summary.keyPoints.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.45, delay: 0.15 }}
                                        className="rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-100 dark:border-slate-700/60 shadow-sm"
                                    >
                                        <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                    <Sparkles size={13} className="text-white" />
                                                </div>
                                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Key Takeaways</h3>
                                            </div>
                                            <ul className="space-y-2.5">
                                                {summary.keyPoints.map((point, idx) => (
                                                    <motion.li
                                                        key={idx}
                                                        initial={{ opacity: 0, x: 10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.2 + idx * 0.06 }}
                                                        className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                                                    >
                                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                                                        <span>{point}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Stats card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.45, delay: 0.25 }}
                                    className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-100 dark:border-slate-700/60 shadow-sm p-5"
                                >
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Quick Stats</h3>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Sections', value: summary.sections?.length || 0, icon: BookOpen },
                                            { label: 'Takeaways', value: summary.keyPoints?.length || 0, icon: Hash },
                                            { label: 'Read time', value: `~${readingTime(summary.sections)} min`, icon: Clock },
                                        ].map(({ label, value, icon: Icon }) => (
                                            <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                    <Icon size={12} className="text-purple-400" />
                                                    {label}
                                                </span>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Actions */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.45, delay: 0.35 }}
                                    className="space-y-2"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={handleExport}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20 hover:shadow-lg transition-all"
                                    >
                                        <Download size={14} /> Export as Markdown
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={reset}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-purple-400 transition-all"
                                    >
                                        <RefreshCw size={14} /> New Summary
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Summarizer;
