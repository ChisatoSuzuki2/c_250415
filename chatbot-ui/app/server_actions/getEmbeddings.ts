'use server';

import { components, paths } from '@/app/types/api';
import createClient from 'openapi-fetch';
import { redirect } from 'next/navigation';
import { tags } from '@/app/server_actions/tags';
import getSession from '@/app/server_actions/session';
import { envConfigures } from '@/app/utils/config';

export type Embedding = components['schemas']['EmbeddingModelGetResult'];

export const getEmbeddings = async (): Promise<Embedding[]> => {
  const { loggedIn, user } = await getSession();
  if (!loggedIn) return redirect('/api/auth/signin');
  const token = user.accessToken;

  const client = createClient<paths>({
    baseUrl: envConfigures.langchain_api_host,
  });
  const res = await client.GET('/api/embeddings', {
    headers: {
      authorization: `Bearer ${token}`,
    },
    next: {
      tags: [tags.embeddingsTag()],
    },
    cache: 'no-cache',
  });

  if (res.error)
    throw new Error('エラーが発生しました。ESRE UI のログを確認してください。 エラー内容:' + res.error?.detail);

  console.log(`createClient: ${res}`)

  return res.data;
};
