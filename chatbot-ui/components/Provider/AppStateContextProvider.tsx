'use client';

import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { BotType, Conversation, Message } from '@/app/types/chat';
import { Folder } from '@/app/types/folder';
import { useStorage } from '@/app/hooks/useStorage';
import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from '@/app/utils/clean';

type AppState = {
  selectedConversationId: string | null;
  conversations: Conversation[];
  currentMessage: Message | null;
  folders: Folder[];
  showSidebar: boolean;
  chatbotState: 'waiting-for-question' | 'requesting' | 'message-streaming';
  initialDataLoaded: boolean;
};

export type AppStateAction =
  | UIStateAction
  | ChatbotAction
  | ConversationAction
  | FolderAction
  | {
      type: 'initialDataLoaded';
    }
  | {
      type: 'conversationsUpdated';
      conversations: Conversation[];
    }
  | {
      type: 'currentMessageUpdated';
      message: Message | null;
    }
  | {
      type: 'foldersUpdated';
      folders: Folder[];
    };

type UIStateAction = {
  type: 'showSidebarUpdated';
  showSidebar: boolean;
};

type ConversationAction =
  | {
      type: 'conversationCreated';
      newConversation: Conversation;
    }
  | {
      type: 'conversationUpdated';
      conversation: Conversation;
    }
  | {
      type: 'conversationDeleted';
      conversationId: string;
    }
  | {
      type: 'conversationsCleared';
    }
  | {
      type: 'conversationSelected';
      conversationId: string | null;
    }
  | {
      type: 'teamSelected';
      teamId: string;
    }
  | {
      type: 'llmModelSelected';
      llmModelId: string;
    }
  | {
      type: 'settingsSelected';
      settingsId: string;
    }
  | {
      type: 'botTypeSelected';
      botType: BotType;
    };

type FolderAction =
  | {
      type: 'folderCreated';
      newFolder: Folder;
    }
  | {
      type: 'folderDeleted';
      folderId: string;
    }
  | {
      type: 'folderUpdated';
      folderId: string;
      name: string;
    };

type ChatbotAction =
  | {
      type: 'chatbotAsked';
    }
  | {
      type: 'chatbotStreamingStarted';
    }
  | {
      type: 'chatbotCompleted';
    };

const defaultState: AppState = {
  selectedConversationId: null,
  conversations: [],
  currentMessage: null,
  folders: [],
  showSidebar: true,
  chatbotState: 'waiting-for-question',
  initialDataLoaded: false,
};

const AppStateContext = createContext<AppState>(defaultState);

const AppStateDispatchContext = createContext<Dispatch<AppStateAction>>(
  () => {},
);

function appStateReducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case 'initialDataLoaded': {
      return { ...state, initialDataLoaded: true };
    }
    case 'conversationsUpdated': {
      return { ...state, conversations: action.conversations };
    }
    case 'currentMessageUpdated': {
      return { ...state, currentMessage: action.message };
    }
    case 'foldersUpdated': {
      return { ...state, folders: action.folders };
    }
    case 'showSidebarUpdated': {
      return { ...state, showSidebar: action.showSidebar };
    }
    case 'chatbotAsked': {
      if (state.chatbotState !== 'waiting-for-question')
        console.warn(`Unexpected chatbotState: ${state.chatbotState}`);
      return { ...state, chatbotState: 'requesting' };
    }
    case 'chatbotStreamingStarted': {
      if (state.chatbotState !== 'requesting')
        console.warn(`Unexpected chatbotState: ${state.chatbotState}`);
      return { ...state, chatbotState: 'message-streaming' };
    }
    case 'chatbotCompleted': {
      if (state.chatbotState === 'waiting-for-question')
        console.warn(`Current chatbotState is already ${state.chatbotState}`);
      return { ...state, chatbotState: 'waiting-for-question' };
    }
    case 'conversationCreated': {
      return {
        ...state,
        conversations: [...state.conversations, action.newConversation],
        selectedConversationId: action.newConversation.id,
      };
    }
    case 'conversationUpdated': {
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversation.id ? action.conversation : c,
        ),
      };
    }
    case 'conversationDeleted': {
      const conversations = state.conversations.filter(
        (c) => c.id !== action.conversationId,
      );

      if (
        state.selectedConversationId &&
        state.selectedConversationId === action.conversationId
      ) {
        // 選択中の会話を削除しようとしている場合
        return {
          ...state,
          conversations,
          selectedConversationId:
            conversations.length > 0
              ? conversations[conversations.length - 1].id
              : null,
        };
      } else {
        // 会話を何も選択していない、または選択中以外の会話を削除しようとしている場合は、conversations のみ更新する
        return {
          ...state,
          conversations,
        };
      }
    }
    case 'conversationSelected': {
      return {
        ...state,
        selectedConversationId: action.conversationId,
      };
    }
    case 'conversationsCleared': {
      return {
        ...state,
        conversations: [],
        selectedConversationId: null,
        folders: state.folders.filter((f) => f.type !== 'chat'),
      };
    }
    case 'teamSelected': {
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === state.selectedConversationId
            ? {
                ...c,
                teamId: action.teamId,
              }
            : c,
        ),
      };
    }
    case 'llmModelSelected': {
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === state.selectedConversationId
            ? {
                ...c,
                llmModelId: action.llmModelId,
              }
            : c,
        ),
      };
    }
    case 'botTypeSelected': {
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === state.selectedConversationId
            ? {
                ...c,
                botType: action.botType,
              }
            : c,
        ),
      };
    }
    case 'settingsSelected': {
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === state.selectedConversationId
            ? {
                ...c,
                settingsId: action.settingsId,
              }
            : c,
        ),
      };
    }
    case 'folderCreated': {
      return {
        ...state,
        folders: [...state.folders, action.newFolder],
      };
    }
    case 'folderDeleted': {
      return {
        ...state,
        folders: state.folders.filter((f) => f.id !== action.folderId),
        conversations: state.conversations.map((c) =>
          c.folderId ? { ...c, folderId: null } : c,
        ),
      };
    }
    case 'folderUpdated': {
      return {
        ...state,
        folders: state.folders.map((f) =>
          f.id === action.folderId ? { ...f, name: action.name } : f,
        ),
      };
    }
  }
}

const AppStateEffects = () => {
  const dispatch = useAppStateDispatch();
  const storage = useStorage();

  // 初めてマウントされた際にローカルストレージを初期データとして読み込む。
  useEffect(() => {
    const showChatbar = storage.getShowChatbar();
    if (showChatbar == null) {
      if (window.innerWidth < 640)
        dispatch({ type: 'showSidebarUpdated', showSidebar: false });
    } else {
      dispatch({ type: 'showSidebarUpdated', showSidebar: showChatbar });
    }

    const folders = storage.getFolders();
    dispatch({ type: 'foldersUpdated', folders });

    const conversationHistory = storage.getConversationHistory();
    const cleanedConversationHistory =
      cleanConversationHistory(conversationHistory);
    dispatch({
      type: 'conversationsUpdated',
      conversations: cleanedConversationHistory,
    });

    // 互換性のため今は使用していない `selectedConversation` も読み込む。 ID だけ抽出して使用する。
    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );
      dispatch({
        type: 'conversationSelected',
        conversationId: cleanedSelectedConversation.id,
      });
      // 以降は selectedConversationId として扱うため、このキーは削除する
      localStorage.removeItem('selectedConversation');
    } else {
      const selectedConversationId = storage.getSelectedConversationId();
      dispatch({
        type: 'conversationSelected',
        conversationId: selectedConversationId,
      });
    }

    dispatch({ type: 'initialDataLoaded' });
  }, [dispatch, storage]);

  return <></>;
};

export const AppStateContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(appStateReducer, defaultState);

  return (
    <AppStateContext.Provider value={state}>
      <AppStateDispatchContext.Provider value={dispatch}>
        <AppStateEffects />
        {children}
      </AppStateDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppState => {
  return useContext(AppStateContext);
};

export const useAppStateDispatch = (): Dispatch<AppStateAction> => {
  return useContext(AppStateDispatchContext);
};
