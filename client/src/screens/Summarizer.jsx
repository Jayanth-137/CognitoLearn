import { useState } from 'react';
import { Upload, FileText, Link as LinkIcon, Download, Save, Highlighter } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const Summarizer = () => {
    const [activeTab, setActiveTab] = useState('upload');
    const [summary, setSummary] = useState(null);

    const mockSummary = {
        title: 'Introduction to React Hooks',
        sections: [
            {
                id: 1,
                heading: 'Overview',
                content: 'React Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8 to allow developers to use state and other React features without writing a class.',
                highlights: ['React Hooks', 'React 16.8', 'function components']
            },
            {
                id: 2,
                heading: 'Key Concepts',
                content: 'The most commonly used hooks are useState for managing state, useEffect for side effects, and useContext for consuming context. Custom hooks can be created to reuse stateful logic between components.',
                highlights: ['useState', 'useEffect', 'useContext', 'Custom hooks']
            },
            {
                id: 3,
                heading: 'Benefits',
                content: 'Hooks provide a more direct API to React concepts, allow better code reuse through custom hooks, and enable cleaner component organization by grouping related logic together.',
                highlights: ['better code reuse', 'cleaner component organization']
            }
        ],
        keyPoints: [
            'Hooks work inside functional components only',
            'Must be called at the top level of components',
            'Enable state and lifecycle in functional components',
            'Custom hooks promote code reusability'
        ]
    };

    const handleGenerate = () => {
        setSummary(mockSummary);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-2">Smart Summarizer</h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Upload documents or paste links to get AI-powered summaries</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
                {/* Upload Section */}
                <div className="lg:sticky lg:top-6 self-start">
                    <Card variant="glass">
                        <div className="flex gap-2 mb-6">
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'upload'
                                    ? 'bg-gradient-accent text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                onClick={() => setActiveTab('upload')}
                            >
                                <Upload size={18} />
                                Upload File
                            </button>
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'link'
                                    ? 'bg-gradient-accent text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                onClick={() => setActiveTab('link')}
                            >
                                <LinkIcon size={18} />
                                Paste Link
                            </button>
                        </div>

                        {activeTab === 'upload' ? (
                            <div className="mb-6">
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-12 text-center cursor-pointer transition-all hover:border-primary-500 hover:bg-primary-500/5">
                                    <FileText size={48} className="text-primary-500 mx-auto mb-6" />
                                    <h3 className="text-lg font-bold mb-2">Drop your PDF here</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6">or click to browse</p>
                                    <Badge variant="info">PDF, DOCX up to 10MB</Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <input
                                    type="url"
                                    className="w-full px-6 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-sans transition-colors focus:outline-none focus:border-primary-500"
                                    placeholder="Paste article or document URL..."
                                />
                            </div>
                        )}

                        <Button
                            variant="primary"
                            className="w-full"
                            onClick={handleGenerate}
                        >
                            Generate Summary
                        </Button>
                    </Card>
                </div>

                {/* Summary Display */}
                {summary && (
                    <div>
                        <Card variant="glass">
                            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
                                <h2 className="text-2xl font-bold mb-0 flex-1 min-w-[200px]">{summary.title}</h2>
                                <div className="flex gap-2 flex-wrap">
                                    <Button variant="ghost" icon={<Highlighter size={18} />} size="sm">
                                        Highlight
                                    </Button>
                                    <Button variant="ghost" icon={<Save size={18} />} size="sm">
                                        Save Notes
                                    </Button>
                                    <Button variant="primary" icon={<Download size={18} />} size="sm">
                                        Export
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-8">
                                {summary.sections.map((section) => (
                                    <div key={section.id}>
                                        <h3 className="text-xl font-bold text-primary-500 mb-4">{section.heading}</h3>
                                        <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                                            {section.content.split(' ').map((word, idx) => {
                                                const isHighlight = section.highlights.some(h =>
                                                    word.toLowerCase().includes(h.toLowerCase())
                                                );
                                                return isHighlight ? (
                                                    <mark key={idx} className="bg-gradient-to-r from-primary-500/20 to-primary-500/30 text-slate-900 dark:text-slate-100 px-1 rounded font-medium">
                                                        {word}{' '}
                                                    </mark>
                                                ) : (
                                                    <span key={idx}>{word} </span>
                                                );
                                            })}
                                        </p>
                                    </div>
                                ))}

                                <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl border-l-4 border-primary-500">
                                    <h3 className="text-xl font-bold text-primary-500 mb-4">Key Takeaways</h3>
                                    <ul className="pl-5 space-y-2">
                                        {summary.keyPoints.map((point, idx) => (
                                            <li key={idx} className="text-slate-600 dark:text-slate-400 leading-relaxed">{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Summarizer;
