import { LangChainContext } from '@/app/hooks/useSendMessage';

export type Message = UserMessage | AssistantMessage;

export type UserMessage = {
  role: 'user';
  content: string;
};

export type AssistantMessage = {
  role: 'assistant';
  content: string;
  context?: LangChainContext[];
  configuration?: MessageConfiguration;
};

export type MessageConfiguration = {
  botType: BotType;
  llmModelId: string;
  settingsId: string | null;
};

export type Role = 'assistant' | 'user';

export const BotTypes = [
  'llm-only',
  'vector-rag',
  'fulltext-rag',
  'hybrid-rag',
] as const;

export type BotType = (typeof BotTypes)[number];

export const BotDefinitions = {
  'llm-only': {
    endpoint: '/api/langchain/llm' as const,
  },
  'fulltext-rag': {
    strategy: 'fulltext' as const,
    endpoint: '/api/langchain/rag' as const,
  },
  'vector-rag': {
    strategy: 'vector' as const,
    endpoint: '/api/langchain/rag' as const,
  },
  'hybrid-rag': {
    strategy: 'hybrid' as const,
    endpoint: '/api/langchain/rag' as const,
  },
};

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  botType: BotType;
  folderId: string | null;
  teamId: string | null;
  llmModelId: string | null;
  settingsId: string | null;
}
