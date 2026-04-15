import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";

export function AuthorityLoginPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectTo =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state &&
    typeof (location.state as { from?: unknown }).from === "string"
      ? (location.state as { from: string }).from
      : "/admin";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await login({ email, password });
      setSuccess(t("auth.loginSuccess"));
      window.setTimeout(() => {
        navigate(redirectTo);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.loginFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="civic-page civic-page--subtle auth-page">
      <article className="panel panel--narrow auth-panel">
        <h1>{t("auth.authorityLogin")}</h1>
        <p>{t("auth.authorityLoginHelp")}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="authority-email">{t("auth.email")}</label>
            <input
              id="authority-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="authority@city.gov"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="authority-password">{t("auth.password")}</label>
            <input
              id="authority-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("auth.passwordPlaceholder")}
              required
            />
          </div>

          {success ? <div className="alert auth-alert auth-alert--success">{success}</div> : null}
          {error ? <div className="alert alert--error">{error}</div> : null}

          <button className="button button--primary auth-submit" type="submit" disabled={saving}>
            {saving ? t("common.submitting") : t("auth.login")}
          </button>
        </form>

        <p className="auth-panel__footer">
          {t("auth.needAuthorityAccount")}{" "}
          <Link to="/authority/register">{t("auth.registerAuthority")}</Link>
        </p>
      </article>
    </section>
  );
}
