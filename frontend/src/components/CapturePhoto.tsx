import { useRef, useState } from "react";

export interface CaptureResult {
  imageDataUrl: string;
  latitude: number;
  longitude: number;
}

interface CapturePhotoProps {
  captured: CaptureResult | null;
  onCapture: (result: CaptureResult) => void;
  onClear: () => void;
}

export function CapturePhoto({ captured, onCapture, onClear }: CapturePhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (file: File): void => {
    const reader = new FileReader();

    reader.onload = () => {
      const imageDataUrl = String(reader.result ?? "");
      setLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        setLoading(false);
        setError("Geolocation is not available in this browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          onCapture({
            imageDataUrl,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          setLoading(false);
          setError("Could not read location. Enable GPS permissions and retry.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="capture-box">
      {captured ? (
        <div className="capture-preview">
          <img src={captured.imageDataUrl} alt="Captured issue" />
          <div className="capture-preview__meta">
            {captured.latitude.toFixed(5)}, {captured.longitude.toFixed(5)}
          </div>
          <button type="button" className="button button--secondary" onClick={onClear}>
            Retake
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="button button--primary"
            onClick={() => inputRef.current?.click()}
          >
            Capture Photo
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="capture-input"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleCapture(file);
              }
              event.currentTarget.value = "";
            }}
          />
          {loading ? <p className="field-help">Fetching GPS coordinates...</p> : null}
          {error ? <p className="capture-error">{error}</p> : null}
        </>
      )}
    </div>
  );
}
