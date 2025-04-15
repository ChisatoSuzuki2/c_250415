'use server';

import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { tags } from '@/app/server_actions/tags';
import getSession from '@/app/server_actions/session';
import { envConfigures } from '@/app/utils/config';

type UploadFileResult = {
  type: 'success' | 'extension-not-supported' | 'bad-request' | 'not-found' | 'conflict' | 'error';
  detail: string;
}


export const uploadFile = async (
  teamId: string,
  formData: FormData,
): Promise<UploadFileResult> => {
  const { loggedIn, user } = await getSession();
  if (!loggedIn) redirect('/api/auth/signin');
  const token = user.accessToken;
  try {
      const res = await fetch(
      `${envConfigures.langchain_api_host}/api/teams/${teamId}/files`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );
    console.log(`uploadFile: ${res}`);
    if (!res.ok) {
      // detail にエラーメッセージを格納

      // const detail = String(await res.body?.getReader().read() || "");
      const detail = await res.text() || '';
      if (res.status === 400) {
        if (detail.includes('ExtensionNotSupportedException'))
          return { type: 'extension-not-supported', detail: detail };
        else
          return { type: 'bad-request', detail: detail }
      }
      if (res.status === 404) return { type: 'not-found', detail: detail };
      if (res.status === 409) return { type: 'conflict', detail: detail };
      return { type: 'error', detail: detail };
    }
    revalidateTag(tags.teamFilesTag(teamId));
    return { type: 'success', detail: '' };
  } catch (e: any) {
    return { type: 'error', detail: e.toString() };
  }
};
