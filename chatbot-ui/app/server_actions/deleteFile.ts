'use server';

import { redirect } from 'next/navigation';
import createClient from 'openapi-fetch';
import { paths } from '@/app/types/api';
import { tags } from '@/app/server_actions/tags';
import getSession from '@/app/server_actions/session';
import { envConfigures } from '@/app/utils/config';

type DeleteFileResult = {
  type: 'success' | 'error';
  detail: string;
};

export const deleteFile = async (
  teamId: string,
  fileId: string,
): Promise<DeleteFileResult> => {
  const { loggedIn, user } = await getSession();
  if (!loggedIn) redirect('/api/auth/signin');
  const token = user.accessToken;

  try {
    const client = createClient<paths>({
      baseUrl: envConfigures.langchain_api_host,
    });
    const res = await client.DELETE('/api/teams/{team_id}/files/{file_id}', {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        path: {
          team_id: teamId,
          file_id: fileId,
        },
      },
      next: {
        tags: [tags.teamFilesTag(teamId)],
      },
    });

    if (res.error) {
      throw new Error('エラーが発生しました。ESRE UI のログを確認してください。 エラー内容:' + res.error?.detail);
    }

    console.log(`deleteFile: ${res}`)

    return { type: 'success', detail: '' };
  } catch(e: any) {
    return { type: 'error', detail: e.toString() };
  }
};
