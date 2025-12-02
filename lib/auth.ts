import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

