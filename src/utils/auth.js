/**
 * Authentication Utilities
 * - Deterministic hash (FNV-1a 32-bit)
 * - Password strength scorer
 * - localStorage user registry
 * - Seed known accounts on first run
 */

import { PATIENTS_DB, DEFAULT_PATIENT_PROFILE } from "../constants/patients";

const REGISTRY_KEY = "_hra_users";

// ── FNV-1a 32-bit hash (no crypto API needed) ──────────────────────────────
export function hashPass(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (Math.imul(h, 0x01000193) >>> 0);
  }
  return h.toString(16).padStart(8, "0");
}

// ── Password strength ───────────────────────────────────────────────────────
export function passStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pwd.length >= 8)          s++;
  if (pwd.length >= 12)         s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  const levels = [
    { score: 0, label: "",             color: "" },
    { score: 1, label: "Very weak",    color: "#bc000a" },
    { score: 2, label: "Weak",         color: "#f59e0b" },
    { score: 3, label: "Fair",         color: "#eab308" },
    { score: 4, label: "Strong",       color: "#006e28" },
    { score: 5, label: "Very strong",  color: "#059669" },
  ];
  return levels[s] ?? levels[4];
}

// ── Registry helpers ────────────────────────────────────────────────────────
export function getRegistry() {
  try {
    return JSON.parse(localStorage.getItem(REGISTRY_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveRegistry(reg) {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
  } catch {
    // storage unavailable — silent fail
  }
}

// ── Pre-seed known users (runs once) ────────────────────────────────────────
export function seedKnownUsers() {
  const reg     = getRegistry();
  const seeds   = [
    { email: "rajesh@patient.com",  pass: "Patient@123", name: "Rajesh Kumar"     },
    { email: "priya@patient.com",   pass: "Patient@123", name: "Priya Sharma"     },
    { email: "doctor@health.ai",    pass: "Doctor@123",  name: "Dr. Anjali Mehta" },
  ];
  let changed = false;
  seeds.forEach(s => {
    if (!reg[s.email]) {
      reg[s.email] = { hash: hashPass(s.pass), name: s.name };
      changed = true;
    }
  });
  if (changed) saveRegistry(reg);
}

// ── Validate sign-in credentials ────────────────────────────────────────────
export function validateLogin(email, password) {
  const emailL = email.trim().toLowerCase();

  if (!emailL)
    return { ok: false, error: "Please enter your email address." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailL))
    return { ok: false, error: "Enter a valid email address." };
  if (!password)
    return { ok: false, error: "Please enter your password." };

  const reg    = getRegistry();
  const stored = reg[emailL];

  if (!stored)
    return { ok: false, error: "No account found. Please sign up first." };
  if (stored.hash !== hashPass(password))
    return { ok: false, error: "Incorrect password. Please try again." };

  // Resolve full profile
  const profile = Object.values(PATIENTS_DB).find(
    u => u.email?.toLowerCase() === emailL
  );

  if (profile) return { ok: true, user: profile };

  // Custom-registered user
  return {
    ok: true,
    user: {
      ...DEFAULT_PATIENT_PROFILE,
      id   : stored.id   || `p${Date.now()}`,
      name : stored.name || emailL.split("@")[0],
      email: emailL,
      age  : stored.age  || 35,
    },
  };
}

// ── Validate sign-up form ────────────────────────────────────────────────────
export function validateSignup(name, email, password, confirmPassword) {
  const emailL = email.trim().toLowerCase();

  if (!name.trim())
    return { ok: false, error: "Full name is required." };
  if (!emailL)
    return { ok: false, error: "Email address is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailL))
    return { ok: false, error: "Enter a valid email address." };
  if (!password)
    return { ok: false, error: "Password is required." };
  if (password.length < 8)
    return { ok: false, error: "Password must be at least 8 characters." };
  if (!/[A-Z]/.test(password))
    return { ok: false, error: "Password must contain at least one uppercase letter." };
  if (!/[0-9]/.test(password))
    return { ok: false, error: "Password must contain at least one number." };
  if (password !== confirmPassword)
    return { ok: false, error: "Passwords do not match." };

  const reg = getRegistry();
  if (reg[emailL])
    return { ok: false, error: "An account with this email already exists. Please sign in." };

  return { ok: true };
}

// ── Register a new user ──────────────────────────────────────────────────────
export function registerUser(name, email, password) {
  const emailL = email.trim().toLowerCase();
  const reg    = getRegistry();
  const newId  = `p${Date.now()}`;

  const displayName = name.trim()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  reg[emailL] = { hash: hashPass(password), name: displayName, id: newId };
  saveRegistry(reg);

  return {
    ...DEFAULT_PATIENT_PROFILE,
    id   : newId,
    name : displayName,
    email: emailL,
  };
}
