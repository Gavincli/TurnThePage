import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const AppContext = createContext();

const API = "http://localhost:4000";

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
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  /** False until initial session check finishes (localStorage token + /api/auth/me). */
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

  const login = useCallback(({ token, user }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setCurrentStreak(0);
    setTodayMinutes(0);
    setWeekMinutes(0);
    setTotalMinutes(0);
    setBooksFinished(0);
    setCurrentBooks([]);
    setGoalsCompleted(0);
    setGoalProgress([]);
    setNewlyCompletedGoals([]);
  }, []);

  // Validate stored token on load (refresh / expired token cleanup).
  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setAuthReady(true);
        return;
      }
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setAuthReady(true);
      }
    };
    bootstrap();
  }, [logout]);

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

      const res = await fetch(`${API}/api/stats?userId=${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Stats fetch failed: ${res.status}`);
      }

      const data = await res.json();
      setCurrentStreak(data.streak ?? 0);
      setTodayMinutes(data.todayMinutes ?? 0);
      setWeekMinutes(data.weekMinutes ?? 0);
      setTotalMinutes(data.totalMinutes ?? 0);
      setBooksFinished(data.booksFinished ?? 0);
    } catch (err) {
      console.error("Failed to load stats from backend.", err);
      setCurrentStreak(0);
      setTodayMinutes(0);
      setWeekMinutes(0);
      setTotalMinutes(0);
      setBooksFinished(0);
    } finally {
      setStatsLoading(false);
    }
  }, [token, userId]);

  const loadCurrentBooks = useCallback(async () => {
    if (!userId) {
      setCurrentBooks([]);
      setBooksLoading(false);
      return;
    }

    try {
      setBooksLoading(true);

      const res = await fetch(`${API}/api/books/current?userId=${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Books fetch failed: ${res.status}`);
      }

      const data = await res.json();
      setCurrentBooks(data.books ?? []);
    } catch (err) {
      console.error("Failed to load current books from backend.", err);
      setCurrentBooks([]);
    } finally {
      setBooksLoading(false);
    }
  }, [token, userId]);

  const loadGoals = useCallback(async () => {
    if (!userId) {
      applyGoals([]);
      setGoalsLoading(false);
      return;
    }

    try {
      setGoalsLoading(true);

      const res = await fetch(`${API}/api/goals?userId=${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Goals fetch failed: ${res.status}`);
      }

      const data = await res.json();
      applyGoals(data.goals ?? []);
    } catch (err) {
      console.error("Failed to load goals from backend.", err);
      applyGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  }, [applyGoals, token, userId]);

  const refreshAppData = useCallback(async () => {
    if (!userId) return;
    await Promise.all([loadStats(), loadCurrentBooks(), loadGoals()]);
  }, [loadCurrentBooks, loadGoals, loadStats, userId]);

  const syncAfterSession = useCallback(
    async (sessionResult) => {
      if (!userId) return;

      if (sessionResult?.goals) {
        applyGoals(sessionResult.goals);
      } else {
        await loadGoals();
      }

      setNewlyCompletedGoals(sessionResult?.newlyCompleted ?? []);
      await Promise.all([loadStats(), loadCurrentBooks()]);
    },
    [applyGoals, loadCurrentBooks, loadGoals, loadStats, userId],
  );

  useEffect(() => {
    if (!authReady) return;
    if (userId) {
      refreshAppData();
    } else {
      setStatsLoading(false);
      setBooksLoading(false);
      setGoalsLoading(false);
    }
  }, [authReady, refreshAppData, userId]);

  const value = {
    apiBase: API,
    token,
    user,
    userId,
    authReady,
    login,
    logout,
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
