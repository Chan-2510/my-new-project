"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function CreateAccountPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
    const result = await response.json() as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Could not create your account.");
      setIsLoading(false);
      return;
    }

    const login = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/" });
    if (login?.error) {
      setError("Account created. Please sign in from the login page.");
      setIsLoading(false);
      return;
    }
    window.location.assign(login?.url ?? "/");
  }

  return <main className="login-page"><section className="login-card" aria-labelledby="create-account-title">
    <div className="login-brand"><span className="brand-mark">N</span><span>mini<span className="brand-accent">/</span>netsuite</span></div>
    <p className="eyebrow">New workspace member</p>
    <h1 id="create-account-title">Create account<span className="accent-dot">.</span></h1>
    <p className="login-description">Set up your account to start managing your workspace.</p>
    <form className="login-form" onSubmit={handleSubmit}>
      <label htmlFor="name">Full name</label>
      <input id="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
      <label htmlFor="email">Email</label>
      <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <label htmlFor="password">Password</label>
      <div className="password-field">
        <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button className="password-toggle" type="button" onClick={() => setShowPassword((isVisible) => !isVisible)} aria-label={showPassword ? "Hide password" : "Show password"}>
          {showPassword ? "◉̸" : "◉"}
        </button>
      </div>
      {error && <p className="login-error" role="alert">{error}</p>}
      <button className="primary-button login-button" type="submit" disabled={isLoading}>{isLoading ? "Creating account..." : "Create account"}</button>
    </form>
    <a className="login-link" href="/login">Already have an account? Sign in</a>
  </section></main>;
}
