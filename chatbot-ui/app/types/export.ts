import { Conversation, Message } from './chat';
import { Folder } from './folder';

export type SupportedExportFormats =
  | ExportFormatV1
  | ExportFormatV2
  | ExportFormatV3
  | ExportFormatV4
  | ExportFormatV5;
export type LatestExportFormat = ExportFormatV5;

////////////////////////////////////////////////////////////////////////////////////////////
interface ConversationV1 {
  id: number;
  name: string;
  messages: Message[];
}

export type ExportFormatV1 = ConversationV1[];

////////////////////////////////////////////////////////////////////////////////////////////
interface ChatFolder {
  id: number;
  name: string;
}

export interface ExportFormatV2 {
  history: Conversation[] | null;
  folders: ChatFolder[] | null;
}

////////////////////////////////////////////////////////////////////////////////////////////
export interface ExportFormatV3 {
  version: 3;
  history: Conversation[];
  folders: Folder[];
}

export interface ExportFormatV4 {
  version: 4;
  history: Conversation[];
  folders: Folder[];
  prompts: Prompt[];
}

export interface ExportFormatV5 {
  version: 5;
  conversations: Conversation[];
  folders: Folder[];
}

interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  model: {
    id: string;
    name: string;
    maxLength: number; // maximum length of a message
    tokenLimit: number;
  };
  folderId: string | null;
}
