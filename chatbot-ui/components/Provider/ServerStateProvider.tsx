'use client';

import React, { createContext, useContext } from 'react';
import { Team } from '@/app/server_actions/getTeams';
import { LLMModel } from '@/app/server_actions/getLLMModels';
import { Settings } from '@/app/server_actions/getSettings';
import { Embedding } from '@/app/server_actions/getEmbeddings';

type ServerState = {
  basePath: string;
  loginUserAttributes: {
    email: string;
    displayName: string;
    department: string;
    title: string;
  };
  documentKeys: {
    source: string;
    url: string;
  };
  teams: Team[];
  llmModels: LLMModel[];
  embeddings: Embedding[];
  settingsList: Settings[];
  uploadFileSizeLimitMB: number;
  authenticationEnabled: boolean;
};

const ServerStateContext = createContext<ServerState>({
  basePath: '',
  loginUserAttributes: {
    email: '',
    displayName: '',
    department: '',
    title: '',
  },
  documentKeys: {
    source: 'source',
    url: 'esre__url',
  },
  teams: [],
  llmModels: [],
  embeddings: [],
  settingsList: [],
  uploadFileSizeLimitMB: 100,
  authenticationEnabled: true,
});

export const ServerStateProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ServerState;
}) => {
  return (
    <ServerStateContext.Provider value={value}>
      {children}
    </ServerStateContext.Provider>
  );
};

export const useServerState = () => {
  return useContext(ServerStateContext);
};
