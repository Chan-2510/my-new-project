import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; email?: string; password?: string };
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!name || !email || password.length < 8) {
      return NextResponse.json({ error: "Name, email, and an 8-character password are required." }, { status: 400 });
    }

    if (email === "user@example.com") {
      return NextResponse.json({ error: "That email is reserved for the demo account." }, { status: 409 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });

    const user = await prisma.user.create({ data: { name, email, passwordHash: hashPassword(password) } });
    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch (error) {
    console.error("Account creation failed", error);
    return NextResponse.json({ error: "Could not create your account." }, { status: 500 });
  }
}
