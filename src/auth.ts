import NextAuth, { type NextAuthOptions, getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email === "user@example.com" && credentials?.password === "password") {
          return { id: "1", name: "Test User", email: "user@example.com" };
        }

        return null;
      },
    }),
  ],
};

export const auth = () => getServerSession(authOptions);
export default NextAuth(authOptions);
