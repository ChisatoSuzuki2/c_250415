export const tags = {
  settingsListTag: () => 'settings' as const,
  teamsTag: () => 'teams' as const,
  llmModelsTag: () => 'llm_models' as const,
  embeddingsTag: () => 'embeddings' as const,
  teamFilesTag: (teamId: string) => `teams/${teamId}/files` as const,
};
