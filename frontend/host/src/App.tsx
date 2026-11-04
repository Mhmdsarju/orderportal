import React, { Suspense, lazy, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  clearCredentials,
  selectUser,
  type AppDispatch,
} from "@orderportal/shared-store";
const AuthApp = lazy(() => import("auth/AuthApp"));
const DashboardApp = lazy(() => import("dashboard/DashboardApp"));
const ProfileApp = lazy(() => import("profile/ProfileApp"));
const SettingsApp = lazy(() => import("settings/SettingsApp"));
type Page = "dashboard" | "profile" | "settings";
export default function App(): React.JSX.Element {
  const user = useSelector(selectUser);
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState<Page>("dashboard");
  if (!user)
    return (
      <Suspense fallback={<p>Loading authentication…</p>}>
        <AuthApp />
      </Suspense>
    );
  return (
    <div className="shell">
      <header>
        <div>
          <strong>OrderPortal</strong>
          <span className="muted">Micro Frontend Workspace</span>
        </div>
        <div>
          {user.name} · {user.role}
          <button
            onClick={() => {
              dispatch(clearCredentials());
              setPage("dashboard");
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <nav>
        {(["dashboard", "profile", "settings"] as Page[]).map((item) => (
          <button
            className={page === item ? "active" : ""}
            key={item}
            onClick={() => setPage(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>
      <main>
        <Suspense fallback={<p>Loading {page}…</p>}>
          {page === "dashboard" ? (
            <DashboardApp />
          ) : page === "profile" ? (
            <ProfileApp />
          ) : (
            <SettingsApp />
          )}
        </Suspense>
      </main>
    </div>
  );
}
