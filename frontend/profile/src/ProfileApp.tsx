import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "@orderportal/shared-store";
import { API_BASE_URL } from "@orderportal/shared-store/api";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface ApiError {
  message: string;
}

export default function ProfileApp(): React.JSX.Element {
  const token = useSelector(selectToken);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return undefined;
    let active = true;

    async function loadProfile(): Promise<void> {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await response.json()) as Profile | ApiError;

        if (!response.ok) {
          throw new Error(
            "message" in data ? data.message : "Profile request failed",
          );
        }
        if (active) setProfile(data as Profile);
      } catch (cause: unknown) {
        if (active)
          setError(cause instanceof Error ? cause.message : "Request failed");
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <section>
      <h1>My Profile</h1>
      {error && <p className="error">{error}</p>}
      {profile ? (
        <article className="card">
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Role:</strong> {profile.role}
          </p>
          <p>
            <strong>Joined:</strong>{" "}
            {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </article>
      ) : !error ? (
        <p>Loading profile…</p>
      ) : null}
    </section>
  );
}
