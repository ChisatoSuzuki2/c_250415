'use server';

import { components, paths } from '@/app/types/api';
import { redirect } from 'next/navigation';
import { tags } from '@/app/server_actions/tags';
import createClient from 'openapi-fetch';
import getSession from '@/app/server_actions/session';
import { envConfigures } from '@/app/utils/config';

export type Settings = components['schemas']['SettingsOut'];

export const getSettings = async (): Promise<Settings[]> => {
  const { loggedIn, user } = await getSession();
  if (!loggedIn) redirect('/api/auth/signin');
  const token = user.accessToken;

  const client = createClient<paths>({
    baseUrl: envConfigures.langchain_api_host,
  });
  const res = await client.GET('/api/settings', {
    headers: {
      authorization: `Bearer ${token}`,
    },
    next: {
      tags: [tags.settingsListTag()],
    },
    cache: 'no-cache',
  });

  if (res.error)
    throw new Error('エラーが発生しました。ESRE UI のログを確認してください。 エラー内容:' + res.error?.detail);

  console.log(`getSettings: ${res}`)

  return res.data;
};
