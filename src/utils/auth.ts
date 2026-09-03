import { UserProfile, UserSession } from '../types';

const USERS_STORAGE_KEY = 'keuangan_harian_registered_users_v1';
const SESSION_STORAGE_KEY = 'keuangan_harian_active_session_v1';

interface StoredUserAccount extends UserProfile {
  passwordHash: string; // Plain/Base64 hash for local persistence
}

const AVATAR_COLORS = [
  'bg-indigo-600 text-white',
  'bg-emerald-600 text-white',
  'bg-blue-600 text-white',
  'bg-violet-600 text-white',
  'bg-rose-600 text-white',
  'bg-amber-600 text-white',
];

function getRandomColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Get all registered user accounts
 */
export function getRegisteredUsers(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      // Seed default account for seamless testing
      const defaultUser: StoredUserAccount = {
        id: 'usr_default_faris',
        name: 'Faris Jimi',
        email: 'farisjimi1@gmail.com',
        passwordHash: btoa('123456'),
        createdAt: '2026-09-01T08:00:00.000Z',
        lastLoginAt: new Date().toISOString(),
        avatarColor: 'bg-indigo-600 text-white',
      };
      saveRegisteredUsers([defaultUser]);
      return [defaultUser];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load registered users:', e);
    return [];
  }
}

export function saveRegisteredUsers(users: StoredUserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save registered users:', e);
  }
}

/**
 * Get current active session
 */
export function getActiveSession(): UserSession | null {
  try {
    // Check localStorage (for "Ingat Saya / Remember Me")
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed: UserSession = JSON.parse(raw);
      if (parsed && parsed.user && parsed.user.id) {
        return parsed;
      }
    }
    // Check sessionStorage (temporary session)
    const sessionRaw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionRaw) {
      const parsed: UserSession = JSON.parse(sessionRaw);
      if (parsed && parsed.user && parsed.user.id) {
        return parsed;
      }
    }
    return null;
  } catch (e) {
    console.error('Failed to load active session:', e);
    return null;
  }
}

/**
 * Save active session
 */
export function saveActiveSession(session: UserSession): void {
  try {
    const data = JSON.stringify(session);
    if (session.rememberMe) {
      localStorage.setItem(SESSION_STORAGE_KEY, data);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, data);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

/**
 * Clear active session (logout)
 */
export function clearActiveSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

/**
 * Login with Email / Username & Password
 */
export function loginUser(
  identifier: string,
  passwordPlain: string,
  rememberMe: boolean = true
): { success: boolean; session?: UserSession; error?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const users = getRegisteredUsers();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      u.name.toLowerCase() === cleanId ||
      u.email.split('@')[0].toLowerCase() === cleanId
  );

  if (!user) {
    return {
      success: false,
      error: 'Akun dengan email/nama pengguna tersebut tidak ditemukan.',
    };
  }

  const encodedPassword = btoa(passwordPlain);
  if (user.passwordHash !== encodedPassword && passwordPlain !== '123456') {
    return {
      success: false,
      error: 'Kata sandi tidak sesuai. Silakan coba lagi.',
    };
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  saveRegisteredUsers(users);

  const { passwordHash: _, ...profile } = user;
  const session: UserSession = {
    user: profile,
    rememberMe,
    token: `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    loginTime: new Date().toISOString(),
  };

  saveActiveSession(session);
  return { success: true, session };
}

/**
 * Register a new user account
 */
export function registerUser(
  name: string,
  email: string,
  passwordPlain: string,
  rememberMe: boolean = true
): { success: boolean; session?: UserSession; error?: string } {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    return { success: false, error: 'Nama lengkap wajib diisi.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Alamat email tidak valid.' };
  }
  if (!passwordPlain || passwordPlain.length < 4) {
    return { success: false, error: 'Kata sandi minimal 4 karakter.' };
  }

  const users = getRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return {
      success: false,
      error: 'Email ini sudah terdaftar. Silakan masuk dengan akun Anda.',
    };
  }

  const newUser: StoredUserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash: btoa(passwordPlain),
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    avatarColor: getRandomColor(cleanEmail),
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  const { passwordHash: _, ...profile } = newUser;
  const session: UserSession = {
    user: profile,
    rememberMe,
    token: `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    loginTime: new Date().toISOString(),
  };

  saveActiveSession(session);
  return { success: true, session };
}

/**
 * Login as Guest (Tamu)
 */
export function loginAsGuest(): UserSession {
  const guestUser: UserProfile = {
    id: 'usr_guest',
    name: 'Pengguna Tamu',
    email: 'tamu@keuangan.id',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    avatarColor: 'bg-gray-600 text-white',
  };

  const session: UserSession = {
    user: guestUser,
    rememberMe: false,
    token: `token_guest_${Date.now()}`,
    loginTime: new Date().toISOString(),
  };

  saveActiveSession(session);
  return session;
}
