export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("zoom", "10");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "smart-city-civic-app/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`Reverse geocode failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      address?: {
        city?: string;
        town?: string;
        village?: string;
        state_district?: string;
        county?: string;
        state?: string;
        country?: string;
      };
      display_name?: string;
    };

    const cityLike =
      payload.address?.city ??
      payload.address?.town ??
      payload.address?.village ??
      payload.address?.state_district ??
      payload.address?.county;

    if (cityLike && payload.address?.state) {
      return `${cityLike}, ${payload.address.state}`;
    }

    if (cityLike) {
      return cityLike;
    }

    if (payload.display_name && payload.display_name.trim().length > 0) {
      return payload.display_name.split(",").slice(0, 2).join(",").trim();
    }
  } catch {
    // Fall back to a readable label when reverse geocoding is unavailable.
  }

  return `Selected location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
};
