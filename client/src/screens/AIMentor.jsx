import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, FileText, Copy, Check, Terminal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

import { useToast } from '../context/ToastContext';

const CodeBlock = ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const [copied, setCopied] = useState(false);
    const { showToast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
        setCopied(true);
        showToast('Code copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    if (!inline) {
        return (
            <div className="relative my-4 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-md group">
                <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-slate-400" />
                        <span className="text-xs text-slate-400 font-mono">{match ? match[1] : 'code'}</span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                        title="Copy code"
                    >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                </div>
                <div className="p-4 overflow-x-auto">
                    <code className={`${className} text-sm font-mono text-slate-200 block`} {...props}>
                        {children}
                    </code>
                </div>
            </div>
        );
    }
    return (
        <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400" {...props}>
            {children}
        </code>
    );
};

const MarkdownComponents = {
    code: CodeBlock,
    p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="pl-1">{children}</li>,
    h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4 text-slate-900 dark:text-slate-100">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3 text-slate-900 dark:text-slate-100">{children}</h2>,
    h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-3 text-slate-900 dark:text-slate-100">{children}</h3>,
    blockquote: ({ children }) => <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic my-4 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 py-2 pr-2 rounded-r">{children}</blockquote>,
    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">{children}</a>,
};

const AIMentor = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: "# Welcome, Learner! \nI'm your AI mentor. I can help you understand concepts, answer questions, and guide you through your learning journey. \n\n**Try asking about:**\n* React Hooks\n* Data Structures\n* System Design",
            timestamp: new Date(Date.now() - 60000)
        },
        {
            id: 2,
            type: 'user',
            text: "Can you explain React hooks?",
            timestamp: new Date(Date.now() - 30000)
        },
        {
            id: 3,
            type: 'ai',
            text: "## React Hooks\n**React Hooks** are functions that let you use state and other React features in functional components.\n\nHere is a basic example using `useState`:\n\n```jsx\nimport { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n```\n\nThe most common hooks are:\n1. `useState` - For managing state\n2. `useEffect` - For side effects\n3. `useContext` - For context API",
            sources: [
                { title: 'React Documentation', snippet: 'Hooks are a new addition in React 16.8...' },
                { title: 'Understanding useState', snippet: 'The useState hook returns a pair...' }
            ],
            timestamp: new Date(Date.now() - 15000)
        }
    ]);

    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const suggestedPrompts = [
        "Explain useEffect in simple terms",
        "What's the difference between props and state?",
        "Show me a custom hook example",
        "How does component lifecycle work?"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (inputText.trim()) {
            const newMessage = {
                id: Date.now(),
                type: 'user',
                text: inputText,
                timestamp: new Date()
            };
            setMessages([...messages, newMessage]);
            setInputText('');

            setIsTyping(true);
            setTimeout(() => {
                const aiResponse = {
                    id: Date.now() + 1,
                    type: 'ai',
                    text: "**That's a great question!** \n\nLet me help you understand that concept better. Here is a simulated code snippet:\n```javascript\nconst learning = true;\nconsole.log('Keep growing!');\n```",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiResponse]);
                setIsTyping(false);
            }, 2000);
        }
    };

    const handlePromptClick = (prompt) => {
        setInputText(prompt);
    };

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col max-w-5xl mx-auto p-6">

            <div className="flex-1 flex flex-col bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden shadow-xl">
                <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 scroll-smooth">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex gap-4 animate-slide-in ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                            {message.type === 'ai' && (
                                <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-md">
                                    <Sparkles size={20} />
                                </div>
                            )}
                            <div className={`max-w-[85%] flex flex-col gap-2 ${message.type === 'user' ? 'items-end' : ''}`}>
                                <div className={`p-5 rounded-2xl shadow-sm ${message.type === 'user'
                                    ? 'bg-gradient-accent text-white rounded-tr-none'
                                    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 rounded-tl-none'
                                    }`}>
                                    {message.type === 'ai' ? (
                                        <div className="text-slate-800 dark:text-slate-200 text-base">
                                            <ReactMarkdown components={MarkdownComponents}>
                                                {message.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="mb-0 leading-relaxed whitespace-pre-wrap text-base font-medium">{message.text}</p>
                                    )}
                                </div>

                                {message.sources && (
                                    <div className="flex flex-col gap-2 mt-1 ml-2">
                                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">
                                            <FileText size={12} />
                                            <span>Sources</span>
                                        </div>
                                        <div className="flex gap-3 flex-wrap">
                                            {message.sources.map((source, index) => (
                                                <Card key={index} variant="solid" className="p-3 cursor-pointer !shadow-sm hover:!shadow-md hover:!border-primary-200 dark:hover:!border-primary-900 transition-all border border-slate-200 dark:border-slate-700 max-w-xs group">
                                                    <h5 className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-1 group-hover:text-primary-500">{source.title}</h5>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0 overflow-hidden text-ellipsis whitespace-nowrap">{source.snippet}</p>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <span className={`text-xs px-2 mt-1 font-medium ${message.type === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center text-white flex-shrink-0 mt-1">
                                <Sparkles size={20} />
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <div className="flex gap-1.5 py-1">
                                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]"></span>
                                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]"></span>
                                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="p-6 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2 mb-4 flex-wrap">
                        {suggestedPrompts.map((prompt, index) => (
                            <button
                                key={index}
                                className="px-4 py-2 rounded-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm cursor-pointer transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500 hover:-translate-y-0.5 whitespace-nowrap"
                                onClick={() => handlePromptClick(prompt)}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <input
                            type="text"
                            className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-sans transition-colors focus:outline-none focus:border-primary-500"
                            placeholder="Ask me anything..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button
                            variant="primary"
                            icon={<Send size={20} />}
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                        >
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIMentor;
