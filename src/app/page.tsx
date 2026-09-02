import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

async function createUser(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!email) {
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name: name || null,
    },
  });

  revalidatePath("/");
}

async function deleteUser(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));

  if (!Number.isInteger(id)) {
    return;
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/");
}

export default async function Home() {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <main className="min-h-screen bg-zinc-100 p-8 text-zinc-900">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">User List</h1>

        <form action={createUser} className="mb-8 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded border border-zinc-300 px-3 py-2 outline-none ring-0 focus:border-zinc-500"
          />
          <input
            name="name"
            type="text"
            placeholder="Name"
            className="rounded border border-zinc-300 px-3 py-2 outline-none ring-0 focus:border-zinc-500"
          />
          <button
            type="submit"
            className="rounded bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700"
          >
            Add User
          </button>
        </form>

        <div className="overflow-hidden rounded border border-zinc-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-100">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                    No users yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-zinc-200">
                    <td className="px-4 py-3">{user.id}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.name ?? "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={user.id} />
                        <button
                          type="submit"
                          aria-label={`Delete ${user.name ?? user.email}`}
                          className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          🗑 Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
