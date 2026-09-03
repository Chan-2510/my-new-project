import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Dashboard from "./Dashboard";

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter, log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default async function DashboardPage({ initialView }: { initialView: string }) {
  const session = await auth();
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  async function onSignIn() { "use server"; redirect("/api/auth/signin"); }
  async function onSignOut() { "use server"; redirect("/api/auth/signout"); }

  return <Dashboard initialView={initialView} users={users} signedInEmail={session?.user?.email} onSignIn={onSignIn} onSignOut={onSignOut} />;
}