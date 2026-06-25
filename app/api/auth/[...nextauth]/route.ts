// app/api/auth/[...nextauth]/route.ts — NextAuth with Google + Credentials providers

import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials?.email });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(
          credentials!.password,
          user.password,
        );
        if (!valid) return null;
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || null,
          role: user.role,
          mobile: user.mobile,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const userCount = await User.countDocuments();
        const existingUser = await User.findOne({ email: user.email });

        await User.findOneAndUpdate(
          { email: user.email },
          {
            name: user.name,
            image: user.image,
            email: user.email,
            ...(!existingUser && { role: userCount === 0 ? "admin" : "user" }),
          },
          { upsert: true, new: true },
        );
      }
      return true;
    },

    async jwt({ token, user, trigger, session: updateSession }) {
      await connectDB();
      console.log("JWT token.email:", token.email);
      const dbUser = await User.findOne({ email: token.email });
      // console.log("DB user found:", dbUser);

      if (!dbUser) {
        // User deleted from DB — poison the token
        token.error = "UserDeleted";
        return token;
      }

      token.id     = dbUser._id.toString();
      token.name   = dbUser.name;
      token.email  = dbUser.email;
      token.image  = dbUser.image  || null;
      token.role   = dbUser.role;
      token.mobile = dbUser.mobile || "";

      if (trigger === "update" && updateSession) {
        if (updateSession.name)   token.name   = updateSession.name;
        if (updateSession.image)  token.image  = updateSession.image;
        if (updateSession.email)  token.email  = updateSession.email;
        if (updateSession.mobile) token.mobile = updateSession.mobile;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.error === "UserDeleted") {
        // Expired session forces client-side logout
        return {
          ...session,
          user: undefined,
          expires: new Date(0).toISOString(),
        };
      }
      if (session.user) {
        (session.user as any).id     = token.id;
        (session.user as any).role   = token.role;
        (session.user as any).mobile = token.mobile;
        session.user.name            = token.name  as string;
        session.user.image           = token.image as string;
        session.user.email           = token.email as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
