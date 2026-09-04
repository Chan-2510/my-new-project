"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    if (result?.error) {
      setError("Email or password is incorrect.");
      setIsLoading(false);
      return;
    }

    window.location.assign(result?.url ?? "/");
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand"><span className="brand-mark">N</span><span>mini<span className="brand-accent">/</span>netsuite</span></div>
        <p className="eyebrow">Workspace access</p>
        <h1 id="login-title">Welcome back<span className="accent-dot">.</span></h1>
        <p className="login-description">Sign in to continue to your business workspace.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button className="password-toggle" type="button" onClick={() => setShowPassword((isVisible) => !isVisible)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? "◉̸" : "◉"}
            </button>
          </div>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="primary-button login-button" type="submit" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign in"}</button>
        </form>
        <div className="login-links"><a href="/create-account">Create an account</a></div>
        <p className="login-hint">Demo account: user@example.com / password</p>
      </section>
    </main>
  );
}
