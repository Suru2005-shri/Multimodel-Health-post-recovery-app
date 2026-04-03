import { useState } from "react";
import LoginPage        from "./pages/LoginPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import DashboardPage    from "./pages/Dashboard/DashboardPage";

/**
 * App — root router
 * Views: "login" → "profile" (new users) → "dashboard"
 */
export default function App() {
  const [view, setView] = useState("login");   // "login" | "profile" | "dashboard"
  const [user, setUser] = useState(null);

  /** Called by LoginPage after successful auth */
  const handleLogin = (resolvedUser, needsProfile = false) => {
    setUser(resolvedUser);
    setView(needsProfile ? "profile" : "dashboard");
  };

  /** Called by ProfileSetupPage after medical profile is filled */
  const handleProfileComplete = profileData => {
    setUser(prev => ({ ...prev, ...profileData }));
    setView("dashboard");
  };

  /** Sign-out: clear state and return to login */
  const handleSignOut = () => {
    setUser(null);
    setView("login");
  };

  if (view === "login")
    return <LoginPage onLogin={handleLogin} />;

  if (view === "profile")
    return <ProfileSetupPage user={user} onComplete={handleProfileComplete} />;

  return <DashboardPage user={user} onSignOut={handleSignOut} />;
}
