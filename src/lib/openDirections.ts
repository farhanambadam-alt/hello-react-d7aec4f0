/**
 * Bridge-aware directions launcher.
 *
 * CONTRACT (single source of truth):
 *   Handler name: "openDirections"
 *   Payload:      { lat: number, lng: number, address: string }
 *
 * Behaviour:
 *   Flutter → calls native handler → opens Google Maps app / browser fallback
 *   Browser → opens Google Maps in a new tab
 */

interface DirectionsPayload {
  lat: number;
  lng: number;
  address: string;
}

export function openDirections(payload: DirectionsPayload): void {
  const { lat, lng, address } = payload;
  const isFlutter = !!(window as any).flutter_inappwebview;

  console.log('[MAP] Directions clicked', { lat, lng, address });
  console.log(`[MAP] Environment: ${isFlutter ? 'Flutter' : 'Browser'}`);

  if (isFlutter) {
    console.log('[MAP] Sending to Flutter bridge → openDirections');
    (window as any).flutter_inappwebview.callHandler('openDirections', {
      lat,
      lng,
      address,
    });
    return;
  }

  // Browser fallback
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  console.log('[MAP] Opening browser maps', url);
  window.open(url, '_blank');
}
