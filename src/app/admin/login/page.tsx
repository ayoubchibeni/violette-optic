"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

const API_URL = "http://localhost:3001";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message || "Invalid email or password."
        );
      }

      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoCircle}>
            <LockKeyhole size={28} color="#8b6680" />
          </div>

          <h1 style={styles.title}>Violette Optic</h1>
          <p style={styles.subtitle}>Administration Portal</p>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.heading}>Welcome back</h2>
        <p style={styles.description}>
          Sign in to access your administration dashboard.
        </p>

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>Email address</label>

          <div style={styles.inputContainer}>
            <Mail size={18} color="#9b8795" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <label style={styles.label}>Password</label>

          <div style={styles.inputContainer}>
            <LockKeyhole size={18} color="#9b8795" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.visibilityButton}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={18} color="#9b8795" />
              ) : (
                <Eye size={18} color="#9b8795" />
              )}
            </button>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={styles.footer}>
          Violette Optic © 2026
        </p>
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f5f7",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "40px",
    boxShadow: "0 12px 40px rgba(70, 40, 60, 0.08)",
  },
  logoContainer: {
    textAlign: "center",
  },
  logoCircle: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    background: "#f5edf3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  title: {
    fontSize: "25px",
    color: "#65465e",
    margin: "0 0 6px",
    fontWeight: 700,
  },
  subtitle: {
    color: "#9b8795",
    fontSize: "14px",
    margin: 0,
  },
  divider: {
    height: "1px",
    background: "#eee7ec",
    margin: "28px 0",
  },
  heading: {
    fontSize: "22px",
    color: "#332b32",
    margin: "0 0 8px",
  },
  description: {
    fontSize: "14px",
    color: "#887d86",
    lineHeight: 1.6,
    margin: "0 0 26px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#514650",
    marginBottom: "9px",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #e8dfe6",
    borderRadius: "9px",
    padding: "0 13px",
    height: "48px",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#332b32",
    background: "transparent",
  },
  visibilityButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
  },
  error: {
    color: "#c0394b",
    fontSize: "13px",
    margin: "0 0 16px",
  },
  submitButton: {
    height: "48px",
    border: "none",
    borderRadius: "9px",
    background: "#79566f",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 600,
    marginTop: "4px",
  },
  footer: {
    textAlign: "center",
    color: "#aa9da7",
    fontSize: "12px",
    margin: "28px 0 0",
  },
};
