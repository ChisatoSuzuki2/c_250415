import KeycloakProvider from 'next-auth/providers/keycloak';
import { AuthOptions } from 'next-auth';
import { decodeJwt } from 'jose';
import { OidcClient } from 'oidc-client-ts';
import { envConfigures } from '@/app/utils/config';

const refreshToken = async (
  accessToken: string,
  refreshToken: string,
  idToken: string,
) => {
  const jwt = decodeJwt(accessToken);
  const now = Date.now() / 1000;
  if ((jwt.exp || 0) < now) {
    const refreshTokenJwt = decodeJwt(refreshToken);
    if ((refreshTokenJwt.exp || 0) < now)
      throw new Error(`RefreshToken expired. ${refreshTokenJwt.exp}`);

    console.log('Refreshing token.', jwt.exp);
    const client = new OidcClient({
      authority: envConfigures.keycloak_issuer!,
      client_id: envConfigures.keycloak_client_id!,
      client_secret: envConfigures.keycloak_secret!,
      redirect_uri: envConfigures.nextauth_url!,
    });
    const idTokenJwt = decodeJwt(idToken);
    const response = await client.useRefreshToken({
      state: {
        refresh_token: refreshToken,
        session_state: null,
        profile: idTokenJwt as any,
      },
    });
    return response.access_token;
  }

  return accessToken;
};

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: envConfigures.keycloak_client_id!,
      clientSecret: envConfigures.keycloak_secret!,
      issuer: envConfigures.keycloak_issuer,
    }),
  ],
  cookies: {
    sessionToken: {
      name: envConfigures.session_token_name,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: envConfigures.session_path,
        secure: true,
      },
    },
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        if (account.access_token) token.accessToken = account.access_token;
        if (account.refresh_token) token.refreshToken = account.refresh_token;
        if (account.id_token) token.idToken = account.id_token;
      }

      token.accessToken = await refreshToken(
        token.accessToken,
        token.refreshToken,
        token.idToken,
      );

      return token;
    },
    async session({ session, token, user }) {
      session.user.accessToken = token.accessToken;

      const idToken = decodeJwt(token.idToken);

      if (typeof idToken.displayName === 'string')
        session.user.displayName = idToken.displayName;

      if (typeof idToken.department === 'string')
        session.user.department = idToken.department;

      if (typeof idToken.title === 'string') session.user.title = idToken.title;

      return session;
    },
  },
};
