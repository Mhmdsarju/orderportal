import React, { useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import {
  setCredentials,
  type AppDispatch,
  type AuthUser,
} from "@orderportal/shared-store";
import { API_BASE_URL } from "@orderportal/shared-store/api";

interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

export default function AuthApp(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const payload =
        mode === "register" ? { name, email, password } : { email, password };
      const response = await fetch(`${API_BASE_URL}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as AuthResponse;

      if (!response.ok) {
        throw new Error(data.message ?? "Authentication failed");
      }

      dispatch(setCredentials({ token: data.token, user: data.user }));
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p>Sign in to access your OrderPortal workspace.</p>

      <form onSubmit={submit}>
        {mode === "register" && (
          <>
            <label htmlFor="register-name">Name</label>
            <input
              id="register-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </>
        )}

        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Login" : "Register"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      <p>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already registered? Login"}
        </button>
      </p>
    </section>
  );
}
