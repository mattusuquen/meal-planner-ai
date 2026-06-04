import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { MealPlan, User, UserProfile } from "../types";
import { authClient } from "../lib/auth";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  profile: Omit<UserProfile, "updatedAt"> | null;
  plan: MealPlan | null;
  isLoading: boolean;
  saveProfile: (profile: Omit<UserProfile, "userId" | "updatedAt">) => Promise<void>;
  generatePlan: () => Promise<void>;
  refreshData: () => Promise<void>;
  refreshMeal: (day: string, mealType: string, currentMealName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [neonUser, setNeonUser] = useState<any>(null);
  const [profile, setProfile] = useState<Omit<UserProfile, "updatedAt"> | null>(null);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const result = await authClient.getSession();
        if (result?.data?.user) {
          setNeonUser(result.data.user);
        } else {
          setNeonUser(null);
        }
      } catch {
        setNeonUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (neonUser?.id) {
        refreshData();
      } else {
        setPlan(null);
      }
    }
  }, [neonUser?.id, isLoading]);

  const refreshData = useCallback(async () => {
    if (!neonUser || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      const [planData, profileData] = await Promise.all([
        api.getCurrentPlan(neonUser.id).catch(() => null),
        api.getProfile(neonUser.id).catch(() => null),
      ]);
      if (planData) {
        const pj = planData.planJson;
        setPlan({
          id: planData.id,
          userId: planData.userId,
          overview: pj.overview,
          weeklySchedule: pj.weeklySchedule,
          groceryList: pj.groceryList,
          version: planData.version,
          createdAt: planData.createdAt,
        });
      }
      if (profileData) setProfile(profileData);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [neonUser?.id]);

  async function saveProfile(profileData: Omit<UserProfile, "userId" | "updatedAt">) {
    if (!neonUser) throw new Error("User must be authenticated");
    await api.saveProfile(neonUser.id, profileData);
    setProfile({ userId: neonUser.id, ...profileData });
    await refreshData();
  }

  async function generatePlan() {
    if (!neonUser) throw new Error("User must be authenticated");
    await api.generatePlan(neonUser.id);
    await refreshData();
  }

  async function refreshMeal(day: string, mealType: string, currentMealName: string) {
    if (!neonUser) throw new Error("User must be authenticated");
    const result = await api.refreshMeal(neonUser.id, day, mealType, currentMealName);
    // Patch local state instantly — no full re-fetch needed
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeklySchedule: prev.weeklySchedule.map((d) => {
          if (d.day !== day) return d;
          return {
            ...d,
            totalCalories: result.updatedTotalCalories ?? d.totalCalories,
            meals: d.meals.map((m) => (m.type === mealType ? result.meal : m)),
          };
        }),
      };
    });
  }

  return (
    <AuthContext.Provider value={{ user: neonUser, profile, plan, isLoading, saveProfile, generatePlan, refreshData, refreshMeal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
