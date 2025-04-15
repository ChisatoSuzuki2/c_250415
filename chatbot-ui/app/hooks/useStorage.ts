import { Conversation } from '@/app/types/chat';
import {
  useAppState,
  useAppStateDispatch,
} from '@/components/Provider/AppStateContextProvider';
import { Folder } from '@/app/types/folder';
import { useEffect, useMemo } from 'react';

const conversationHistoryKey = 'conversationHistory';
const selectedConversationIdKey = 'selectedConversationId';
const foldersKey = 'folders';
const showChatbarKey = 'showChatbar';

const deserializeArray = <T>(rawValue: string | null): T[] => {
  if (!rawValue) return [];
  return JSON.parse(rawValue);
};

const deserializeBoolean = (rawValue: string | null): boolean | null => {
  if (rawValue == null) return null;
  return JSON.parse(rawValue);
};

const setConversationHistory = (conversations: Conversation[]) => {
  localStorage.setItem(conversationHistoryKey, JSON.stringify(conversations));
};

const getConversationHistory = (): Conversation[] => {
  return deserializeArray(localStorage.getItem(conversationHistoryKey));
};

const setFolders = (folders: Folder[]) => {
  localStorage.setItem(foldersKey, JSON.stringify(folders));
};

const getFolders = (): Folder[] => {
  return deserializeArray(localStorage.getItem(foldersKey));
};

const setSelectedConversationId = (id: string | null) => {
  if (id) localStorage.setItem(selectedConversationIdKey, id);
  else localStorage.removeItem(selectedConversationIdKey);
};

const getSelectedConversationId = (): string | null => {
  return localStorage.getItem(selectedConversationIdKey);
};

const setShowChatbar = (showSidebar: boolean) => {
  localStorage.setItem(showChatbarKey, JSON.stringify(showSidebar));
};

const getShowChatbar = (): boolean | null => {
  return deserializeBoolean(localStorage.getItem(showChatbarKey));
};

export const useStorage = () => {
  const state = useAppState();
  const dispatch = useAppStateDispatch();

  // アプリケーションの状態を監視してローカルストレージに保存する
  useEffect(() => {
    if (!state.initialDataLoaded) return;

    setFolders(state.folders);
  }, [state.initialDataLoaded, state.folders]);

  useEffect(() => {
    if (!state.initialDataLoaded) return;

    setConversationHistory(state.conversations);
  }, [state.initialDataLoaded, state.conversations]);

  useEffect(() => {
    if (!state.initialDataLoaded) return;

    setShowChatbar(state.showSidebar);
  }, [state.initialDataLoaded, state.showSidebar]);

  useEffect(() => {
    if (!state.initialDataLoaded) return;

    setSelectedConversationId(state.selectedConversationId);
  }, [state.initialDataLoaded, state.selectedConversationId]);

  // 別タブでストレージが更新された際実行されるイベントハンドラ。ストレージのデータと UI の状態を同期する。
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      switch (event.key) {
        case conversationHistoryKey: {
          dispatch({
            type: 'conversationsUpdated',
            conversations: deserializeArray(event.newValue),
          });
          return;
        }
        case foldersKey: {
          dispatch({
            type: 'foldersUpdated',
            folders: deserializeArray(event.newValue),
          });
          return;
        }
        case selectedConversationIdKey: {
          // 選択中の会話はほかのタブと同期する必要がないので何もしない。
          return;
        }
        case showChatbarKey: {
          // サイドバーの表示/非表示はほかのタブと同期しない。
          return;
        }
      }
    };

    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('storage', handler);
    };
  }, [dispatch]);

  return useMemo(
    () => ({
      setConversationHistory,
      getConversationHistory,
      setSelectedConversationId,
      getSelectedConversationId,
      setFolders,
      getFolders,
      setShowChatbar,
      getShowChatbar,
    }),
    [],
  );
};
