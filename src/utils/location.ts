
interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

const LOCATION_STORAGE_KEY = 'userLocation';
const LOCATION_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

export const getStoredLocation = (): LocationData | null => {
  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!stored) return null;
    
    const data: LocationData = JSON.parse(stored);
    const now = Date.now();
    
    // Check if location is expired (older than 30 minutes)
    if (now - data.timestamp > LOCATION_EXPIRY_TIME) {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting stored location:', error);
    return null;
  }
};

export const storeLocation = (lat: number, lng: number, accuracy: number): void => {
  try {
    const locationData: LocationData = {
      lat,
      lng,
      accuracy,
      timestamp: Date.now()
    };
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
  } catch (error) {
    console.error('Error storing location:', error);
  }
};

export const requestUserLocation = (): Promise<{ lat: number; lng: number; accuracy: number }> => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // First check stored location
    const stored = getStoredLocation();
    if (stored && stored.accuracy <= 20) {
      resolve({ lat: stored.lat, lng: stored.lng, accuracy: stored.accuracy });
      return;
    }

    // Request high accuracy location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Only accept high accuracy locations (≤ 20 meters)
        if (accuracy <= 20) {
          storeLocation(latitude, longitude, accuracy);
          resolve({ lat: latitude, lng: longitude, accuracy });
        } else {
          // Try again with high accuracy if first attempt wasn't accurate enough
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude: lat2, longitude: lng2, accuracy: acc2 } = pos.coords;
              storeLocation(lat2, lng2, acc2);
              resolve({ lat: lat2, lng: lng2, accuracy: acc2 });
            },
            (error) => reject(error),
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0
            }
          );
        }
      },
      (error) => {
        // If error, try to use stored location even if not very recent
        const stored = getStoredLocation();
        if (stored) {
          resolve({ lat: stored.lat, lng: stored.lng, accuracy: stored.accuracy });
        } else {
          reject(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

export const clearStoredLocation = (): void => {
  localStorage.removeItem(LOCATION_STORAGE_KEY);
};
