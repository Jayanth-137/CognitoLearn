import { createContext, useContext, useState, useCallback } from 'react';

const ChatPanelContext = createContext(null);

export function ChatPanelProvider({ children, onChatOpenChange }) {
    const [chatOpen, setChatOpen] = useState(false);
    const [chatRoadmapId, setChatRoadmapId] = useState(null);
    const [chatRoadmap, setChatRoadmap] = useState(null);
    const [chatInitialTopic, setChatInitialTopic] = useState(null);

    const openChat = useCallback(({ roadmapId, roadmap, initialTopic = null }) => {
        setChatRoadmapId(roadmapId);
        setChatRoadmap(roadmap);
        setChatInitialTopic(initialTopic);
        setChatOpen(true);
        onChatOpenChange?.(true);
    }, [onChatOpenChange]);

    const closeChat = useCallback(() => {
        setChatOpen(false);
        setChatInitialTopic(null);
        onChatOpenChange?.(false);
    }, [onChatOpenChange]);

    return (
        <ChatPanelContext.Provider value={{
            chatOpen,
            chatRoadmapId,
            chatRoadmap,
            chatInitialTopic,
            openChat,
            closeChat
        }}>
            {children}
        </ChatPanelContext.Provider>
    );
}

export function useChatPanel() {
    const ctx = useContext(ChatPanelContext);
    if (!ctx) throw new Error('useChatPanel must be used within ChatPanelProvider');
    return ctx;
}
