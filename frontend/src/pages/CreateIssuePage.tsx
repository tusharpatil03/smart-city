import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageUpload } from "../components/ImageUpload";
import { useI18n } from "../i18n";
import { MapView } from "../components/MapView";
import { civicApi } from "../services/api";
import type { CivicIssueCategory } from "../services/api";

const CATEGORIES: CivicIssueCategory[] = [
  "Pothole",
  "Garbage",
  "Streetlight",
  "Flooding",
  "Graffiti",
  "Road Damage",
  "Other"
];

export function CreateIssuePage() {
  const { t, translateCategory } = useI18n();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    category: "" as CivicIssueCategory | ""
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
  const [loadingLocationName, setLoadingLocationName] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof typeof formState, value: string): void => {
    setFormState((currentState) => ({ ...currentState, [field]: value }));
  };

  const effectiveImage = useMemo(() => uploadedImage, [uploadedImage]);
  const effectiveLocation = useMemo<[number, number] | null>(() => selectedLocation, [selectedLocation]);

  useEffect(() => {
    if (!effectiveLocation) {
      setSelectedLocationName(null);
      setLoadingLocationName(false);
      return;
    }

    let active = true;
    const [latitude, longitude] = effectiveLocation;

    setLoadingLocationName(true);

    civicApi
      .getLocationPreview(latitude, longitude)
      .then((address) => {
        if (!active) {
          return;
        }

        setSelectedLocationName(address);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setSelectedLocationName(null);
      })
      .finally(() => {
        if (!active) {
          return;
        }

        setLoadingLocationName(false);
      });

    return () => {
      active = false;
    };
  }, [effectiveLocation]);

  const detectLocation = (): void => {
    if (!navigator.geolocation) {
      setError(t("errors.geolocationUnsupported"));
      return;
    }

    setDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedLocation([position.coords.latitude, position.coords.longitude]);
        setDetectingLocation(false);
      },
      () => {
        setError(t("errors.detectLocationFailed"));
        setDetectingLocation(false);
      }
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (!effectiveLocation) {
      setError(t("errors.locationRequired"));
      return;
    }

    if (!formState.category) {
      setError(t("errors.categoryRequired"));
      return;
    }

    const [latitude, longitude] = effectiveLocation;
    setSaving(true);

    try {
      await civicApi.createReport({
        title: formState.title.trim(),
        description: formState.description.trim(),
        category: formState.category,
        latitude,
        longitude,
        image: effectiveImage ?? null
      });

      setSubmitted(true);
      setTimeout(() => navigate("/issues"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.submitIssueFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <section className="civic-page civic-page--subtle report-success">
        <article className="panel panel--narrow">
          <h1>{t("create.successTitle")}</h1>
          <p>{t("create.successMessage")}</p>
        </article>
      </section>
    );
  }

  return (
    <section className="civic-page civic-page--subtle">
      <header className="report-header">
        <h1>{t("create.pageTitle")}</h1>
        <p>{t("create.pageSubtitle")}</p>
      </header>

      <form className="report-form" onSubmit={handleSubmit}>
        <article className="panel">
          <h2>{t("create.issueDetails")}</h2>

          <div className="field-group">
            <label htmlFor="title">{t("create.issueTitle")}</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formState.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder={t("create.issueTitlePlaceholder")}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="description">{t("common.description")}</label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder={t("create.descriptionPlaceholder")}
              rows={4}
              required
            />
          </div>

          <div className="field-group">
            <label>{t("common.category")}</label>
            <div className="category-grid">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={formState.category === category ? "active" : ""}
                  onClick={() => updateField("category", category)}
                >
                  {translateCategory(category)}
                </button>
              ))}
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="photo-header">
            <h2>{t("common.photo")}</h2>
          </div>
          <p className="field-help">{t("create.photoOptionsHelp")}</p>

          <ImageUpload
            imageDataUrl={uploadedImage}
            onImageChange={(imageDataUrl) => {
              setUploadedImage(imageDataUrl);
            }}
          />
        </article>

        <article className="panel">
          <h2>{t("common.location")}</h2>

          {effectiveLocation ? (
            <p className="field-help">
              {loadingLocationName
                ? t("create.resolvingLocation")
                : selectedLocationName ?? t("create.locationUnavailable")}
            </p>
          ) : null}

          <div className="report-map">
            <button
              className="button button--primary report-map__capture-btn"
              type="button"
              onClick={detectLocation}
              disabled={detectingLocation}
            >
              {detectingLocation ? t("common.detecting") : t("common.captureLocation")}
            </button>

            <MapView
              issues={[]}
              center={effectiveLocation ?? [40.7128, -74.006]}
              zoom={effectiveLocation ? 16 : 13}
              height="260px"
              onLocationSelect={(lat, lng) => {
                setSelectedLocation([lat, lng]);
              }}
              selectedLocation={effectiveLocation}
            />
          </div>
        </article>

        {error !== null ? <div className="alert alert--error">{error}</div> : null}

        <div className="report-actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={() => {
              navigate("/");
            }}
          >
            {t("common.cancel")}
          </button>
          <button
            className="button button--primary"
            type="submit"
            disabled={saving}
          >
            {saving ? t("common.submitting") : t("common.submitReport")}
          </button>
        </div>
      </form>
    </section>
  );
}
