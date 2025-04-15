'use server';

import createClient from 'openapi-fetch';
import { components, paths } from '@/app/types/api';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { tags } from '@/app/server_actions/tags';
import getSession from '@/app/server_actions/session';
import { envConfigures } from '@/app/utils/config';

export type CreateTeam = components['schemas']['TeamPost'];

export type CreateTeamResult = {
  type: 'success' | 'team-id-already-exists' | 'bad-request' | 'error';
  detail: string;
};

export const createTeam = async (
  team: CreateTeam,
): Promise<CreateTeamResult> => {
  const { loggedIn, user } = await getSession();
  if (!loggedIn) redirect('/api/auth/signin');
  const token = user.accessToken;

  try {
    const client = createClient<paths>({
      baseUrl: envConfigures.langchain_api_host,
    });
    const res = await client.POST('/api/teams', {
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: team,
    });

    if (res.error) {
      if (res.response.status === 409) return { type: 'team-id-already-exists', detail: String(res.error?.detail || '') };
      if (res.response.status === 400) return { type: 'bad-request', detail: String(res.error?.detail || '') };

      throw new Error('エラーが発生しました。ESRE UI のログを確認してください。 エラー内容:' + res.error?.detail);
    }

    revalidateTag(tags.teamsTag());

    console.log(`createTeam: ${res}`)

    return { type: 'success', detail: '' };
  } catch (e: any ) {
    return { type: 'error', detail: e.toString() };
  }
};
