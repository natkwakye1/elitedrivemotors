"use client";
// src/app/auth/login/page.tsx — Admin login

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Ic } from "@/src/components/ui/Icons";
import { useAdminAuth } from "@/src/context/AdminAuthContext";

// ─── Reusable Input ───────────────────────────────────────────────────────────
function Input({
  label, type = "text", value, onChange, placeholder, t,
}: {
  label: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; t: any;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 600,
        color: t.textMuted, textTransform: "uppercase",
        letterSpacing: 1, marginBottom: 7, fontFamily: "'DM Sans', sans-serif",
      }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          value={value} onChange={onChange} placeholder={placeholder}
          onKeyDown={e => e.key === "Enter" && (document.getElementById("admin-submit") as HTMLButtonElement)?.click()}
          style={{
            width: "100%", padding: "11px 14px",
            paddingRight: isPassword ? 44 : 14,
            borderRadius: 10, border: `1.5px solid ${t.border}`,
            background: t.inputBg, color: t.textPri, fontSize: 13,
            outline: "none", fontFamily: "'DM Sans', sans-serif",
            boxSizing: "border-box", transition: "border-color 0.15s",
          }}
          onFocus={e => (e.target.style.borderColor = t.accent)}
          onBlur={e  => (e.target.style.borderColor = t.border)}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            style={{
              position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)", background: "none",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", padding: 0,
            }}>
            {show ? Ic.EyeOff(t.textMuted) : Ic.Eye(t.textMuted)}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminLoginPage() {
  const router                = useRouter();
  const { login }             = useAdminAuth();
  const { dark, setDark, t } = useTheme();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const panelBg = dark ? "#0a0a0a" : "#111111";

  const submit = async () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.ok) {
      router.push("/dashboard/super-admin");
    } else {
      setError(result.error ?? "Login failed.");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; font-family: 'DM Sans', sans-serif; transition: background 0.25s; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 4px; }
        input::placeholder { color: ${t.inputText}; }
      `}</style>

      <div style={{
        display: "flex", height: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        background: t.bg, overflow: "hidden",
      }}>

        {/* ── LEFT dark branding panel ── */}
        <div style={{
          width: "44%", flexShrink: 0, background: panelBg,
          display: "flex", flexDirection: "column",
          position: "relative", overflow: "hidden",
        }}>
          {/* dot grid */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none", zIndex: 0 }}>
            <svg width="100%" height="100%">
              <defs>
                <pattern id="dots" width="50" height="50" patternUnits="userSpaceOnUse">
                  <circle cx="25" cy="25" r="1.5" fill="white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)"/>
            </svg>
          </div>

          {/* bottom vignette */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "38%",
            background: `linear-gradient(to top, ${panelBg} 0%, transparent 100%)`,
            pointerEvents: "none", zIndex: 2,
          }}/>

          {/* car image */}
          <div style={{
            position: "absolute", bottom: "9%", left: "-5%",
            width: "110%", height: "45%", zIndex: 1, pointerEvents: "none",
          }}>
            <div style={{
              position: "absolute", bottom: 0, left: "10%", right: "10%", height: "18%",
              background: "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.07) 0%, transparent 70%)",
            }}/>
            <Image
              src="/images/cars/white-Toyota.png"
              alt="Toyota featured car"
              fill sizes="50vw"
              style={{
                objectFit: "contain", objectPosition: "center bottom",
                filter: "drop-shadow(0 24px 50px rgba(0,0,0,0.85)) brightness(0.95) contrast(1.08) saturate(1.1)",
              }}
              priority
            />
          </div>

          {/* Logo */}
          <div style={{ padding: "36px 40px 0", position: "relative", zIndex: 3 }}>
            <div
              onClick={() => router.push("/")}
              style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", width: "fit-content" }}
            >
              <div style={{ width: 34, height: 34, background: "#fff", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Ic.CarLogo("#111")}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: 2, lineHeight: 1.1 }}>ELITE</div>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: "rgba(255,255,255,0.38)", letterSpacing: 1.5 }}>DRIVE MOTORS</div>
              </div>
            </div>
          </div>

          {/* Hero copy */}
          <div style={{ padding: "28px 40px 0", position: "relative", zIndex: 3 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1.18, marginBottom: 12 }}>
              Admin<br />Control Centre.
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.75, maxWidth: 270, marginBottom: 22 }}>
              Sign in to manage your fleet, customers, rentals and full platform operations.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: "Fleet Mgmt",    icon: Ic.Vehicles  },
                { label: "Customer Data", icon: Ic.Users     },
                { label: "Financials",    icon: Ic.Sales     },
                { label: "Reports",       icon: Ic.Reports   },
              ].map(f => (
                <span key={f.label} style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 20, padding: "5px 12px",
                  fontSize: 11.5, color: "rgba(255,255,255,0.6)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ display: "flex", opacity: 0.7 }}>{f.icon("rgba(255,255,255,0.6)")}</span>
                  {f.label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}/>

          {/* Demo credentials */}
          <div style={{
            padding: "20px 40px 32px", position: "relative", zIndex: 3,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Demo admin credentials:</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
              Email: <span style={{ color: "rgba(255,255,255,0.65)" }}>admin@elitedrivemotors.com</span><br/>
              Password: <span style={{ color: "rgba(255,255,255,0.65)" }}>admin123</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT form panel ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* TopBar strip */}
          <div style={{
            height: 52, flexShrink: 0,
            borderBottom: `1px solid ${t.border}`,
            background: t.cardBg,
            display: "flex", alignItems: "center",
            justifyContent: "space-between", padding: "0 20px",
          }}>
            <span style={{ fontSize: 12, color: t.textMuted }}>Admin Portal</span>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => router.push("/customer/login")}
                style={{ fontSize: 12, fontWeight: 600, color: t.textSec, background: "none", border: `1px solid ${t.border}`, borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
              >
                Customer Login
              </button>
              <button onClick={() => setDark(!dark)} style={{
                width: 34, height: 34, borderRadius: 8,
                border: `1px solid ${t.border}`, background: t.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}>
                {dark ? Ic.Sun(t.textMuted) : Ic.Moon(t.textMuted)}
              </button>
            </div>
          </div>

          {/* Form */}
          <div style={{
            flex: 1, overflowY: "auto",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "40px",
          }}>
            <div style={{ width: "100%", maxWidth: 400 }}>

              {/* Heading */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1, background: t.accent + "12", color: t.accent, border: `1px solid ${t.accent}25`, borderRadius: 20, padding: "4px 12px", marginBottom: 12 }}>
                  {Ic.Dashboard(t.accent)} ADMIN LOGIN
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: t.textPri, marginBottom: 5 }}>Welcome back</h1>
                <p style={{ fontSize: 13, color: t.textMuted }}>Sign in to your admin account</p>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#EF4444",
                  marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
                }}>
                  {Ic.Alert("#EF4444")} {error}
                </div>
              )}

              {/* Fields */}
              <Input label="Email" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="admin@elitedrivemotors.com" t={t}/>
              <Input label="Password" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" t={t}/>

              {/* Forgot password */}
              <div style={{ textAlign: "right", marginBottom: 22, marginTop: -6 }}>
                <span
                  onClick={() => router.push("/auth/forgot-password")}
                  style={{ fontSize: 12, color: t.accent, fontWeight: 600, cursor: "pointer" }}
                >
                  Forgot password?
                </span>
              </div>

              {/* Submit */}
              <button id="admin-submit" onClick={submit} disabled={loading} style={{
                width: "100%", padding: "12px 0", borderRadius: 10,
                border: "none", background: t.accent, color: dark ? "#000000" : "#ffffff",
                fontSize: 14, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                opacity: loading ? 0.75 : 1, transition: "opacity 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {loading
                  ? <>{Ic.Spinner(dark ? "#000" : "#fff")} Signing in…</>
                  : <>Sign In {Ic.ArrowRight(dark ? "#000" : "#fff")}</>}
              </button>

              <div style={{ height: 1, background: t.divider, margin: "24px 0" }}/>

              {/* Back to home */}
              <div
                onClick={() => router.push("/")}
                style={{
                  padding: "12px 16px", borderRadius: 10,
                  border: `1px solid ${t.border}`, background: t.cardBg,
                  display: "flex", alignItems: "center", gap: 10,
                  cursor: "pointer", transition: "border-color 0.15s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = t.accent)}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = t.border)}
              >
                <span style={{ display: "flex", opacity: 0.6 }}>{Ic.ChevronRight(t.textMuted)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.textPri }}>Not an admin?</div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>Go back to portal selection</div>
                </div>
                {Ic.ChevronRight(t.textMuted)}
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}
