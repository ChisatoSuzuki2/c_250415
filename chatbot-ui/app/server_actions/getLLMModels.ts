  'use server';

import { components, paths } from '@/app/types/api';
import { redirect } from 'next/navigation';
import { tags } from '@/app/server_actions/tags';
import createClient from 'openapi-fetch';
import getSession from '@/app/server_actions/session';
import { envConfigures } from '@/app/utils/config';

export type LLMModel = components['schemas']['LLMModelGetResult'];

export const getLLMModels = async (): Promise<LLMModel[]> => {
  const { loggedIn, user } = await getSession();
  if (!loggedIn) redirect('/api/auth/signin');
  const token = user.accessToken;

  const client = createClient<paths>({
    baseUrl: envConfigures.langchain_api_host,
  });
  const res = await client.GET('/api/llm_models', {
    headers: {
      authorization: `Bearer ${token}`,
    },
    next: {
      tags: [tags.llmModelsTag()],
    },
    cache: 'no-cache',
  });

  if (res.error)
    throw new Error('エラーが発生しました。ESRE UI のログを確認してください。 エラー内容:' + res.error?.detail);

  console.log(`getLLMModels: ${res}`)

  return res.data;
};
