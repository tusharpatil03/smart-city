import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";

export function AuthorityRegisterPage() {
  const { t } = useI18n();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const message = await register(formState);
      setSuccess(message);
      window.setTimeout(() => {
        navigate("/authority/login");
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.registerFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="civic-page civic-page--subtle auth-page">
      <article className="panel panel--narrow auth-panel">
        <h1>{t("auth.registerAuthority")}</h1>
        <p>{t("auth.registerAuthorityHelp")}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="authority-name">{t("auth.name")}</label>
            <input
              id="authority-name"
              type="text"
              value={formState.name}
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              placeholder={t("auth.namePlaceholder")}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="authority-register-email">{t("auth.email")}</label>
            <input
              id="authority-register-email"
              type="email"
              value={formState.email}
              onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
              placeholder="authority@city.gov"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="authority-register-password">{t("auth.password")}</label>
            <input
              id="authority-register-password"
              type="password"
              value={formState.password}
              onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
              placeholder={t("auth.passwordPlaceholder")}
              required
            />
          </div>

          {success ? <div className="alert auth-alert auth-alert--success">{success}</div> : null}
          {error ? <div className="alert alert--error">{error}</div> : null}

          <button className="button button--primary auth-submit" type="submit" disabled={saving}>
            {saving ? t("common.submitting") : t("auth.register")}
          </button>
        </form>

        <p className="auth-panel__footer">
          <Link to="/authority/login">{t("auth.backToLogin")}</Link>
        </p>
      </article>
    </section>
  );
}
