'use server';

import { components, paths } from '@/app/types/api';
import { redirect } from 'next/navigation';
import createClient from 'openapi-fetch';
import { tags } from '@/app/server_actions/tags';
import getSession from '@/app/server_actions/session';
import { envConfigures } from '@/app/utils/config';

export type File = components['schemas']['FileGetResult'];

type GetFilesResult =
  | { type: 'success'; files: File[] }
  | { type: 'not-found' };

export const getFiles = async (teamId: string): Promise<GetFilesResult> => {
  const { loggedIn, user } = await getSession();
  if (!loggedIn) redirect('/api/auth/signin');
  const token = user.accessToken;

  const client = createClient<paths>({
    baseUrl: envConfigures.langchain_api_host,
  });
  const res = await client.GET('/api/teams/{team_id}/files', {
    headers: {
      authorization: `Bearer ${token}`,
    },
    params: {
      path: {
        team_id: teamId,
      },
    },
    next: {
      tags: [tags.teamFilesTag(teamId)],
    },
    cache: 'no-cache',
  });

  if (res.error) {
    if (res.response.status === 404) return { type: 'not-found' };

    throw new Error('エラーが発生しました。ESRE UI のログを確認してください。 エラー内容:' + res.error?.detail);
  }

  console.log(`getFiles: ${res}`)

  return { type: 'success', files: res.data };
};
