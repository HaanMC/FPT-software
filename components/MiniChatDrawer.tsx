/**
 * Mini Chat Drawer - Compact AI Chat for use during study sessions
 */

import React, { useState, useRef, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { useT, useLanguage } from '../i18n';
import { isAiEnabled, sendChatMessage } from '../lib/ai/geminiClient';
import { Button, Badge, Drawer } from './ui';
import { ChatMessage } from '../types';
import {
  X,
  Send,
  Loader2,
  User,
  Bot,
  MessageCircle,
  Lightbulb,
  HelpCircle,
  Brain,
  AlertCircle,
  Minimize2,
  Maximize2,
} from 'lucide-react';

export const MiniChatDrawer: React.FC = () => {
  const {
    state,
    miniChatOpen,
    setMiniChatOpen,
    addConversation,
    addMessageToConversation,
    getActiveConversation,
    showToast,
  } = useGlobal();
  const t = useT();
  const language = useLanguage();

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = getActiveConversation();
  const aiEnabled = isAiEnabled();
  const messages = activeConversation?.messages.slice(-10) || []; // Show last 10 messages

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, miniChatOpen]);

  // Quick actions for mini chat
  const quickActions = [
    { id: 'explain', label: t.chat.explainConcept, icon: <Lightbulb className="w-3 h-3" /> },
    { id: 'quiz', label: t.chat.quizMe, icon: <Brain className="w-3 h-3" /> },
  ];

  const buildContext = (): string => {
    const parts: string[] = [];
    if (state.settings.userName) {
      parts.push(`Student: ${state.settings.userName}`);
    }
    const recentSession = state.sessions.filter((s) => s.type === 'focus').slice(-1)[0];
    if (recentSession) {
      parts.push(`Currently studying: ${recentSession.subject}`);
    }
    return parts.join('\n');
  };

  const handleSendMessage = async (message?: string) => {
    const text = message || inputValue.trim();
    if (!text || isLoading) return;

    setInputValue('');

    let convId = state.activeConversationId;
    if (!convId) {
      const conv = addConversation(text.slice(0, 30) + (text.length > 30 ? '...' : ''));
      convId = conv.id;
    }

    addMessageToConversation(convId, { role: 'user', content: text });
    setIsLoading(true);

    try {
      let response: string;
      if (aiEnabled) {
        const context = buildContext();
        const currentConv = state.conversations.find((c) => c.id === convId);
        const chatMessages = currentConv?.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })) || [];
        chatMessages.push({ role: 'user', content: text });

        response = await sendChatMessage(chatMessages, { language, context });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 300));
        response = language === 'vi'
          ? "AI đang ở chế độ ngoại tuyến. Truy cập trang AI Chat để xem các hướng dẫn mẫu."
          : "AI is in offline mode. Visit the AI Chat page for template guidance.";
      }

      addMessageToConversation(convId, { role: 'assistant', content: response });
    } catch (error) {
      showToast(t.common.error, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!miniChatOpen) return null;

  return (
    <div className="fixed bottom-0 right-6 w-96 h-[500px] bg-white rounded-t-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="flex items-center gap-2 text-white">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">{t.chat.miniChat}</span>
        </div>
        <button
          onClick={() => setMiniChatOpen(false)}
          className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* AI Status */}
      {!aiEnabled && (
        <div className="px-3 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-xs text-amber-700">{t.chat.offlineMode}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{t.chat.startConversation}</p>
          </div>
        ) : (
          messages.map((message) => (
            <MiniMessageBubble key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">{t.chat.thinking}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-t border-gray-100 flex gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleSendMessage(action.label)}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chat.typeMessage}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            size="md"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Mini Message Bubble
interface MiniMessageBubbleProps {
  message: ChatMessage;
}

const MiniMessageBubble: React.FC<MiniMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'
        }`}
      >
        {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
      </div>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-white border border-gray-200 text-gray-800'
        }`}
      >
        <p className="whitespace-pre-wrap text-xs">{message.content}</p>
      </div>
    </div>
  );
};

export default MiniChatDrawer;
