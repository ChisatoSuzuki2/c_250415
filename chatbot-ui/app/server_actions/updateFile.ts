'use server';

import { redirect } from 'next/navigation';
import createClient from 'openapi-fetch';
import { paths } from '@/app/types/api';
import { tags } from '@/app/server_actions/tags';
import getSession from '@/app/server_actions/session';
import { envConfigures } from '@/app/utils/config';

type UpdateFileResult = {
  type: 'success' | 'bad-request' | 'error';
  detail: string;
};

export const updateFile = async (
  teamId: string,
  fileId: string,
  url: string,
): Promise<UpdateFileResult> => {
  const { loggedIn, user } = await getSession();
  if (!loggedIn) redirect('/api/auth/signin');
  const token = user.accessToken;

  const client = createClient<paths>({
    baseUrl: envConfigures.langchain_api_host,
  });

  try {
    const res = await client.PATCH('/api/teams/{team_id}/files/{file_id}', {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        path: {
          team_id: teamId,
          file_id: fileId,
        },
      },
      body: {
        url,
      },
      next: {
        tags: [tags.teamFilesTag(teamId)],
      },
    });

    if (res.error) {
      if (res.response.status === 400) return { type: 'bad-request', detail: String(res.error?.detail || '') };
      throw new Error('エラーが発生しました。ESRE UI のログを確認してください。 エラー内容:' + res.error?.detail);
    }

    console.log(`updateFile: ${res}`);
    return { type: 'success', detail: '' };
  } catch (e: any) {
    return { type: 'error', detail: e.toString() };
  }
};
