interface MapPickerProps {
  latitude: string;
  longitude: string;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
}

export function MapPicker({ latitude, longitude, onLatitudeChange, onLongitudeChange }: MapPickerProps) {
  return (
    <section className="map-picker" aria-label="Location picker">
      <div className="field-group">
        <label htmlFor="latitude">Latitude</label>
        <input
          id="latitude"
          name="latitude"
          type="number"
          step="any"
          inputMode="decimal"
          value={latitude}
          onChange={(event) => onLatitudeChange(event.target.value)}
          placeholder="e.g. 40.7128"
        />
      </div>

      <div className="field-group">
        <label htmlFor="longitude">Longitude</label>
        <input
          id="longitude"
          name="longitude"
          type="number"
          step="any"
          inputMode="decimal"
          value={longitude}
          onChange={(event) => onLongitudeChange(event.target.value)}
          placeholder="e.g. -74.0060"
        />
      </div>

      <p className="map-picker__hint">Simple coordinate input for the MVP. A real map can be added later.</p>
    </section>
  );
}
