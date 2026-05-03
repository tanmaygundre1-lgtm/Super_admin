import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { superAdminService } from "../../services/superAdminService";

function SPSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    setLoading(true);

    try {
      const response = await superAdminService.signupInternalEmployee({
        full_name: form.fullName,
        email: form.email,
        password: form.password,
      });
      setSuccess(response.message || "Employee registered successfully.");
      setForm({ fullName: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-shell sp-auth-wrapper">
      <div className="sp-auth-card">
        <p className="sp-brand-kicker">Protected Setup</p>
        <h1 className="sp-title">Register Internal Employee</h1>
        <p className="sp-subtitle">
          Create a new service_provider_staff account from the Super Admin
          portal.
        </p>

        <form className="sp-form" onSubmit={handleSubmit}>
          <label className="sp-label" htmlFor="fullName">
            Full Name
            <input
              id="fullName"
              className="sp-input"
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </label>

          <label className="sp-label" htmlFor="email">
            Email
            <input
              id="email"
              className="sp-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="sp-label" htmlFor="password">
            Password
            <input
              id="password"
              className="sp-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="sp-label" htmlFor="confirmPassword">
            Confirm Password
            <input
              id="confirmPassword"
              className="sp-input"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

          {error && <div className="sp-error">{error}</div>}
          {success && <div className="sp-success">{success}</div>}

          <button
            className="sp-btn sp-btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : "Create Employee"}
          </button>
        </form>

        <button
          className="sp-btn sp-btn-ghost"
          type="button"
          style={{ marginTop: "12px", width: "100%" }}
          onClick={() => navigate("/sp-control-portal")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default SPSignup;
