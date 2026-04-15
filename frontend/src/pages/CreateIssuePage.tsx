import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CapturePhoto } from "../components/CapturePhoto";
import type { CaptureResult } from "../components/CapturePhoto";
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

type PhotoMode = "capture" | "upload";

export function CreateIssuePage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    category: "" as CivicIssueCategory | ""
  });
  const [photoMode, setPhotoMode] = useState<PhotoMode>("capture");
  const [capturedPhoto, setCapturedPhoto] = useState<CaptureResult | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof typeof formState, value: string): void => {
    setFormState((currentState) => ({ ...currentState, [field]: value }));
  };

  const effectiveImage = useMemo(() => capturedPhoto?.imageDataUrl ?? uploadPreview, [capturedPhoto, uploadPreview]);
  const effectiveLocation = useMemo<[number, number] | null>(() => {
    if (capturedPhoto) {
      return [capturedPhoto.latitude, capturedPhoto.longitude];
    }

    return selectedLocation;
  }, [capturedPhoto, selectedLocation]);

  const detectLocation = (): void => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
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
        setError("Unable to detect location. Select it manually on the map.");
        setDetectingLocation(false);
      }
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (!effectiveLocation) {
      setError("Please capture or select a location before submitting.");
      return;
    }

    if (!formState.category) {
      setError("Please choose a category.");
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
      setError(err instanceof Error ? err.message : "Failed to submit issue.");
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <section className="civic-page civic-page--subtle report-success">
        <article className="panel panel--narrow">
          <h1>Issue Reported</h1>
          <p>Thanks for helping improve the city. Redirecting to issues list...</p>
        </article>
      </section>
    );
  }

  return (
    <section className="civic-page civic-page--subtle">
      <header className="report-header">
        <h1>Report an Issue</h1>
        <p>Help your city teams respond faster by submitting clear details and location.</p>
      </header>

      <form className="report-form" onSubmit={handleSubmit}>
        <article className="panel">
          <h2>Issue Details</h2>

          <div className="field-group">
            <label htmlFor="title">Issue Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formState.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Large pothole on Main Street"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Describe what you observed and any hazards..."
              rows={4}
              required
            />
          </div>

          <div className="field-group">
            <label>Category</label>
            <div className="category-grid">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={formState.category === category ? "active" : ""}
                  onClick={() => updateField("category", category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="photo-header">
            <h2>Photo</h2>
            <div className="mode-toggle" role="tablist" aria-label="Photo mode">
              <button
                type="button"
                className={photoMode === "capture" ? "active" : ""}
                onClick={() => {
                  setPhotoMode("capture");
                  setUploadPreview(null);
                }}
              >
                Capture
              </button>
              <button
                type="button"
                className={photoMode === "upload" ? "active" : ""}
                onClick={() => {
                  setPhotoMode("upload");
                  setCapturedPhoto(null);
                }}
              >
                Upload
              </button>
            </div>
          </div>

          {photoMode === "capture" ? (
            <CapturePhoto
              captured={capturedPhoto}
              onCapture={(result) => {
                setCapturedPhoto(result);
                setSelectedLocation([result.latitude, result.longitude]);
              }}
              onClear={() => setCapturedPhoto(null)}
            />
          ) : (
            <div className="upload-box">
              {uploadPreview ? <img src={uploadPreview} alt="Upload preview" /> : <p>Select an image</p>}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  const reader = new FileReader();
                  reader.onload = () => setUploadPreview(String(reader.result ?? ""));
                  reader.readAsDataURL(file);
                }}
              />
            </div>
          )}
        </article>

        <article className="panel">
          <h2>Location</h2>
          <button className="button button--ghost" type="button" onClick={detectLocation} disabled={detectingLocation}>
            {detectingLocation ? "Detecting..." : "Detect My Location"}
          </button>

          {effectiveLocation ? (
            <p className="field-help">
              Location set: {effectiveLocation[0].toFixed(5)}, {effectiveLocation[1].toFixed(5)}
            </p>
          ) : null}

          <div className="report-map">
            <MapView
              issues={[]}
              center={effectiveLocation ?? [40.7128, -74.006]}
              zoom={effectiveLocation ? 16 : 13}
              height="260px"
              onLocationSelect={(lat, lng) => {
                setSelectedLocation([lat, lng]);
                if (capturedPhoto) {
                  setCapturedPhoto({ ...capturedPhoto, latitude: lat, longitude: lng });
                }
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
            Cancel
          </button>
          <button
            className="button button--primary"
            type="submit"
            disabled={saving}
          >
            {saving ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </section>
  );
}
