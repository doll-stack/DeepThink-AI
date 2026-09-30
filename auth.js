/**
 * DeepThink / ThinkAi - Authentication Service
 * Manages user registration, login, logout, session persistence,
 * and user-specific chat history.
 */

class AuthService {
  constructor() {
    this.STORAGE_KEY_USERS = 'deepthink_users';
    this.STORAGE_KEY_SESSION = 'deepthink_session';
    this.currentUser = null;
    this.listeners = [];

    this._initDefaultUsers();
    this._loadSession();
  }

  /**
   * Initialize a ready-to-test default account for instant testing
   */
  _initDefaultUsers() {
    const existing = localStorage.getItem(this.STORAGE_KEY_USERS);
    if (!existing) {
      const demoUsers = [
        {
          id: 'user_demo_01',
          name: 'Alex Chen',
          email: 'alex@deepthink.ai',
          password: 'password123',
          avatar: 'AC',
          role: 'Pro Member',
          joinedAt: new Date().toLocaleDateString()
        }
      ];
      localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(demoUsers));
    }
  }

  /**
   * Load active user from LocalStorage session
   */
  _loadSession() {
    try {
      const session = localStorage.getItem(this.STORAGE_KEY_SESSION);
      if (session) {
        this.currentUser = JSON.parse(session);
      }
    } catch (e) {
      this.currentUser = null;
    }
  }

  /**
   * Subscribe to auth changes
   */
  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
  }

  _notify() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  /**
   * Get all registered users from LocalStorage
   */
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY_USERS) || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Sign In with Email and Password
   */
  login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password. Please try again or use Demo Login.');
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || this._generateAvatar(user.name),
      role: user.role || 'Member',
      isGuest: false
    };

    this.currentUser = sessionUser;
    localStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
    this._notify();
    return sessionUser;
  }

  /**
   * Sign Up a new user
   */
  register(name, email, password) {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      throw new Error('Name must be at least 2 characters.');
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      password: password,
      avatar: this._generateAvatar(cleanName),
      role: 'Member',
      joinedAt: new Date().toLocaleDateString()
    };

    users.push(newUser);
    localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(users));

    // Automatically log in the newly registered user
    return this.login(cleanEmail, password);
  }

  /**
   * Continue as Guest
   */
  continueAsGuest() {
    const guestUser = {
      id: 'guest_' + Date.now(),
      name: 'Guest User',
      email: 'guest@deepthink.local',
      avatar: 'GU',
      role: 'Guest',
      isGuest: true
    };
    this.currentUser = guestUser;
    localStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(guestUser));
    this._notify();
    return guestUser;
  }

  /**
   * Log Out
   */
  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY_SESSION);
    this._notify();
  }

  /**
   * Generate Initials Avatar
   */
  _generateAvatar(name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name.slice(0, 2) || 'AI').toUpperCase();
  }
}

// Global instance
window.authService = new AuthService();
