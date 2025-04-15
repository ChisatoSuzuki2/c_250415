import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/AuthOptions';
import { envConfigures } from '@/app/utils/config';

type Session =
  | {
      loggedIn: true;
      user: {
        accessToken: string;
        displayName: string;
        department: string;
        title: string;
        email?: string | null;
      };
    }
  | {
      loggedIn: false;
      user: null;
    };

export default async function getSession(): Promise<Session> {
  if (!envConfigures.chatbot_ui_enable_authentication)
    return {
      loggedIn: true,
      user: { accessToken: '', displayName: '', department: '', title: '' },
    };

  const session = await getServerSession(authOptions);
  if (!session)
    return {
      loggedIn: false,
      user: null,
    };

  return {
    loggedIn: true,
    user: session.user,
  };
}
