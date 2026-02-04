import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validEmail = (e) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

    const canSubmit = validEmail(email) && password.length >= 6 && !loading;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Login failed");
            // example: store token and redirect
            if (data.token) localStorage.setItem("token", data.token);
            navigate("/");
        } catch (err) {
            setError(err.message || "Network error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form} aria-label="login form">
                <h2 style={styles.h2}>Sign in</h2>

                {error && (
                    <div role="alert" style={styles.error}>
                        {error}
                    </div>
                )}

                <label style={styles.label}>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                    />
                </label>

                <label style={styles.label}>
                    Password
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                        minLength={6}
                        autoComplete="current-password"
                        placeholder="••••••••"
                    />
                </label>

                <div style={styles.row}>
                    <label style={styles.smallLabel}>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword((s) => !s)}
                        />{" "}
                        Show
                    </label>
                    <Link to="/forgot" style={styles.link}>
                        Forgot?
                    </Link>
                </div>

                <button type="submit" disabled={!canSubmit} style={styles.button}>
                    {loading ? "Signing in…" : "Sign in"}
                </button>

                <div style={styles.footer}>
                    Don't have an account? <Link to="/register">Register</Link>
                </div>
            </form>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "#f7fafc",
    },
    form: {
        width: 360,
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        background: "#fff",
    },
    h2: { margin: "0 0 16px", textAlign: "center" },
    label: { display: "block", marginBottom: 12, fontSize: 14, color: "#111" },
    input: {
        display: "block",
        width: "100%",
        marginTop: 6,
        padding: "10px 12px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        fontSize: 14,
    },
    row: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    smallLabel: { fontSize: 13, color: "#374151" },
    link: { fontSize: 13, color: "#2563eb", textDecoration: "none" },
    button: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: 6,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        fontSize: 15,
        cursor: "pointer",
        opacity: 1,
    },
    error: {
        marginBottom: 12,
        padding: 10,
        borderRadius: 6,
        background: "#fee2e2",
        color: "#991b1b",
        fontSize: 13,
    },
    footer: { marginTop: 12, fontSize: 13, textAlign: "center", color: "#374151" },
};