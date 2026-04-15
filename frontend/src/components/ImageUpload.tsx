import { useRef, useState } from "react";
import { Camera, CheckCircle2, CloudUpload } from "lucide-react";
import { useI18n } from "../i18n";

interface ImageUploadProps {
  imageDataUrl: string | null;
  onImageChange: (imageDataUrl: string | null) => void;
}

const MAX_IMAGE_MB = 10;

export function ImageUpload({ imageDataUrl, onImageChange }: ImageUploadProps) {
  const { t } = useI18n();
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const onPickFile = (): void => {
    uploadInputRef.current?.click();
  };

  const onCaptureImage = (): void => {
    captureInputRef.current?.click();
  };

  const handleFile = (file: File): void => {
    if (!file.type.startsWith("image/")) {
      setError(t("imageUpload.invalidType"));
      return;
    }

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(t("imageUpload.invalidSize", { max: MAX_IMAGE_MB }));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const nextValue = String(reader.result ?? "");
      onImageChange(nextValue);
      setFileName(file.name);
      setError(null);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`image-upload ${isDragging ? "image-upload--drag" : ""} ${imageDataUrl ? "image-upload--ready" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];
        if (file) {
          handleFile(file);
        }
      }}
    >
      <input
        ref={uploadInputRef}
        className="image-upload__input"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleFile(file);
          }
          event.currentTarget.value = "";
        }}
      />

      <input
        ref={captureInputRef}
        className="image-upload__input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleFile(file);
          }
          event.currentTarget.value = "";
        }}
      />

      {imageDataUrl ? (
        <div className="image-upload__preview-wrap">
          <img className="image-upload__preview" src={imageDataUrl} alt={t("common.photo")} />
          <span className="image-upload__success">
            <CheckCircle2 size={16} />
            {t("imageUpload.ready")}
          </span>
        </div>
      ) : (
        <div className="image-upload__placeholder">
          <span className="image-upload__icon" aria-hidden="true">
            <CloudUpload size={24} />
          </span>
          <p className="image-upload__title">{t("imageUpload.placeholderTitle")}</p>
          <p className="image-upload__hint">{t("imageUpload.placeholderHint")}</p>
        </div>
      )}

      <div className="image-upload__footer">
        <div className="image-upload__actions">
          <button className="button button--secondary image-upload__btn image-upload__btn--capture" type="button" onClick={onCaptureImage}>
            <Camera size={16} />
            <span>{t("common.capture")}</span>
          </button>
          <button className="button button--primary image-upload__btn image-upload__btn--upload" type="button" onClick={onPickFile}>
            <CloudUpload size={16} />
            <span>{t("common.upload")}</span>
          </button>
        </div>

        <div className="image-upload__meta">
          <p>{fileName ? t("imageUpload.fileName", { name: fileName }) : t("imageUpload.noFile")}</p>
        </div>

        {imageDataUrl ? (
          <button
            className="button button--secondary image-upload__btn image-upload__btn--reset"
            type="button"
            onClick={() => {
              onImageChange(null);
              setFileName("");
              setError(null);
            }}
          >
            {t("imageUpload.reset")}
          </button>
        ) : null}
      </div>

      {error ? <p className="capture-error">{error}</p> : null}
    </div>
  );
}
