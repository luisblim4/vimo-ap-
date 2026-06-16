import React, { useMemo } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { WebView } from "react-native-webview";

export type MapMarker = {
  id: string;
  lat: number;
  lon: number;
  tipo: "device" | "device_emergency" | "bache" | "tronco" | "choque" | "obstaculo" | "emergencia" | "otro";
  title: string;
  subtitle?: string;
};

// Color + symbol per type (jerarquía visual)
const TYPE_STYLES: Record<MapMarker["tipo"], { color: string; label: string; symbol: string }> = {
  device:            { color: "#FF5E00", label: "VIMO",       symbol: "V" },
  device_emergency:  { color: "#EF4444", label: "EMERGENCIA", symbol: "!" },
  emergencia:        { color: "#EF4444", label: "Emergencia", symbol: "🚨" },
  bache:             { color: "#F59E0B", label: "Bache",      symbol: "⚠" },
  tronco:            { color: "#22C55E", label: "Tronco",     symbol: "🪵" },
  choque:            { color: "#EF4444", label: "Choque",     symbol: "🚗" },
  obstaculo:         { color: "#F59E0B", label: "Obstáculo",  symbol: "⛔" },
  otro:              { color: "#A0A5B1", label: "Otro",       symbol: "•" },
};

function buildHtml(initialLat: number, initialLon: number, markers: MapMarker[], autoZoom: boolean) {
  const safeMarkers = markers.map((m) => ({
    id: m.id, lat: m.lat, lon: m.lon, tipo: m.tipo,
    title: (m.title || "").replace(/'/g, "\\'").replace(/</g, "&lt;"),
    subtitle: (m.subtitle || "").replace(/'/g, "\\'").replace(/</g, "&lt;"),
    color: TYPE_STYLES[m.tipo]?.color || "#FF5E00",
    label: TYPE_STYLES[m.tipo]?.label || "Pin",
    symbol: TYPE_STYLES[m.tipo]?.symbol || "•",
  }));
  return `<!doctype html>
<html><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height:100%; margin:0; padding:0; background:#0C0D0F; }
  .leaflet-popup-content-wrapper { background:#15171A; color:#F2F3F5; border-radius:8px; }
  .leaflet-popup-tip { background:#15171A; }
  .leaflet-control-attribution { font-size:9px; opacity:.5; }
  .leaflet-tile-pane { filter: brightness(.95) saturate(.9); }
  .pin { width:30px; height:30px; border-radius:50%; border:3px solid #0C0D0F;
         box-shadow:0 1px 4px rgba(0,0,0,.5); display:flex; align-items:center;
         justify-content:center; font-family:sans-serif; color:#fff; font-size:14px; font-weight:700; }
  .pin .sym { line-height:1; }
  .pulse { animation: pulse 1.4s infinite; }
  @keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(239,68,68,0.85);} 70%{box-shadow:0 0 0 20px rgba(239,68,68,0);} 100%{box-shadow:0 0 0 0 rgba(239,68,68,0);} }
</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const map = L.map('map', { zoomControl: true, attributionControl: true }).setView([${initialLat}, ${initialLon}], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OSM' }).addTo(map);

  const markers = ${JSON.stringify(safeMarkers)};
  const layer = L.featureGroup().addTo(map);
  markers.forEach(m => {
    const isEmergency = m.tipo === 'device_emergency' || m.tipo === 'emergencia' || m.tipo === 'choque';
    const icon = L.divIcon({
      className: '',
      html: '<div class="pin ' + (isEmergency ? 'pulse' : '') + '" style="background:' + m.color + '"><span class="sym">' + m.symbol + '</span></div>',
      iconSize: [30, 30], iconAnchor: [15, 15]
    });
    const mk = L.marker([m.lat, m.lon], { icon }).addTo(layer);
    mk.bindPopup('<b style="color:' + m.color + '">' + m.label + '</b><br/>' + m.title + (m.subtitle ? '<br/><span style="color:#A0A5B1;font-size:12px">' + m.subtitle + '</span>' : ''));
    mk.on('click', () => {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'marker_tap', id: m.id }));
    });
  });

  if (${autoZoom ? "true" : "false"} && markers.length > 1) {
    map.fitBounds(layer.getBounds().pad(0.25));
  } else if (markers.length === 1) {
    map.setView([markers[0].lat, markers[0].lon], 16);
  }
</script>
</body></html>`;
}

export default function VimoMapView({
  centerLat = 32.5149,
  centerLon = -117.0382,
  markers = [],
  autoZoom = true,
  onMarkerTap,
  style,
}: {
  centerLat?: number;
  centerLon?: number;
  markers?: MapMarker[];
  autoZoom?: boolean;
  onMarkerTap?: (id: string) => void;
  style?: any;
}) {
  // Re-mount when markers change (key) — guarantees pins refresh in real-time
  const cacheKey = useMemo(
    () => `${centerLat.toFixed(4)}-${centerLon.toFixed(4)}-${markers.length}-${markers.map((m) => m.id + m.tipo).join(",").slice(0, 80)}`,
    [centerLat, centerLon, markers]
  );

  const html = buildHtml(centerLat, centerLon, markers, autoZoom);

  if (Platform.OS === "web") {
    return (
      <View style={[styles.wrap, style]}>
        <iframe
          key={cacheKey}
          srcDoc={html}
          style={{ width: "100%", height: "100%", border: 0, backgroundColor: "#0C0D0F" }}
          title="VIMO Map"
        />
      </View>
    );
  }
  return (
    <View style={[styles.wrap, style]}>
      <WebView
        key={cacheKey}
        originWhitelist={["*"]}
        source={{ html }}
        style={{ backgroundColor: "#0C0D0F" }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(e) => {
          try {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.type === "marker_tap" && onMarkerTap) onMarkerTap(data.id);
          } catch {}
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, overflow: "hidden", backgroundColor: "#0C0D0F" },
});
