'use server';

import { redirect } from 'next/navigation';
import createClient from 'openapi-fetch';
import { components, paths } from '@/app/types/api';
import { revalidateTag } from 'next/cache';
import { tags } from '@/app/server_actions/tags';
import getSession from '@/app/server_actions/session';
import { envConfigures } from '@/app/utils/config';
import { QueryOptions } from 'winston';

export type UpdateTeam = components['schemas']['TeamPatch'];

type UpdateTeamResult = { 
  type: 'success' | 'bad-request' | 'forbidden' | 'error';
  detail: string;
}

export const updateTeam = async (
  teamId: string,
  team: UpdateTeam,
): Promise<UpdateTeamResult> => {
  const { loggedIn, user } = await getSession();
  if (!loggedIn) redirect('/api/auth/signin');
  const token = user.accessToken;

  const client = createClient<paths>({
    baseUrl: envConfigures.langchain_api_host,
  });

  try {
    const res = await client.PATCH('/api/teams/{team_id}', {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        path: {
          team_id: teamId,
        },
      },
      body: team,
    });

    if (res.error) {
      if (res.response.status === 400) return { type: 'bad-request', detail: String(res.error?.detail || '') };
      if (res.response.status === 403) return { type: 'forbidden', detail: String(res.error?.detail || '') };
  
      throw new Error('エラーが発生しました。ESRE UI のログを確認してください。 エラー内容:' + res.error?.detail);
    }
  
    revalidateTag(tags.teamsTag());
    console.log(`updateTeam: ${res}`)
    return { type: 'success', detail: '' };
  } catch (e: any) {
    return { type: 'error', detail: e.toString() };
  } 
};
