import { Link, Navigate } from "react-router-dom";
import {
  Sparkles,
  ShoppingCart,
  Calendar,
  ChefHat,
  ArrowRight,
  Zap,
  Leaf,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: Sparkles,
    title: "AI-Personalized Plans",
    description:
      "Get a weekly meal plan tailored to your body, goals, dietary preferences, and cooking skill.",
  },
  {
    icon: ChefHat,
    title: "Full Recipes Included",
    description:
      "Every meal comes with step-by-step instructions, prep time, and nutritional info.",
  },
  {
    icon: ShoppingCart,
    title: "Smart Grocery Lists",
    description:
      "Ingredients are consolidated across all recipes so you buy exactly what you need — no waste.",
  },
  {
    icon: Calendar,
    title: "7-Day Weekly Schedule",
    description:
      "Plan every breakfast, lunch, dinner, and snack for the entire week in one go.",
  },
];

const stats = [
  { value: "2,000+", label: "Recipes Generated" },
  { value: "7 days", label: "Full Weekly Plans" },
  { value: "100%", label: "Personalized" },
];

export default function Home() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/5 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--color-accent)]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] mb-8">
            <Leaf className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="text-sm text-[var(--color-muted)]">
              AI-powered meal planning
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Eat Better,{" "}
            <span className="text-[var(--color-accent)]">Stress Less</span>
          </h1>

          <p className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell us about yourself and get a complete personalized weekly meal
            plan — with recipes, macros, and a smart grocery list — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/onboarding">
              <Button size="lg" className="gap-2 px-8">
                Build My Meal Plan
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth/sign-in">
              <Button variant="secondary" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-[var(--color-accent)] mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-[var(--color-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to eat well
            </h2>
            <p className="text-[var(--color-muted)] text-lg max-w-2xl mx-auto">
              From personalized nutrition targets to a full grocery list —
              your entire week planned out intelligently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                variant="bordered"
                className="group hover:border-[var(--color-accent)]/50 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="text-[var(--color-muted)]">
              Ready in under a minute
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start planning today
          </h2>
          <p className="text-[var(--color-muted)] mb-8">
            Answer a few questions about your body, goals, and preferences.
            Our AI handles the rest.
          </p>
          <Link to="/onboarding">
            <Button size="lg" className="gap-2 px-10">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
