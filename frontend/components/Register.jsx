import React, { useState } from "react";

export default function Register() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const onChange = (e) => {
        setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    const validate = () => {
        const err = {};
        if (!form.firstName.trim()) err.firstName = "First name is required";
        if (!form.lastName.trim()) err.lastName = "Last name is required";
        if (!form.email.trim()) {
            err.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            err.email = "Invalid email";
        }
        if (!form.password) err.password = "Password is required";
        if (form.password !== form.confirmPassword)
            err.confirmPassword = "Passwords do not match";
        return err;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        const v = validate();
        if (Object.keys(v).length) {
            setErrors(v);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    password: form.password,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrors({ submit: data?.message || "Registration failed" });
            } else {
                setSuccess("Registration successful. Please check your email.");
                setForm({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
            }
        } catch (err) {
            setErrors({ submit: "Network error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form} noValidate>
                <h2 style={styles.title}>Create an account</h2>

                <div style={styles.row}>
                    <div style={styles.field}>
                        <label style={styles.label}>First name</label>
                        <input
                            name="firstName"
                            value={form.firstName}
                            onChange={onChange}
                            style={styles.input}
                            required
                        />
                        {errors.firstName && <div style={styles.error}>{errors.firstName}</div>}
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Last name</label>
                        <input
                            name="lastName"
                            value={form.lastName}
                            onChange={onChange}
                            style={styles.input}
                            required
                        />
                        {errors.lastName && <div style={styles.error}>{errors.lastName}</div>}
                    </div>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        style={styles.input}
                        required
                    />
                    {errors.email && <div style={styles.error}>{errors.email}</div>}
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Password</label>
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={onChange}
                        style={styles.input}
                        required
                    />
                    {errors.password && <div style={styles.error}>{errors.password}</div>}
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Confirm Password</label>
                    <input
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={onChange}
                        style={styles.input}
                        required
                    />
                    {errors.confirmPassword && <div style={styles.error}>{errors.confirmPassword}</div>}
                </div>

                {errors.submit && <div style={styles.error}>{errors.submit}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        padding: 24,
    },
    form: {
        width: 420,
        maxWidth: "100%",
        padding: 24,
        border: "1px solid #e6e6e6",
        borderRadius: 8,
        background: "#fff",
    },
    title: {
        margin: "0 0 16px",
        textAlign: "center",
    },
    row: {
        display: "flex",
        gap: 12,
    },
    field: {
        display: "flex",
        flexDirection: "column",
        marginBottom: 12,
        flex: 1,
    },
    label: {
        marginBottom: 6,
        fontSize: 14,
    },
    input: {
        padding: "8px 10px",
        fontSize: 14,
        borderRadius: 4,
        border: "1px solid #ccc",
    },
    button: {
        width: "100%",
        padding: "10px 12px",
        background: "#0366d6",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        marginTop: 8,
        fontSize: 15,
    },
    error: {
        color: "#b00020",
        fontSize: 13,
        marginTop: 6,
    },
    success: {
        color: "#0a7a3f",
        fontSize: 13,
        marginTop: 6,
    },
};