import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { X, Send, Sparkles, Trash2, Copy, Check, Terminal, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';

// ─── CodeBlock ────────────────────────────────────────────
const CodeBlock = ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!inline) {
        return (
            <div className="relative my-3 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-md group">
                <div className="flex justify-between items-center px-3 py-1.5 bg-slate-800/50 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <Terminal size={12} className="text-slate-400" />
                        <span className="text-[10px] text-slate-400 font-mono">{match ? match[1] : 'code'}</span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                    >
                        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                </div>
                <div className="p-3 overflow-x-auto">
                    <code className={`${className} text-xs font-mono text-slate-200 block`} {...props}>
                        {children}
                    </code>
                </div>
            </div>
        );
    }
    return (
        <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-xs font-mono text-pink-600 dark:text-pink-400" {...props}>
            {children}
        </code>
    );
};

const MarkdownComponents = {
    code: CodeBlock,
    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-sm">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-0.5 text-sm">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-0.5 text-sm">{children}</ol>,
    li: ({ children }) => <li className="pl-0.5 text-sm">{children}</li>,
    h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3 text-slate-900 dark:text-slate-100">{children}</h1>,
    h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5 mt-2 text-slate-900 dark:text-slate-100">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-bold mb-1.5 mt-2 text-slate-900 dark:text-slate-100">{children}</h3>,
    blockquote: ({ children }) => <blockquote className="border-l-3 border-slate-300 dark:border-slate-600 pl-3 italic my-3 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 py-1.5 pr-2 rounded-r text-sm">{children}</blockquote>,
    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline text-sm">{children}</a>,
};

// ─── ChatPanel ────────────────────────────────────────────
const ChatPanel = ({ isOpen, onClose, roadmapId, roadmap, initialTopic }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { toast } = useToast();

    // Build suggested prompts from roadmap topics
    const suggestedPrompts = (() => {
        if (!roadmap?.topics) return [];
        const activeTopic = roadmap.topics.find(t => t.status === 'in-progress');
        const prompts = [];
        if (activeTopic) {
            prompts.push(`Explain ${activeTopic.title} in simple terms`);
            prompts.push(`What are the key concepts in ${activeTopic.title}?`);
        }
        if (roadmap.topics.length > 1) {
            prompts.push(`Give me a study plan for this roadmap`);
        }
        prompts.push('What should I focus on next?');
        return prompts.slice(0, 4);
    })();

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    // Load chat history when panel opens
    useEffect(() => {
        if (!isOpen || !roadmapId || hasLoaded) return;

        const loadHistory = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/chat/${roadmapId}`);
                if (response.data.success) {
                    setMessages(response.data.messages.map(m => ({
                        _id: m._id,
                        role: m.role,
                        text: m.text,
                        createdAt: new Date(m.createdAt)
                    })));
                }
            } catch (err) {
                console.error('Failed to load chat history:', err);
            } finally {
                setLoading(false);
                setHasLoaded(true);
            }
        };

        loadHistory();
    }, [isOpen, roadmapId, hasLoaded]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen && hasLoaded) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, hasLoaded]);

    // Pre-fill initial topic question
    useEffect(() => {
        if (isOpen && initialTopic && hasLoaded) {
            setInputText(`Explain ${initialTopic} in detail`);
        }
    }, [isOpen, initialTopic, hasLoaded]);

    // Reset state when roadmapId changes
    useEffect(() => {
        setMessages([]);
        setHasLoaded(false);
    }, [roadmapId]);

    const handleSend = async () => {
        const text = inputText.trim();
        if (!text || isTyping) return;

        // Optimistically add user message
        const userMsg = {
            _id: `temp-${Date.now()}`,
            role: 'user',
            text,
            createdAt: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const response = await api.post(`/chat/${roadmapId}`, { message: text });
            if (response.data.success) {
                // Replace temp user message with real one, and add AI message
                setMessages(prev => {
                    const withoutTemp = prev.filter(m => m._id !== userMsg._id);
                    return [
                        ...withoutTemp,
                        {
                            _id: response.data.userMessage._id,
                            role: 'user',
                            text: response.data.userMessage.text,
                            createdAt: new Date(response.data.userMessage.createdAt)
                        },
                        {
                            _id: response.data.aiMessage._id,
                            role: 'ai',
                            text: response.data.aiMessage.text,
                            createdAt: new Date(response.data.aiMessage.createdAt)
                        }
                    ];
                });
            }
        } catch (err) {
            console.error('Chat send error:', err);
            toast.error('Failed to get AI response. Please try again.', { title: 'Chat Error' });
            // Remove the optimistic user message on error
            setMessages(prev => prev.filter(m => m._id !== userMsg._id));
            setInputText(text); // restore input
        } finally {
            setIsTyping(false);
        }
    };

    const handleClearChat = async () => {
        try {
            await api.delete(`/chat/${roadmapId}`);
            setMessages([]);
            toast.success('Chat history cleared', { title: 'Cleared' });
        } catch (err) {
            console.error('Clear chat error:', err);
            toast.error('Failed to clear chat', { title: 'Error' });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop — mobile only; push layout handles desktop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[24] lg:hidden"
                        onClick={onClose}
                    />

                    {/* Panel — floating layout */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0, scale: 0.95 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: '100%', opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-2 sm:right-3 lg:right-4 top-2 sm:top-3 lg:top-3 bottom-2 sm:bottom-3 lg:bottom-4 w-[calc(100%-1rem)] sm:w-[400px] z-[40] flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/40 dark:border-slate-700/50 shadow-2xl shadow-slate-200/20 dark:shadow-black/40 rounded-2xl md:rounded-[24px] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Mentor</h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px]">
                                        {roadmap?.title || 'Learning Assistant'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleClearChat}
                                    disabled={messages.length === 0}
                                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Clear chat"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                    title="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 scroll-smooth">
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        {/* <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-3">
                                            <Sparkles size={20} className="text-indigo-500 animate-pulse" />
                                        </div> */}
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Loading chat...</p>
                                    </div>
                                </div>
                            ) : messages.length === 0 && !isTyping ? (
                                // Empty state
                                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                                    {/* <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-500/30">
                                        <Sparkles size={28} />
                                    </div> */}
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                                        Hi, I'm your AI Mentor!
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                                        I know all about your <span className="font-semibold text-indigo-500">{roadmap?.title}</span> roadmap. Ask me anything!
                                    </p>

                                    {/* Suggested prompts */}
                                    {suggestedPrompts.length > 0 && (
                                        <div className="flex flex-col gap-2 w-full max-w-xs">
                                            {suggestedPrompts.map((prompt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setInputText(prompt);
                                                        inputRef.current?.focus();
                                                    }}
                                                    className="text-left px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                                                >
                                                    {prompt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg) => (
                                        <div
                                            key={msg._id}
                                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            {msg.role === 'ai' && (
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-md">
                                                    <Sparkles size={14} />
                                                </div>
                                            )}
                                            <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                                                <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                                                    msg.role === 'user'
                                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm'
                                                        : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-tl-sm'
                                                }`}>
                                                    {msg.role === 'ai' ? (
                                                        <div className="text-slate-800 dark:text-slate-200">
                                                            <ReactMarkdown components={MarkdownComponents}>
                                                                {msg.text}
                                                            </ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] px-1 mt-1 block ${
                                                    msg.role === 'user' ? 'text-right text-slate-400' : 'text-slate-400'
                                                }`}>
                                                    {msg.createdAt?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || ''}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Typing indicator */}
                                    {isTyping && (
                                        <div className="flex gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                                                <Sparkles size={14} />
                                            </div>
                                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                                <div className="flex gap-1.5 py-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]"></span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]"></span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]"></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/80">
                            {/* Suggested prompts - show inline when there are messages */}
                            {messages.length > 0 && suggestedPrompts.length > 0 && (
                                <div className="flex gap-1.5 mb-2.5 flex-wrap">
                                    {suggestedPrompts.slice(0, 2).map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setInputText(prompt);
                                                inputRef.current?.focus();
                                            }}
                                            className="px-3 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-[11px] hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 dark:hover:border-indigo-700 transition-all whitespace-nowrap"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2 items-end">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-medium transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                                    placeholder="Ask me anything..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isTyping}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputText.trim() || isTyping}
                                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChatPanel;
