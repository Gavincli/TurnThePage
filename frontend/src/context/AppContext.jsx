import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { mapBookRow } from "../utils/booksDb";

const AppContext = createContext();
const DEMO_USER_STORAGE_KEY = "ttp_demo_user";
const API = "";

const GOAL_ICONS = {
  daily: "☀️",
  weekly: "🗓️",
  monthly: "🌙",
};

const mapGoal = (goal, index) => {
  const target = Number(goal.target ?? 0);
  const current = Number(goal.progress ?? 0);
  const period = goal.period || "daily";

  return {
    id: goal.templateId || `goal-${index + 1}`,
    templateId: goal.templateId,
    name: goal.title,
    description: goal.description,
    current,
    target,
    completed: Boolean(goal.isCompleted),
    icon: GOAL_ICONS[period] || "📖",
    period,
    percentComplete:
      Number(goal.percentComplete) ||
      (target > 0 ? (current / target) * 100 : 0),
  };
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const userId = user?.userId || null;

  const [currentStreak, setCurrentStreak] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [weekMinutes, setWeekMinutes] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [booksFinished, setBooksFinished] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const [currentBooks, setCurrentBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);

  const [goalsCompleted, setGoalsCompleted] = useState(0);
  const [goalProgress, setGoalProgress] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

  const [newlyCompletedGoals, setNewlyCompletedGoals] = useState([]);

  const persistUser = useCallback((nextUser) => {
    if (nextUser) {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (!raw) {
      setAuthReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.userId && parsed?.username) {
        setUser(parsed);
      } else {
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    } finally {
      setAuthReady(true);
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    persistUser(null);
    setCurrentStreak(0);
    setTodayMinutes(0);
    setWeekMinutes(0);
    setTotalMinutes(0);
    setBooksFinished(0);
    setCurrentBooks([]);
    setGoalsCompleted(0);
    setGoalProgress([]);
    setNewlyCompletedGoals([]);
  }, [persistUser]);

  const loginWithCredentials = useCallback(
    async ({ username, password, action }) => {
      const response = await fetch(`${API}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, username, password }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Login failed.");
      }

      const nextUser = {
        userId: payload.userId,
        username: payload.username,
        email: payload.email,
        displayName: payload.displayName,
        selectedAvatar: payload.selectedAvatar ?? null,
        pointsEarned: payload.pointsEarned ?? 0,
      };
      setUser(nextUser);
      persistUser(nextUser);
      return nextUser;
    },
    [persistUser],
  );

  const applyGoals = useCallback((goals) => {
    const mapped = (goals || []).map(mapGoal);
    setGoalProgress(mapped);
    setGoalsCompleted(mapped.filter((goal) => goal.completed).length);
    return mapped;
  }, []);

  const loadStats = useCallback(async () => {
    if (!userId) {
      setCurrentStreak(0);
      setTodayMinutes(0);
      setWeekMinutes(0);
      setTotalMinutes(0);
      setBooksFinished(0);
      setStatsLoading(false);
      return;
    }

    try {
      setStatsLoading(true);
      const response = await fetch(
        `${API}/api/stats?userId=${encodeURIComponent(userId)}`,
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load stats");
      }

      setCurrentStreak(payload?.streak ?? 0);
      setTodayMinutes(payload?.todayMinutes ?? 0);
      setWeekMinutes(payload?.weekMinutes ?? 0);
      setTotalMinutes(payload?.totalMinutes ?? 0);
      setBooksFinished(payload?.booksFinished ?? 0);
    } catch (err) {
      console.error("Failed to load stats.", err);
      setCurrentStreak(0);
      setTodayMinutes(0);
      setWeekMinutes(0);
      setTotalMinutes(0);
      setBooksFinished(0);
    } finally {
      setStatsLoading(false);
    }
  }, [userId]);

  const loadCurrentBooks = useCallback(async () => {
    if (!userId) {
      setCurrentBooks([]);
      setBooksLoading(false);
      return;
    }

    try {
      setBooksLoading(true);
      const response = await fetch(
        `${API}/api/books?userId=${encodeURIComponent(userId)}&mode=current`,
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load books");
      }

      const rows = payload?.books || [];
      setCurrentBooks(rows.map(mapBookRow));
    } catch (err) {
      console.error("Failed to load current books.", err);
      setCurrentBooks([]);
    } finally {
      setBooksLoading(false);
    }
  }, [userId]);

  const loadGoals = useCallback(async () => {
    if (!userId) {
      applyGoals([]);
      setGoalsLoading(false);
      return;
    }

    try {
      setGoalsLoading(true);
      const response = await fetch(
        `${API}/api/goals?userId=${encodeURIComponent(userId)}`,
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load goals");
      }

      applyGoals(payload?.goals || []);
    } catch (err) {
      console.error("Failed to load goals.", err);
      applyGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  }, [applyGoals, userId]);

  const refreshAppData = useCallback(async () => {
    if (!userId) return;
    await Promise.all([loadStats(), loadCurrentBooks(), loadGoals()]);
  }, [loadCurrentBooks, loadGoals, loadStats, userId]);

  const syncAfterSession = useCallback(
    async ({ newlyCompleted } = {}) => {
      if (!userId) return;

      await loadGoals();
      setNewlyCompletedGoals(Array.isArray(newlyCompleted) ? newlyCompleted : []);
      await Promise.all([loadStats(), loadCurrentBooks()]);
    },
    [loadCurrentBooks, loadGoals, loadStats, userId],
  );

  useEffect(() => {
    if (userId) {
      refreshAppData();
    } else if (authReady) {
      setStatsLoading(false);
      setBooksLoading(false);
      setGoalsLoading(false);
    }
  }, [refreshAppData, userId, authReady]);

  const value = {
    authReady,
    user,
    userId,
    loginWithCredentials,
    logout,
    refreshUserProfile: async () => {
      // Demo auth uses localStorage as the source of truth for the current session.
      // Real DB refresh can be added later via an /api/me endpoint.
      return;
    },
    currentStreak,
    todayMinutes,
    weekMinutes,
    totalMinutes,
    booksFinished,
    statsLoading,
    currentBooks,
    booksLoading,
    goalsCompleted,
    goalProgress,
    goalsLoading,
    newlyCompletedGoals,
    setNewlyCompletedGoals,
    refreshAppData,
    loadStats,
    loadCurrentBooks,
    loadGoals,
    syncAfterSession,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
