"use client";

import { useEffect, useState } from "react";
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
}

interface Profile {
  goal_id: string;
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
}: {
  product: Product;
  isPrimary: boolean;
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
              color: "#666666",
              background: "var(--rule)",
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
            Ships to you
          </span>
        )}
        {product.price_range && (
          <span
            style={{
              fontSize: "0.65rem",
              color: "#666666",
              background: "var(--rule)",
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            {product.price_range}
          </span>
        )}
      </div>
    </div>
  );
}

function LockedSection({
  label,
  articlesNeeded,
}: {
  label: string;
  articlesNeeded: number;
}) {
  return (
    <SectionCard>
      <SectionLabel>{label}</SectionLabel>
      <div
        style={{
          filter: "blur(3px)",
          opacity: 0.4,
          pointerEvents: "none",
          userSelect: "none",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: 12,
            background: "var(--rule)",
            borderRadius: 6,
            marginBottom: 8,
            width: "80%",
          }}
        />
        <div
          style={{
            height: 12,
            background: "var(--rule)",
            borderRadius: 6,
            width: "60%",
          }}
        />
      </div>
      <p
        style={{
          fontSize: "0.78rem",
          color: "#666666",
          lineHeight: 1.5,
        }}
      >
        Your {label.toLowerCase()} unlocks after {articlesNeeded} more{" "}
        {articlesNeeded === 1 ? "article" : "articles"}. Keep exploring.
      </p>
    </SectionCard>
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
        // Try to load cached profile first
        const getRes = await fetch("/api/v0/profile/generate", {
          method: "GET",
        });
        const getData = await getRes.json();

        if (getData.profile) {
          setProfile(getData.profile);
          setLoading(false);
          return;
        }

        // No cached profile — generate one
        setGenerating(true);
        const postRes = await fetch("/api/v0/profile/generate", {
          method: "POST",
        });
        const postData = await postRes.json();

        if (postData.profile) {
          setProfile(postData.profile);
        } else {
          setError("We couldn't generate your profile yet. Try reading a few more articles first.");
        }
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
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--background)",
          maxWidth: "48rem",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <SectionCard>
          <p
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: 8,
            }}
          >
            Your profile isn't ready yet
          </p>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#666666",
              lineHeight: 1.6,
            }}
          >
            {error ??
              "Read a few articles and come back — the more we know about what you're curious about, the better we can guide you."}
          </p>
        </SectionCard>
      </div>
    );
  }

  // ── Shape data
  const goalLabel = GOAL_LABELS[profile.goal_id] ?? profile.goal_id;
  const experienceLabel =
    EXPERIENCE_LABELS[profile.experience_level_id] ?? profile.experience_level_id;
  const currentMilestone = profile.milestone_key;

  const dispensaryProducts = profile.products.filter((p) => p.available_at_dispensaries);
  const shippableProducts = profile.products.filter((p) => p.ships_nationally);
  const primaryProduct = dispensaryProducts[0] ?? shippableProducts[0] ?? null;
  const backupProduct =
    dispensaryProducts[1] ?? shippableProducts[0] ?? dispensaryProducts[0] ?? null;
  const otherProducts = profile.products.filter(
    (p) => p.id !== primaryProduct?.id && p.id !== backupProduct?.id
  );

  const terpenesUnlocked = isMilestoneUnlocked(currentMilestone, TERPENES_UNLOCK_MILESTONE);

  // ── Render
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        paddingBottom: 60,
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
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#c8f135",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            Your dispensary guide
          </p>
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
            {goalLabel} · {experienceLabel}
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

        {/* ── 2. Start here — primary + backup product ── */}
        {primaryProduct && (
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#c8f135",
                marginBottom: 12,
                marginTop: 8,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Start here
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ProductCard product={primaryProduct} isPrimary={true} />
              {backupProduct && backupProduct.id !== primaryProduct.id && (
                <ProductCard product={backupProduct} isPrimary={false} />
              )}
            </div>
          </div>
        )}

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
        {profile.budtender_questions.length > 0 && (
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
        )}

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

        {/* ── 6. Other good options ── */}
        {otherProducts.length > 0 && (
          <div style={{ marginBottom: 16 }}>
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
                Other good options
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {otherProducts.map((p) => (
                  <ProductCard key={p.id} product={p} isPrimary={false} />
                ))}
              </div>
            </SectionCard>
          </div>
        )}

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
          <LockedSection label="Terpene profile" articlesNeeded={2} />
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
    </div>
  );
}
