"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface Terpene {
  display_name: string;
  description: string;
  aroma: string;
  found_in: string;
  rationale: string;
}

interface CannabinoidRatio {
  display_name: string;
  description: string;
  thc_range: string;
  cbd_range: string;
  rationale: string;
}

interface Format {
  display_name: string;
  description: string;
  onset_time: string;
  duration: string;
  rationale: string;
}

interface DoseRange {
  cannabinoid: string;
  starting_dose_mg: number;
  max_dose_mg: number;
  notes: string;
}

interface BudtenderQuestion {
  question: string;
  why_it_matters: string;
}

interface Avoidance {
  avoid_what: string;
  reason: string;
}

interface Product {
  id: string;
  name: string;
  brand_name: string;
  primary_goal_id: string;
  goal_ids: string[] | null;
  format_id: string;
  thc_mg: number | null;
  cbd_mg: number | null;
  why_its_good: string;
  starter_dose_note: string;
  experience_tags: string[];
  onset_minutes_min: number | null;
  onset_minutes_max: number | null;
  ships_nationally: boolean;
  available_at_dispensaries: boolean;
  price_range: string;
  hemp_derived: boolean;
  available_in_states: string[];
}

interface Profile {
  goal_id: string;
  secondary_goal_id: string | null;
  tertiary_goal_id: string | null;
  goal_scores: Record<string, unknown> | null;
  experience_level_id: string;
  milestone_key: string;
  unlocked_features: string[];
  terpenes: Terpene[];
  cannabinoid_ratio: CannabinoidRatio | null;
  formats: Format[];
  dose_range: DoseRange | null;
  budtender_questions: BudtenderQuestion[];
  avoidances: Avoidance[];
  products: Product[];
  generated_summary: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

const GOAL_LABELS: Record<string, string> = {
  sleep: "Sleep & Rest",
  stress: "Stress & Anxiety",
  pain: "Pain Relief",
  focus: "Focus & Creativity",
  intimacy: "Intimacy",
  hormonal: "Hormonal Changes",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  never: "Never tried cannabis",
  beginner: "Tried it once or twice",
  occasional: "Occasional user",
  regular: "Regular user",
};

// Which milestone keys unlock terpene guidance
const TERPENES_UNLOCK_MILESTONE = "terpene_guidance";
const MILESTONE_ORDER = [
  "basic_recommendations",
  "format_guidance",
  "dose_guidance",
  "budtender_questions",
  "terpene_guidance",
  "full_dispensary_profile",
];

function milestoneIndex(key: string) {
  return MILESTONE_ORDER.indexOf(key);
}

function isMilestoneUnlocked(current: string, required: string) {
  return milestoneIndex(current) >= milestoneIndex(required);
}

function formatOnset(min: number | null, max: number | null): string {
  if (!min && !max) return "Varies";
  if (min && max) {
    if (min < 60 && max < 60) return `${min}–${max} min`;
    if (min >= 60) return `${min / 60}–${max / 60} hr`;
    return `${min}–${max} min`;
  }
  return `~${min ?? max} min`;
}

/* ─── Sub-components ─────────────────────────────────────────────────────────── */

function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--cream)",
        borderRadius: 16,
        border: "1px solid var(--rule)",
        padding: "20px 24px",
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "0.68rem",
        fontWeight: 700,
        color: "var(--accent-light)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  );
}

function ProductCard({
  product,
  isPrimary,
  onSave,
  isSaved,
}: {
  product: Product;
  isPrimary: boolean;
  onSave: (product: Product) => void | Promise<void>;
  isSaved: boolean;
}) {
  return (
    <div
      style={{
        background: isPrimary ? "#ffffff" : "var(--cream)",
        borderRadius: 12,
        border: `1px solid ${isPrimary ? "rgba(107,147,140,0.2)" : "var(--rule)"}`,
        borderTop: `3px solid ${isPrimary ? "var(--accent-light)" : "var(--rule)"}`,
        padding: "16px 18px",
        boxShadow: isPrimary
          ? "0 4px 14px rgba(31,78,90,0.10), 0 1px 3px rgba(0,0,0,0.05)"
          : "none",
      }}
    >
      {isPrimary && (
        <span
          style={{
            fontSize: "0.6rem",
            fontWeight: 700,
            color: "var(--accent-light)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            display: "block",
            marginBottom: 6,
          }}
        >
          Start here
        </span>
      )}

      <p
        style={{
          fontSize: "0.6rem",
          fontWeight: 600,
          color: "#666666",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 2,
        }}
      >
        {product.brand_name}
      </p>

      <p
        style={{
          fontSize: "0.95rem",
          fontWeight: 700,
          color: "var(--foreground)",
          lineHeight: 1.3,
          marginBottom: 8,
        }}
      >
        {product.name}
      </p>

      <p
        style={{
          fontSize: "0.82rem",
          color: "#666666",
          lineHeight: 1.5,
          marginBottom: 12,
        }}
      >
        {product.why_its_good}
      </p>

      {product.starter_dose_note && (
        <div
          style={{
            background: "rgba(107,147,140,0.08)",
            borderRadius: 8,
            padding: "10px 12px",
            marginBottom: 10,
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--accent-light)",
              marginBottom: 2,
            }}
          >
            How to start
          </p>
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--foreground)",
              lineHeight: 1.5,
            }}
          >
            {product.starter_dose_note}
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {product.onset_minutes_min && (
          <span
            style={{
              fontSize: "0.65rem",
              color: "#888888",
              background: "#f0f0f0",
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            Onset {formatOnset(product.onset_minutes_min, product.onset_minutes_max)}
          </span>
        )}
        {product.ships_nationally && (
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--accent-light)",
              border: "1px solid var(--accent-light)",
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            Ships nationally
          </span>
        )}
        {product.hemp_derived && (
          <span
            style={{
              fontSize: "0.65rem",
              color: "#3b6d11",
              border: "1px solid #97c459",
              background: "#eaf3de",
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            Hemp · CBD only
          </span>
        )}
        {!product.ships_nationally && (
          <span
            style={{
              fontSize: "0.65rem",
              color: "#666666",
              border: "1px solid #cccccc",
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            Dispensary only
          </span>
        )}
        {product.price_range && (
          <span
            style={{
              fontSize: "0.65rem",
              color: "#888888",
              background: "#f0f0f0",
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            {product.price_range}
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: "0.72rem",
          color: "#888888",
          lineHeight: 1.4,
          marginTop: 8,
        }}
      >
        {product.ships_nationally
          ? "Order online — no dispensary visit needed."
          : "Ask for this by name, or something similar. Your budtender can help you find the right fit."}
      </p>
      <button
        type="button"
        onClick={() => void onSave(product)}
        style={{
          width: "100%",
          marginTop: 10,
          border: "none",
          borderRadius: 8,
          padding: "8px 10px",
          background: isSaved ? "rgba(107,147,140,0.15)" : "var(--accent-light)",
          color: isSaved ? "var(--accent-light)" : "#ffffff",
          fontSize: "0.75rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {isSaved ? "Saved ✓" : "Save to my list"}
      </button>
    </div>
  );
}

function LockedSection({
  label,
  articleCount,
  checklistComplete,
}: {
  label: string;
  articleCount: number;
  checklistComplete: boolean;
}) {
  const articlesNeeded = Math.max(0, 5 - articleCount);
  return (
    <div
      style={{
        background: "#1a3a3a",
        borderRadius: 12,
        padding: "16px 20px",
        borderBottom: "3px solid #4a8b8c",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: "#4a8b8c",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "2px 10px",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {checklistComplete
              ? "1 article away"
              : articlesNeeded === 0
                ? "Complete checklist to unlock"
                : `${articlesNeeded} ${articlesNeeded === 1 ? "article" : "articles"} away`}
          </span>
        </div>
      </div>
      <div
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.5,
        }}
      >
        {checklistComplete
          ? "Read 1 more article to earn your terpene profile."
          : "Finish your starter reads or complete the checklist to earn your terpene profile."}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function DispensaryProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [articleCount, setArticleCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [checklistComplete, setChecklistComplete] = useState(false);
  const [isRegenerated, setIsRegenerated] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [listOverlayOpen, setListOverlayOpen] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const loadSignals = async () => {
      try {
        const res = await fetch("/api/v0/user/signals");
        if (!res.ok) return;
        const data = await res.json();
        setArticleCount(data.articles_viewed ?? 0);
        setSaveCount(data.saves ?? 0);
        setChecklistComplete(data.checklist_complete ?? false);
      } catch {}
    };
    loadSignals();
  }, []);

  useEffect(() => {
    const fetchDisplayName = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: userData } = await supabase.rpc("get_user", { user_id: user.id });
      const username = userData?.[0]?.username;
      const firstName =
        user.user_metadata?.full_name?.split(" ")[0] ||
        user.user_metadata?.name?.split(" ")[0];
      setDisplayName(username || firstName || "");
    };
    fetchDisplayName();
  }, []);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  // Load profile — GET first, generate if none exists
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const getRes = await fetch("/api/v0/profile/generate", { method: "GET" });
        const getData = await getRes.json();

        if (getData.profile) {
          if (getData.should_regenerate) {
            // User has hit a new milestone — regenerate silently
            setProfile(getData.profile); // show cached immediately
            setLoading(false);
            // Regenerate in background
            fetch("/api/v0/profile/generate", { method: "POST" })
              .then((r) => r.json())
              .then((postData) => {
                if (postData.profile) {
                  setProfile(postData.profile);
                  setIsRegenerated(true);
                }
              })
              .catch(() => {});
            return;
          }
          setProfile(getData.profile);
          setLoading(false);
          return;
        }

        // No cached profile — generate one
        setGenerating(true);
        const postRes = await fetch("/api/v0/profile/generate", { method: "POST" });
        const postData = await postRes.json();
        if (postData.profile) {
          setProfile(postData.profile);
        }
        // If no profile returned, leave profile as null and error as null
        // The empty state handler will show the new user roadmap
      } catch {
        setError("Something went wrong loading your profile. Please try again.");
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    };

    loadProfile();
  }, []);

  const handleRefresh = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/v0/profile/generate", { method: "POST" });
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
    } catch {
      // silent fail
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!profile) return;

    const loadSavedProducts = async () => {
      try {
        const res = await fetch("/api/v0/user/product-saves", { cache: "no-store" });
        if (!res.ok) return;
        const payload = await res.json();
        const data = payload?.saves;

        if (!data) return;

        setSavedProducts(
          data.map((row) => ({
            id: row.product_id,
            name: row.product_name,
            brand_name: row.brand_name,
            primary_goal_id: row.goal_id,
            goal_ids: null,
            goal_id: row.goal_id,
            format_id: "",
            thc_mg: null,
            cbd_mg: null,
            why_its_good: "",
            starter_dose_note: "",
            experience_tags: [],
            onset_minutes_min: null,
            onset_minutes_max: null,
            ships_nationally: false,
            available_at_dispensaries: false,
            price_range: "",
            hemp_derived: false,
            available_in_states: [],
          }))
        );
      } catch {
        // no-op: saved products should remain usable even if fetch fails
      }
    };

    loadSavedProducts();
  }, [profile]);

  const handleSave = async (product: Product) => {
    const isAlreadySaved = savedProducts.some((saved) => saved.id === product.id);

    setSavedProducts((prev) =>
      prev.some((saved) => saved.id === product.id)
        ? prev.filter((saved) => saved.id !== product.id)
        : [...prev, product]
    );

    if (!isAlreadySaved) {
      setShowToast(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setShowToast(false);
        toastTimerRef.current = null;
      }, 2000);
    }

    if (!profile) return;

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (isAlreadySaved) {
        await fetch(
          `/api/v0/user/product-saves?product_id=${encodeURIComponent(product.id)}`,
          {
            method: "DELETE",
          }
        );
      } else {
        await fetch("/api/v0/user/product-saves", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: product.id,
            product_name: product.name,
            brand_name: product.brand_name,
            goal_id: profile.goal_id,
          }),
        });
      }

      await supabase.from("user_events").insert({
        event_name: "product_saved",
        user_id: user.id,
        properties: {
          product_id: product.id,
          product_name: product.name,
          brand_name: product.brand_name,
          goal_id: profile.goal_id,
        },
      });
    } catch {
      // no-op: don't block UI interactions on event logging failures
    }
  };

  // ── Loading state
  if (loading || generating) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--background)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid var(--rule)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ fontSize: "0.85rem", color: "var(--subtext)" }}>
          {generating ? "Building your profile…" : "Loading…"}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error state
  if (error || !profile) {
    const isNewUser = !error;
    return (
      <div style={{ minHeight: "100vh", background: "var(--background)", maxWidth: "48rem", margin: "0 auto", padding: "40px 20px" }}>
        {isNewUser ? (
          <div style={{ background: '#1a3a3a', borderRadius: 16, padding: '32px 24px', borderBottom: '3px solid #4a8b8c', marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#c8f135', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              YOUR DISPENSARY GUIDE
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#ffffff', marginBottom: 8 }}>
              Start here to unlock your guide.
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 24 }}>
              Start reading and your guide generates automatically — the more you explore, the smarter it gets.
            </div>

            {/* CTA comes right after the subtitle, before the milestone rows */}
            <a href="/explore" style={{
              display: 'block', marginBottom: 20, background: '#c8f135', borderRadius: 10,
              padding: '14px 20px', textDecoration: 'none', textAlign: 'center',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a3a' }}>Start reading</div>
              <div style={{ fontSize: 11, color: 'rgba(26,58,58,0.7)', marginTop: 2 }}>Your guide builds as you read</div>
            </a>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

              {/* Always unlocked */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(74,139,140,0.2)', borderRadius: 10, padding: '10px 14px',
                border: '1px solid rgba(74,139,140,0.3)',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#4a8b8c' }}>Your personalized guide</div>
                  <div style={{ fontSize: 11, color: '#4a8b8c', marginTop: 2 }}>Products, formats, and dosing — ready now</div>
                </div>
                <div style={{ background: '#4a8b8c', borderRadius: 20, padding: '2px 8px' }}>
                  <span style={{ fontSize: 10, fontWeight: 500, color: '#fff' }}>Ready</span>
                </div>
              </div>

              {/* Next up — Budtender Questions */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#ffffff' }}>Budtender Questions</div>
                    <div style={{ background: '#c8f135', borderRadius: 20, padding: '1px 7px' }}>
                      <span style={{ fontSize: 9, fontWeight: 500, color: '#1a3a3a' }}>Next up</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                    5 specific questions to ask your budtender
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                    0 of 4 articles read · 0 saved
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>4 away</div>
              </div>

              {/* Locked — Terpene Profile */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>Terpene Profile</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                    5 articles or complete the checklist
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>🔒</div>
              </div>

            </div>
          </div>
        ) : (
          <SectionCard>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>
              Something went wrong
            </p>
            <p style={{ fontSize: '0.85rem', color: '#666666', lineHeight: 1.6 }}>
              {error}
            </p>
          </SectionCard>
        )}
      </div>
    );
  }

  // ── Shape data
  const goalLabel = GOAL_LABELS[profile.goal_id] ?? profile.goal_id;
  const experienceLabel =
    EXPERIENCE_LABELS[profile.experience_level_id] ?? profile.experience_level_id;
  const allGoalIds = [
    profile.goal_id,
    profile.secondary_goal_id ?? null,
    profile.tertiary_goal_id ?? (profile.goal_scores as any)?.tertiary_goal_id ?? null,
  ].filter(Boolean) as string[];
  const getFilteredProducts = (filter: string) => {
    if (filter === "ships") return profile.products.filter((p) => p.ships_nationally);
    if (filter === "dispensary") return profile.products.filter((p) => !p.ships_nationally);
    return profile.products;
  };

  const terpenesUnlocked = articleCount >= 5 || checklistComplete;

  // ── Render
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        paddingBottom: 124,
      }}
    >
      <div
        style={{
          maxWidth: "48rem",
          margin: "0 auto",
          padding: "28px 20px 0",
        }}
      >

        {/* ── Page header ── */}
        <div
          style={{
            marginLeft: -20,
            marginRight: -20,
            marginTop: -28,
            padding: "32px 24px 28px",
            marginBottom: 24,
            background: "#1a3a3a",
            borderBottom: "3px solid #4a8b8c",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#c8f135",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: 0,
              }}
            >
              Your dispensary guide
            </p>
            {savedProducts.length > 0 ? (
              <button
                type="button"
                onClick={() => setListOverlayOpen(true)}
                style={{
                  flexShrink: 0,
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                  background: "transparent",
                  fontSize: 12,
                  padding: "4px 12px",
                  borderRadius: 20,
                  cursor: "pointer",
                }}
              >
                My list ({savedProducts.length})
              </button>
            ) : null}
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: "#ffffff",
              lineHeight: 1.2,
              marginBottom: 0,
            }}
          >
            {displayName
              ? `Here's your guide, ${displayName}.`
              : "Here's your guide."}
          </h1>
          <p
            style={{
              fontSize: "0.82rem",
              marginTop: 6,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {allGoalIds.map(id => GOAL_LABELS[id] ?? id).join(', ')} · {experienceLabel}
          </p>
        </div>

        {/* ── 1. Claude summary ── */}
        {profile.generated_summary && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 12,
              padding: "16px 20px",
              borderLeft: "4px solid #4a8b8c",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#4a8b8c",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              Your personalized summary
            </div>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--foreground)",
                lineHeight: 1.7,
                fontWeight: 400,
                margin: 0,
                paddingLeft: 0,
              }}
            >
              {profile.generated_summary}
            </p>
          </div>
        )}
        {isRegenerated && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "#888888",
              marginTop: 8,
              fontStyle: "italic",
            }}
          >
            Updated based on your recent reading.
          </p>
        )}

        {/* Filter row */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {["all", "ships", "dispensary"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              style={{
                fontSize: "0.82rem",
                fontWeight: 500,
                padding: "8px 18px",
                borderRadius: 999,
                border: activeFilter === f ? "none" : "1px solid var(--rule)",
                background: activeFilter === f ? "#1a3a3a" : "transparent",
                color: activeFilter === f ? "#c8f135" : "#666666",
                cursor: "pointer",
              }}
            >
              {f === "all" ? "All" : f === "ships" ? "Ships to me" : "At a dispensary"}
            </button>
          ))}
        </div>
        {allGoalIds.map((goalId) => {
          const goalProducts = getFilteredProducts(activeFilter).filter(
            (p) => p.primary_goal_id === goalId || (p.goal_ids ?? []).includes(goalId)
          ).slice(0, 3);
          if (goalProducts.length < 1) return null;
          return (
            <div key={goalId} style={{ marginBottom: 32 }}>
              <p style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#4f5a58",
                marginBottom: 12,
                marginTop: 8,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                {GOAL_LABELS[goalId] ?? goalId}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {goalProducts.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isPrimary={i === 0}
                    onSave={handleSave}
                    isSaved={savedProducts.some((saved) => saved.id === p.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* ── 3. Your plan ── */}
        <SectionCard>
          <p
            style={{
              fontWeight: 500,
              fontSize: 11,
              color: "#1a3a3a",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Your plan
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Format */}
            {profile.formats[0] && (
              <div>
                <p
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "#666666",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 2,
                  }}
                >
                  Format
                </p>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginBottom: 2,
                  }}
                >
                  {profile.formats[0].display_name}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#666666", lineHeight: 1.5 }}>
                  {profile.formats[0].rationale}
                </p>
              </div>
            )}

            {/* Ratio */}
            {profile.cannabinoid_ratio && (
              <div
                style={{
                  borderTop: "1px solid var(--rule)",
                  paddingTop: 16,
                }}
              >
                <p
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "#666666",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 2,
                  }}
                >
                  What to look for
                </p>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginBottom: 2,
                  }}
                >
                  {profile.cannabinoid_ratio.display_name}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#666666", lineHeight: 1.5 }}>
                  {profile.cannabinoid_ratio.rationale}
                </p>
              </div>
            )}

            {/* Dose */}
            {profile.dose_range && (
              <div
                style={{
                  borderTop: "1px solid var(--rule)",
                  paddingTop: 16,
                }}
              >
                <p
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "#666666",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 2,
                  }}
                >
                  Starting dose
                </p>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginBottom: 2,
                  }}
                >
                  {profile.dose_range.starting_dose_mg}mg {profile.dose_range.cannabinoid}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#666666", lineHeight: 1.5 }}>
                  {profile.dose_range.notes}
                </p>
              </div>
            )}

          </div>
        </SectionCard>

        {/* ── 4. What to say at the dispensary ── */}
        {(() => {
          const budtenderUnlocked = articleCount >= 4 && saveCount >= 1;
          if (budtenderUnlocked && profile.budtender_questions.length > 0) {
            return (
              <SectionCard>
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: 11,
                    color: "#1a3a3a",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  What to say at the dispensary
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#666666",
                    lineHeight: 1.5,
                    marginBottom: 16,
                  }}
                >
                  Tell your budtender these things. You don't need to know the answers —
                  just asking shows you know what you're looking for.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {profile.budtender_questions.map((q, i) => (
                    <div
                      key={i}
                      style={{
                        borderLeft: "3px solid var(--accent-light)",
                        paddingLeft: 12,
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          color: "var(--foreground)",
                          lineHeight: 1.4,
                          marginBottom: 3,
                        }}
                      >
                        "{q.question}"
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#666666",
                          lineHeight: 1.4,
                        }}
                      >
                        {q.why_it_matters}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            );
          }
          if (!budtenderUnlocked) {
            return (
              <div
                style={{
                  background: "rgba(74,139,140,0.08)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  border: "1px solid rgba(74,139,140,0.25)",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#4a8b8c",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  What to say at the dispensary
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#4a8b8c",
                    lineHeight: 1.5,
                    marginBottom: 8,
                  }}
                >
                  Keep exploring — your personalized questions are almost ready.
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(74,139,140,0.7)",
                  }}
                >
                  {articleCount} of 4 articles read · {saveCount >= 1 ? "1 saved" : "0 saved"}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* ── 5. Save this ── */}
        <div
          style={{
            background: "var(--cream)",
            borderRadius: 16,
            border: "1px solid var(--rule)",
            padding: "16px 24px",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: 4,
            }}
          >
            Save this for your visit
          </p>
          <p style={{ fontSize: "0.78rem", color: "#666666", lineHeight: 1.5 }}>
            Bookmark this page or screenshot it to take it with you — your guide
            will be here whenever you need it.
          </p>
        </div>

        {/* ── 7. What to avoid ── */}
        {profile.avoidances.length > 0 && (
          <SectionCard>
            <SectionLabel>What to avoid</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {profile.avoidances.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#767676",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    ✕
                  </span>
                  <div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "var(--foreground)",
                        marginBottom: 2,
                      }}
                    >
                      {a.avoid_what}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "#666666", lineHeight: 1.4 }}>
                      {a.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── 8. Terpene profile — locked or unlocked ── */}
        {terpenesUnlocked ? (
          <SectionCard>
            <SectionLabel>Why this works — terpene profile</SectionLabel>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#666666",
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              Terpenes are what give cannabis its effects and aroma. Look for these
              on product labels at the dispensary.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {profile.terpenes.map((t, i) => (
                <div
                  key={i}
                  style={{
                    borderLeft: "3px solid var(--rule)",
                    paddingLeft: 12,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      marginBottom: 2,
                    }}
                  >
                    {t.display_name}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#666666",
                      lineHeight: 1.4,
                      marginBottom: 3,
                    }}
                  >
                    {t.rationale}
                  </p>
                  {t.found_in && (
                    <p style={{ fontSize: "0.7rem", color: "#767676" }}>
                      Found in: {t.found_in}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        ) : (
          <LockedSection
            label="Terpene profile"
            articleCount={articleCount}
            checklistComplete={checklistComplete}
          />
        )}

        {/* ── Refresh button ── */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={generating}
            style={{
              background: "none",
              border: "none",
              color: "var(--subtext)",
              fontSize: "0.75rem",
              textDecoration: "underline",
              cursor: generating ? "not-allowed" : "pointer",
              opacity: generating ? 0.5 : 1,
            }}
          >
            {generating ? "Updating…" : "Refresh my profile"}
          </button>
        </div>

      </div>

      {showToast ? (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 80,
            right: 16,
            zIndex: 200,
            background: "#1a3a3a",
            color: "#c8f135",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 13,
          }}
        >
          Added to your dispensary list
        </div>
      ) : null}

      {listOverlayOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#1a3a3a",
            overflowY: "auto",
            padding: "24px 20px 40px",
          }}
        >
          <div
            style={{
              maxWidth: "36rem",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                Your dispensary list
              </h2>
              <button
                type="button"
                onClick={() => setListOverlayOpen(false)}
                aria-label="Close list"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#ffffff",
                  fontSize: 28,
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                ×
              </button>
            </div>
            <p
              style={{
                margin: "0 0 28px",
                fontSize: 14,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.5,
              }}
            >
              Show this to your budtender or screenshot it before you go.
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {savedProducts.map((saved, idx) => (
                <div key={saved.id}>
                  {idx > 0 ? (
                    <div
                      style={{
                        height: 1,
                        background: "rgba(255,255,255,0.1)",
                        margin: "0 0 20px",
                      }}
                    />
                  ) : null}
                  <div style={{ paddingBottom: 20 }}>
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#c8f135",
                      }}
                    >
                      {saved.brand_name}
                    </p>
                    <p
                      style={{
                        margin: "0 0 8px",
                        fontSize: 16,
                        fontWeight: 500,
                        color: "#ffffff",
                        lineHeight: 1.3,
                      }}
                    >
                      {saved.name}
                    </p>
                    {saved.starter_dose_note ? (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: "rgba(255,255,255,0.6)",
                          lineHeight: 1.45,
                        }}
                      >
                        {saved.starter_dose_note}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <p
              style={{
                marginTop: 32,
                marginBottom: 0,
                fontSize: 13,
                fontStyle: "italic",
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.5,
              }}
            >
              Your guide is personalized to your goals and experience level.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
