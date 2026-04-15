import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPicker } from "../components/MapPicker";
import { useIssues } from "../hooks/useIssues";

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  latitude: "",
  longitude: ""
};

export function CreateIssuePage() {
  const navigate = useNavigate();
  const { createIssue, saving, error, clearError } = useIssues();
  const [formState, setFormState] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const updateField = (field: keyof typeof emptyForm, value: string): void => {
    setFormState((currentState) => ({ ...currentState, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    clearError();
    setFormError(null);

    const latitude = Number(formState.latitude);
    const longitude = Number(formState.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setFormError("Latitude and longitude must be valid numbers.");
      return;
    }

    try {
      const createdIssue = await createIssue({
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        image_url: formState.imageUrl.trim() || undefined,
        latitude,
        longitude
      });

      navigate(`/issues/${createdIssue._id}`);
    } catch {
      // The hook already stores the error message.
    }
  };

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Create issue</p>
          <h1>Report a geotagged issue</h1>
        </div>
      </div>

      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formState.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Broken streetlight"
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
            placeholder="Describe what happened and any useful context."
            rows={5}
          />
        </div>

        <MapPicker
          latitude={formState.latitude}
          longitude={formState.longitude}
          onLatitudeChange={(value) => updateField("latitude", value)}
          onLongitudeChange={(value) => updateField("longitude", value)}
        />

        <div className="field-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={formState.imageUrl}
            onChange={(event) => updateField("imageUrl", event.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        {formError !== null ? <div className="alert alert--error">{formError}</div> : null}
        {error !== null ? <div className="alert alert--error">{error}</div> : null}

        <div className="form-actions">
          <button className="button button--primary" type="submit" disabled={saving}>
            {saving ? "Submitting..." : "Create issue"}
          </button>
        </div>
      </form>
    </section>
  );
}
