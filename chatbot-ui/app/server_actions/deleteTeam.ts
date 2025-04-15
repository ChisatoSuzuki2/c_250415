'use server';

import createClient from 'openapi-fetch';
import { paths } from '@/app/types/api';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { tags } from '@/app/server_actions/tags';
import getSession from '@/app/server_actions/session';
import { envConfigures } from '@/app/utils/config';

type DeleteTeamResponse = {
  type: 'success' | 'forbidden' | 'error';
  detail: string;
};

export const deleteTeam = async (
  teamId: string,
): Promise<DeleteTeamResponse> => {
  const { loggedIn, user } = await getSession();
  if (!loggedIn) return redirect('/api/auth/signin');
  const token = user.accessToken;

  try {
    const client = createClient<paths>({
      baseUrl: envConfigures.langchain_api_host,
    });

    const res = await client.DELETE('/api/teams/{team_id}', {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        path: { team_id: teamId },
      },
    });

    revalidateTag(tags.teamsTag());

    if (res.error) {
      if (res.response.status === 403) {
        return { type: 'forbidden', detail: String(res.error?.detail || '') };
      } else {
        throw new Error('エラーが発生しました。ESRE UI のログを確認してください。 エラー内容:' + res.error?.detail);
      }
    }

    console.log(`deleteTeam: ${res}`)

    return { type: 'success', detail: '' };
  } catch (e: any) {
    return { type: 'error', detail: e.toString() };
  }
};
