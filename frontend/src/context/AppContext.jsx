import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../utils/supabase";
import { computeStatsFromSessions } from "../utils/readingStats";
import { mapBookRow } from "../utils/booksDb";

const AppContext = createContext();

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

/** Map public.goals row to the shape expected by mapGoal / Goals page */
function mapGoalsTableRow(row) {
  const freq = row.frequency || "daily";
  const period =
    freq === "all_time" ? "monthly" : freq === "weekly" ? "weekly" : "daily";
  const pct = Number(row.percent_complete ?? 0);
  return {
    templateId: row.goal_id,
    title: row.goal_title,
    description: "",
    period,
    points: 0,
    target: 100,
    progress: Math.round(pct),
    isCompleted: row.is_completed,
    completedAt: row.date_finished,
    percentComplete: pct,
  };
}

/** Fallback: user_goals + goal_templates (filled for every user at signup) */
function mapUserGoalFromDb(row) {
  const gt = row.goal_templates;
  const template = Array.isArray(gt) ? gt[0] : gt;
  if (!template) return null;
  const target = Number(template.target_value ?? 0);
  const progress = Number(row.progress ?? 0);
  const percentComplete =
    target > 0
      ? Math.round((progress / target) * 1000) / 10
      : Number(row.percentComplete ?? 0);
  return {
    templateId: template.template_id,
    title: template.title,
    description: template.description,
    period: template.period,
    points: template.points_value,
    target,
    progress,
    isCompleted: row.is_completed,
    completedAt: row.completed_at,
    percentComplete,
  };
}

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  /** False until initial session check finishes. */
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

  const loadUserProfile = useCallback(async (id) => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const { data, error } = await supabase
        .from("users")
        .select(
          "user_id, username, email, display_name, selected_avatar, points_earned",
        )
        .eq("user_id", id)
        .maybeSingle();

      if (!error && data) {
        setUser({
          userId: data.user_id,
          username: data.username,
          email: data.email,
          displayName: data.display_name,
          selectedAvatar: data.selected_avatar,
          pointsEarned: data.points_earned,
        });
        return;
      }

      await new Promise((r) => setTimeout(r, 120 * (attempt + 1)));
    }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser?.id === id) {
      const fallbackEmail = authUser.email ?? "";
      setUser({
        userId: id,
        username: fallbackEmail.split("@")[0] || "reader",
        email: fallbackEmail,
        displayName: fallbackEmail.split("@")[0] || "reader",
        selectedAvatar: null,
        pointsEarned: 0,
      });
      return;
    }

    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let authReadySet = false;

    const markAuthReady = () => {
      if (!cancelled && !authReadySet) {
        authReadySet = true;
        setAuthReady(true);
      }
    };

    // Safety net: if onAuthStateChange never fires (e.g. network stall or
    // corrupt token that can't be refreshed), unblock the app after 5s.
    const safetyTimer = setTimeout(() => {
      if (!authReadySet) {
        console.warn("Auth init timed out — clearing session and unblocking app.");
        supabase.auth.signOut().catch(() => {});
        markAuthReady();
      }
    }, 5000);

    // Rely solely on onAuthStateChange for auth init.
    // Supabase fires INITIAL_SESSION immediately on registration, so we do
    // NOT also call getSession() + loadUserProfile in a separate init() path,
    // which previously caused loadUserProfile to run twice on every page load.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;
      if (session?.user?.id) {
        setToken(session?.access_token ?? "");
        await loadUserProfile(session.user.id);
      } else {
        setToken("");
        setUser(null);
        setCurrentStreak(0);
        setTodayMinutes(0);
        setWeekMinutes(0);
        setTotalMinutes(0);
        setBooksFinished(0);
        setCurrentBooks([]);
        setGoalsCompleted(0);
        setGoalProgress([]);
        setNewlyCompletedGoals([]);
      }
      // Mark auth ready after the first event (INITIAL_SESSION or SIGNED_IN).
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        markAuthReady();
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setToken("");
    setUser(null);
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

      const [{ data: sessions, error: sErr }, { count: finishedCount, error: cErr }] =
        await Promise.all([
          supabase
            .from("reading_sessions")
            .select("minutes_read, session_date")
            .eq("user_id", userId),
          supabase
            .from("books")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("is_finished", true),
        ]);

      if (sErr) throw sErr;
      if (cErr) throw cErr;

      const stats = computeStatsFromSessions(
        sessions || [],
        finishedCount ?? 0,
      );
      setCurrentStreak(stats.streak);
      setTodayMinutes(stats.todayMinutes);
      setWeekMinutes(stats.weekMinutes);
      setTotalMinutes(stats.totalMinutes);
      setBooksFinished(stats.booksFinished);
    } catch (err) {
      console.error("Failed to load stats from Supabase.", err);
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

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", userId)
        .eq("is_finished", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCurrentBooks((data || []).map(mapBookRow));
    } catch (err) {
      console.error("Failed to load current books from Supabase.", err);
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

      const { data: ugRows, error: ugErr } = await supabase
        .from("user_goals")
        .select(
          `
          progress,
          is_completed,
          completed_at,
          goal_templates (
            template_id,
            title,
            description,
            period,
            points_value,
            target_value,
            display_order
          )
        `,
        )
        .eq("user_id", userId);

      if (ugErr) throw ugErr;

      const ordered = (ugRows || [])
        .map((row) => {
          const g = mapUserGoalFromDb(row);
          if (!g) return null;
          const gt = row.goal_templates;
          const template = Array.isArray(gt) ? gt[0] : gt;
          return { ...g, displayOrder: template?.display_order ?? 0 };
        })
        .filter(Boolean)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      applyGoals(
        ordered.map((item) => {
          const { displayOrder, ...goal } = item;
          void displayOrder;
          return goal;
        }),
      );
    } catch (err) {
      console.error("Failed to load goals from Supabase.", err);
      applyGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  }, [applyGoals, userId]);

  const refreshAppData = useCallback(async () => {
    if (!userId) return;
    await Promise.all([loadStats(), loadCurrentBooks(), loadGoals()]);
  }, [loadCurrentBooks, loadGoals, loadStats, userId]);

  const syncAfterSession = useCallback(async () => {
    if (!userId) return;

    await loadGoals();
    setNewlyCompletedGoals([]);
    await Promise.all([loadStats(), loadCurrentBooks()]);
  }, [loadCurrentBooks, loadGoals, loadStats, userId]);

  useEffect(() => {
    if (!authReady) return;
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
    token,
    userId,
    logout,
    refreshUserProfile: () =>
      userId ? loadUserProfile(userId) : Promise.resolve(),
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
