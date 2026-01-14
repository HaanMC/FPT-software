/**
 * AI Chat Page - Study Assistant with Context Awareness
 * Notion/Linear-inspired UI with conversation management
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { useT, useLanguage } from '../i18n';
import { isAiEnabled, sendChatMessage } from '../lib/ai/geminiClient';
import { Card, Button, Badge, Input, Modal, Toggle } from '../components/ui';
import { Conversation, ChatMessage, ChatContextOptions } from '../types';
import {
  MessageCircle,
  Plus,
  Search,
  Send,
  Trash2,
  Edit3,
  ChevronRight,
  User,
  Bot,
  Lightbulb,
  BookOpen,
  HelpCircle,
  FileText,
  Brain,
  AlertCircle,
  CheckSquare,
  Clock,
  Target,
  Zap,
  MoreHorizontal,
  X,
  Loader2,
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const {
    state,
    addConversation,
    updateConversation,
    deleteConversation,
    setActiveConversation,
    addMessageToConversation,
    getActiveConversation,
    showToast,
  } = useGlobal();
  const t = useT();
  const language = useLanguage();

  // Local state
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextOptions, setContextOptions] = useState<ChatContextOptions>({
    includeTasks: true,
    includeProject: true,
    includeQuizMistakes: true,
    includeDistractions: false,
    includeNotes: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = getActiveConversation();
  const aiEnabled = isAiEnabled();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length]);

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.setDate(now.getDate() - 1)).toDateString();

    const groups: { today: Conversation[]; yesterday: Conversation[]; older: Conversation[] } = {
      today: [],
      yesterday: [],
      older: [],
    };

    const filtered = searchQuery
      ? state.conversations.filter((c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : state.conversations;

    filtered.forEach((conv) => {
      const convDate = new Date(conv.updatedAt).toDateString();
      if (convDate === today) {
        groups.today.push(conv);
      } else if (convDate === yesterday) {
        groups.yesterday.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [state.conversations, searchQuery]);

  // Build context string
  const buildContext = (): string => {
    const parts: string[] = [];

    if (state.settings.userName) {
      parts.push(`Student name: ${state.settings.userName}`);
    }

    if (contextOptions.includeTasks) {
      const todayTasks = state.tasks
        .filter((t) => t.status !== 'done')
        .slice(0, 5)
        .map((t) => `- ${t.title}${t.projectId ? ` (${state.projects.find((p) => p.id === t.projectId)?.name})` : ''}`);
      if (todayTasks.length > 0) {
        parts.push(`Today's tasks:\n${todayTasks.join('\n')}`);
      }
    }

    if (contextOptions.includeProject) {
      const recentSession = state.sessions.filter((s) => s.type === 'focus').slice(-1)[0];
      if (recentSession) {
        parts.push(`Currently studying: ${recentSession.subject}`);
      }
    }

    if (contextOptions.includeQuizMistakes) {
      const recentSessions = state.sessions.filter((s) => s.quizScore !== null && s.quizScore < 100).slice(-3);
      const wrongSubjects = [...new Set(recentSessions.map((s) => s.subject))];
      if (wrongSubjects.length > 0) {
        parts.push(`Subjects needing review: ${wrongSubjects.join(', ')}`);
      }
    }

    if (contextOptions.includeDistractions) {
      const recentDistractions = state.sessions
        .flatMap((s) => s.distractions)
        .slice(-5)
        .map((d) => d.category);
      const uniqueDistractions = [...new Set(recentDistractions)];
      if (uniqueDistractions.length > 0) {
        parts.push(`Recent distractions: ${uniqueDistractions.join(', ')}`);
      }
    }

    return parts.join('\n\n');
  };

  // Quick action handlers
  const quickActions = [
    { id: 'explain', label: t.chat.explainConcept, icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'plan', label: t.chat.studyPlan, icon: <Clock className="w-4 h-4" /> },
    { id: 'questions', label: t.chat.practiceQuestions, icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'summarize', label: t.chat.summarizeNotes, icon: <FileText className="w-4 h-4" /> },
    { id: 'quiz', label: t.chat.quizMe, icon: <Brain className="w-4 h-4" /> },
  ];

  const getOfflineResponse = (actionId: string): string => {
    const responses: Record<string, string> = {
      explain: t.offline.explainConcept,
      plan: t.offline.studyPlan,
      questions: t.offline.practiceQuestions,
      summarize: t.offline.summarizeNotes,
      quiz: t.offline.quizMe,
    };
    return responses[actionId] || t.offline.explainConcept;
  };

  const handleQuickAction = async (actionId: string) => {
    const action = quickActions.find((a) => a.id === actionId);
    if (!action) return;

    let convId = state.activeConversationId;
    if (!convId) {
      const conv = addConversation(action.label);
      convId = conv.id;
    }

    // Add user message
    addMessageToConversation(convId, {
      role: 'user',
      content: action.label,
    });

    setIsLoading(true);

    try {
      let response: string;
      if (aiEnabled) {
        const context = buildContext();
        const messages = activeConversation?.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })) || [];
        messages.push({ role: 'user', content: action.label });

        response = await sendChatMessage(messages, { language, context });
      } else {
        // Offline fallback
        await new Promise((resolve) => setTimeout(resolve, 500));
        response = getOfflineResponse(actionId);
      }

      addMessageToConversation(convId, {
        role: 'assistant',
        content: response,
      });
    } catch (error) {
      showToast(t.common.error, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');

    let convId = state.activeConversationId;
    if (!convId) {
      const conv = addConversation(message.slice(0, 30) + (message.length > 30 ? '...' : ''));
      convId = conv.id;
    }

    // Add user message
    addMessageToConversation(convId, {
      role: 'user',
      content: message,
    });

    setIsLoading(true);

    try {
      let response: string;
      if (aiEnabled) {
        const context = buildContext();
        const currentConv = state.conversations.find((c) => c.id === convId);
        const messages = currentConv?.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })) || [];
        messages.push({ role: 'user', content: message });

        response = await sendChatMessage(messages, { language, context });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        response = language === 'vi'
          ? "AI đang ở chế độ ngoại tuyến. Hãy thử các hành động nhanh ở trên để nhận hướng dẫn học tập mẫu."
          : "AI is in offline mode. Try the quick actions above for template study guidance.";
      }

      addMessageToConversation(convId, {
        role: 'assistant',
        content: response,
      });

      // Update conversation title if first message
      const conv = state.conversations.find((c) => c.id === convId);
      if (conv && conv.messages.length <= 2) {
        updateConversation(convId, { title: message.slice(0, 40) + (message.length > 40 ? '...' : '') });
      }
    } catch (error) {
      showToast(t.common.error, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    addConversation(t.chat.newChat);
  };

  const handleDeleteChat = (id: string) => {
    deleteConversation(id);
    setShowDeleteModal(null);
    showToast(t.chat.deleteChat, 'success');
  };

  const handleRenameChat = () => {
    if (showRenameModal && renameValue.trim()) {
      updateConversation(showRenameModal, { title: renameValue.trim() });
      setShowRenameModal(null);
      setRenameValue('');
    }
  };

  // Calculate context data for panel
  const todayTasks = state.tasks.filter((t) => t.status !== 'done').slice(0, 5);
  const flashcardsDue = state.decks.reduce((acc, deck) => {
    const today = new Date().toISOString().split('T')[0];
    return acc + deck.cards.filter((c) => c.nextReviewDate <= today).length;
  }, 0);
  const recentSessions = state.sessions.filter((s) => s.type === 'focus').slice(-3);
  const wrongTopics = [...new Set(
    state.sessions
      .filter((s) => s.quizScore !== null && s.quizScore < 70)
      .slice(-5)
      .map((s) => s.subject)
  )];
  const recentDistractions = [...new Set(
    state.sessions
      .flatMap((s) => s.distractions)
      .slice(-10)
      .map((d) => d.category)
  )];

  return (
    <div className="h-full flex">
      {/* Conversation List (Left Panel) */}
      <div className="w-64 border-r border-gray-200 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <Button onClick={handleNewChat} fullWidth>
            <Plus className="w-4 h-4" />
            {t.chat.newChat}
          </Button>
        </div>

        {/* Search */}
        <div className="p-3">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder={t.chat.searchChats}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {groupedConversations.today.length > 0 && (
            <div className="mb-4">
              <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">{t.chat.today}</p>
              {groupedConversations.today.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === state.activeConversationId}
                  onClick={() => setActiveConversation(conv.id)}
                  onDelete={() => setShowDeleteModal(conv.id)}
                  onRename={() => {
                    setRenameValue(conv.title);
                    setShowRenameModal(conv.id);
                  }}
                />
              ))}
            </div>
          )}

          {groupedConversations.yesterday.length > 0 && (
            <div className="mb-4">
              <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">{t.chat.yesterday}</p>
              {groupedConversations.yesterday.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === state.activeConversationId}
                  onClick={() => setActiveConversation(conv.id)}
                  onDelete={() => setShowDeleteModal(conv.id)}
                  onRename={() => {
                    setRenameValue(conv.title);
                    setShowRenameModal(conv.id);
                  }}
                />
              ))}
            </div>
          )}

          {groupedConversations.older.length > 0 && (
            <div className="mb-4">
              <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">{t.chat.older}</p>
              {groupedConversations.older.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === state.activeConversationId}
                  onClick={() => setActiveConversation(conv.id)}
                  onDelete={() => setShowDeleteModal(conv.id)}
                  onRename={() => {
                    setRenameValue(conv.title);
                    setShowRenameModal(conv.id);
                  }}
                />
              ))}
            </div>
          )}

          {state.conversations.length === 0 && (
            <div className="text-center py-8 px-4">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{t.chat.noChats}</p>
              <p className="text-xs text-gray-400 mt-1">{t.chat.startConversation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area (Center) */}
      <div className="flex-1 flex flex-col">
        {/* AI Status Banner */}
        {!aiEnabled && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700">{t.chat.aiUnavailable}</span>
            <Badge variant="warning" size="sm">{t.chat.offlineMode}</Badge>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeConversation?.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t.chat.thinking}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">{t.chat.quickActions}</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Composer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.chat.typeMessage}
              disabled={isLoading}
              rows={2}
              className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:opacity-50"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="lg"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Context Panel (Right) */}
      <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
          {t.chat.studyContext}
        </h3>

        {/* User Info */}
        {state.settings.userName && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-1">{t.chat.userInfo}</p>
            <p className="text-sm text-gray-900">{state.settings.userName}</p>
            <p className="text-xs text-gray-500">{language === 'vi' ? 'Tiếng Việt' : 'English'}</p>
          </div>
        )}

        {/* Today's Tasks */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">{t.chat.todayTasksSummary}</p>
            <Toggle
              checked={contextOptions.includeTasks}
              onChange={(checked) => setContextOptions({ ...contextOptions, includeTasks: checked })}
            />
          </div>
          <div className="space-y-1">
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckSquare className="w-3 h-3 text-gray-400" />
                  <span className="truncate">{task.title}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No tasks</p>
            )}
          </div>
        </div>

        {/* Flashcards Due */}
        <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">{t.chat.flashcardsDue}</p>
          <p className="text-2xl font-bold text-indigo-600">{flashcardsDue}</p>
        </div>

        {/* Recent Sessions */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">{t.chat.recentSessions}</p>
            <Toggle
              checked={contextOptions.includeProject}
              onChange={(checked) => setContextOptions({ ...contextOptions, includeProject: checked })}
            />
          </div>
          <div className="space-y-2">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <div key={session.id} className="text-xs p-2 bg-white rounded border border-gray-200">
                  <p className="font-medium text-gray-700">{session.subject}</p>
                  <p className="text-gray-500">
                    {Math.round(session.durationSeconds / 60)} {t.common.min}
                    {session.quizScore !== null && ` • ${session.quizScore}%`}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No recent sessions</p>
            )}
          </div>
        </div>

        {/* Wrong Topics */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">{t.chat.wrongTopics}</p>
            <Toggle
              checked={contextOptions.includeQuizMistakes}
              onChange={(checked) => setContextOptions({ ...contextOptions, includeQuizMistakes: checked })}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {wrongTopics.length > 0 ? (
              wrongTopics.map((topic) => (
                <Badge key={topic} variant="warning" size="sm">{topic}</Badge>
              ))
            ) : (
              <p className="text-xs text-gray-400">None</p>
            )}
          </div>
        </div>

        {/* Recent Distractions */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">{t.chat.recentDistractions}</p>
            <Toggle
              checked={contextOptions.includeDistractions}
              onChange={(checked) => setContextOptions({ ...contextOptions, includeDistractions: checked })}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {recentDistractions.length > 0 ? (
              recentDistractions.map((distraction) => (
                <Badge key={distraction} variant="danger" size="sm">{distraction}</Badge>
              ))
            ) : (
              <p className="text-xs text-gray-400">None</p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        title={t.chat.deleteChat}
      >
        <p className="text-sm text-gray-600 mb-4">{t.chat.deleteConfirm}</p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setShowDeleteModal(null)}>
            {t.common.cancel}
          </Button>
          <Button variant="danger" fullWidth onClick={() => showDeleteModal && handleDeleteChat(showDeleteModal)}>
            {t.common.delete}
          </Button>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal
        open={!!showRenameModal}
        onClose={() => setShowRenameModal(null)}
        title={t.chat.renameChat}
      >
        <Input
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          placeholder={t.chat.newChat}
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <Button variant="ghost" fullWidth onClick={() => setShowRenameModal(null)}>
            {t.common.cancel}
          </Button>
          <Button fullWidth onClick={handleRenameChat}>
            {t.common.save}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// Conversation List Item Component
interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
  onDelete,
  onRename,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`group relative flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors ${
        isActive ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200 text-gray-700'
      }`}
      onClick={onClick}
    >
      <MessageCircle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 text-sm truncate">{conversation.title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 rounded transition-opacity"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRename();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Message Bubble Component
interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[70%] px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-white border border-gray-200 text-gray-800'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-indigo-200' : 'text-gray-400'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
