import { BotTypes, Conversation } from '@/app/types/chat';

// 互換性維持のために使用。
export const cleanSelectedConversation = (conversation: Conversation) => {
  // added model for each conversation (3/20/23)
  // added system prompt for each conversation (3/21/23)
  // added folders (3/23/23)
  // added prompts (3/26/23)

  let updatedConversation = conversation;

  // check for model on each conversation
  if (!updatedConversation.botType) {
    updatedConversation = {
      ...updatedConversation,
      botType: updatedConversation.botType || BotTypes[0],
    };
  }

  if (!updatedConversation.folderId) {
    updatedConversation = {
      ...updatedConversation,
      folderId: updatedConversation.folderId || null,
    };
  }

  return updatedConversation;
};

// ローカルストレージやインポート機能で読み込んだデータフォーマットが過去のバージョンのものだった場合、現在のバージョンに変換する。
export const cleanConversationHistory = (history: any[]): Conversation[] => {
  // added model for each conversation (3/20/23)
  // added system prompt for each conversation (3/21/23)
  // added folders (3/23/23)
  // added prompts (3/26/23)

  if (!Array.isArray(history)) {
    console.warn('history is not an array. Returning an empty array.');
    return [];
  }

  return history.reduce((acc: any[], conversation) => {
    try {
      if (!conversation.botType) conversation.botType = BotTypes[0];

      // NOTE: STEP 1.0 のデータ構造と互換性をとるための変換
      if (conversation.ragType) {
        if (
          ['fulltext-rag', 'vector-rag', 'hybrid-rag'].includes(
            conversation.ragType.id,
          )
        )
          conversation.botType = conversation.ragType.id;

        delete conversation.ragType;
      }

      if (conversation.prompt) delete conversation.prompt;

      if (!conversation.folderId) {
        conversation.folderId = null;
      }

      acc.push(conversation);
      return acc;
    } catch (error) {
      console.warn(
        `error while cleaning conversations' history. Removing culprit`,
        error,
      );
    }
    return acc;
  }, []);
};
