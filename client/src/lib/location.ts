import { LocationCoordinates } from "@/types";

// Get current location with browser's geolocation API
export async function getCurrentLocation(): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("User denied the request for geolocation."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable."));
            break;
          case error.TIMEOUT:
            reject(new Error("The request to get user location timed out."));
            break;
          default:
            reject(new Error("An unknown error occurred."));
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
}

// Calculate distance between two coordinates in miles (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

// Format coordinates for display
export function formatCoordinates(coordinates: LocationCoordinates): string {
  const { latitude, longitude } = coordinates;
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

// Get formatted address from coordinates using reverse geocoding
export async function getAddressFromCoordinates(
  coordinates: LocationCoordinates
): Promise<string | null> {
  try {
    // For a production app, you would use a proper geocoding service
    // This is a placeholder to demonstrate the concept
    return "Current location";
  } catch (error) {
    console.error("Error getting address:", error);
    return null;
  }
}
