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
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // async signIn({ user, account }) {
    //   if (account?.provider === "google") {
    //     await connectDB();
    //     await User.findOneAndUpdate(
    //       { email: user.email },
    //       { name: user.name, image: user.image },
    //       { upsert: true, new: true },
    //     );
    //   }
    //   return true;
    // },

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
            ...(!existingUser && { role: userCount === 0 ? "admin" : "user" }),
          },
          { upsert: true, new: true },
        );
      }
      return true;
    },

    // async jwt({ token, user }) {
    //   if (user) {
    //     await connectDB();
    //     const dbUser = await User.findOne({ email: token.email });
    //     token.role = dbUser?.role ?? "user";
    //     token.id = dbUser?._id.toString();
    //   }
    //   return token;
    // },
    // async session({ session, token }) {
    //   if (session.user) {
    //     (session.user as any).role = token.role;
    //     (session.user as any).id = token.id;
    //   }
    //   return session;
    // },

    async jwt({ token, user }) {
      await connectDB();
      const dbUser = await User.findOne({ email: token.email });

      if (!dbUser) {
        // User deleted from DB — poison the token
        token.error = "UserDeleted";
        return token;
      }

      token.role = dbUser.role;
      token.id = dbUser._id.toString();
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
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
