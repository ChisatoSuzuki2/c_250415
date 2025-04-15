import '@/styles/globals.css';

import { dir } from 'i18next';
import React, { useEffect } from 'react';
import { Toaster } from '@/components/Toaster';
import { I18nContextProvider } from '@/app/i18n/I18nContextProvider';
import { ServerStateProvider } from '@/components/Provider/ServerStateProvider';
import { AppStateContextProvider } from '@/components/Provider/AppStateContextProvider';
import { redirect } from 'next/navigation';
import { Metadata, Viewport } from 'next';
import { getTeams } from '@/app/server_actions/getTeams';
import { getLLMModels } from '@/app/server_actions/getLLMModels';
import { getSettings } from '@/app/server_actions/getSettings';
import { getEmbeddings } from '@/app/server_actions/getEmbeddings';
import getSession from '@/app/server_actions/session';
import { envConfigures } from '@/app/utils/config';
import toast from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'RAG Sample App',
  description: 'This is a RAG sample app using elasticsearch.',
  appleWebApp: {
    title: 'RAG Sample App',
  },
};

export const viewport: Viewport = {
  height: 'device-height',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  const { loggedIn, user } = await getSession();
  if (!loggedIn) return redirect('/api/auth/signin');

  // Refactor me. must specify these type.
  let teams: any, llmModels: any, embeddings: any, settingsList: any;
  let error: string | null = null;

  try {
    [teams, llmModels, embeddings, settingsList] = await Promise.all([
      getTeams(),
      getLLMModels(),
      getEmbeddings(),
      getSettings(),
    ]);
  } catch (err) {
    if (err instanceof Error) {
          console.error('An error occurred while loading the initial data. There might have been a failure in communication with Esre-UI, or an error might have occurred on the Esre-UI side. Please contact the administrator.' + err);
          // Use alert instead of toast(not initialzied)
          error = 'An error occurred while loading the initial data.\n' +
            'There might have been a failure in communication with Esre-UI, or an error might have occurred on the Esre-UI side.\n' +
            'Please contact the administrator.\n\n' + err.stack;
      } else {
          console.error('An unexpected error occurred. Please contact the administrator.');
          console.error(err)
          // Use alert instead of toast(not initialzied)
          error = 'An unexpected error occurred. Please contact the administrator.';
      }
  }

  return (
    <html lang={lng} dir={dir(lng)}>
      <body>
        <I18nContextProvider language={lng}>
          { error ?
            <pre style={{ color: "red", backgroundColor: "lightgray", padding: "1em" }}>{ error }</pre>
          :
            <ServerStateProvider
              value={{
                basePath: envConfigures.chatbot_ui_app_base_path,
                loginUserAttributes: {
                  email: user.email || '',
                  displayName: user.displayName,
                  department: user.department,
                  title: user.title,
                },
                documentKeys: {
                  source: envConfigures.document_source,
                  url: envConfigures.document_url,
                },
                uploadFileSizeLimitMB: envConfigures.chatbot_ui_upload_file_size_limit_mb,
                teams,
                llmModels,
                embeddings,
                settingsList,
                authenticationEnabled: envConfigures.chatbot_ui_enable_authentication
              }}
            >
              <AppStateContextProvider>
                <Toaster />
                {children}
              </AppStateContextProvider>
            </ServerStateProvider>
          }
        </I18nContextProvider>
      </body>
    </html>
  );
}
