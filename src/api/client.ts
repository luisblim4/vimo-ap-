import { getToken } from "../utils/token";

const BASE = (process.env.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");

async function request<T = any>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (auth) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/api${path}`, { ...options, headers });
  const text = await res.text();
  let data: any = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!res.ok) {
    const detail = data?.detail || data || `HTTP ${res.status}`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data as T;
}

let mockAlerts = [
  {
    id: "alt_fkkumbo",
    device_id: "dev_fkkumbo",
    device_name: "VIMO S3",
    status: "active" as "active" | "acknowledged" | "resolved",
    summary: "El VIMO S3 ha reportado una alerta de emergencia local debido a una simulación de botón de pánico.",
    lat: 32.515,
    lon: -117.039,
    location_label: "Tijuana, BC",
    google_maps_url: "https://maps.google.com/?q=32.515,-117.039",
    trigger_text: "PANIC_BUTTON_PRESSED",
    created_at: new Date().toISOString(),
    dispatched_911: true,
    dispatch_status: "Modo simulación local activo",
    incident_id: "VMO-991"
  }
];

let mockDevices = [
  {
    id: "dev_fkkumbo",
    name: "VIMO S3",
    api_key: "mock-key-123",
    online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
    last_lat: 32.515,
    last_lon: -117.039,
    last_state: "IDLE"
  }
];

let mockHazards = [
  {
    id: "haz_1",
    device_id: "dev_fkkumbo",
    tipo_alerta: "bache",
    descripcion: "Bache reportado en Vía Rápida",
    latitud: 32.5155,
    longitud: -117.0395,
    created_at: new Date().toISOString()
  }
];

let mockEvents = [
  { id: "evt_1", type: "info", text: "VIMO S3 sincronizado localmente", created_at: new Date().toISOString() },
  { id: "evt_2", type: "bache", text: "Bache detectado a 50m", created_at: new Date(Date.now() - 60000).toISOString(), meta: { tipo_alerta: "bache" } }
];

export const api = {
  register: (email: string, password: string) => {
    if (!BASE) return Promise.resolve();
    return request("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }, false);
  },
  login: (email: string, password: string) => {
    if (!BASE) return Promise.resolve({ access_token: "mock-token" });
    return request<{ access_token: string }>("/auth/login", {
      method: "POST", body: JSON.stringify({ email, password }),
    }, false);
  },
  me: () => {
    if (!BASE) return Promise.resolve({ id: "local", email: "mock@vimo.com" });
    return request<{ id: string; email: string }>("/auth/me");
  },

  listDevices: () => {
    if (!BASE) return Promise.resolve(mockDevices);
    return request<any[]>("/devices");
  },
  createDevice: (name: string) => {
    if (!BASE) {
      const d = {
        id: `dev_${Math.random().toString(36).substring(2, 9)}`,
        name: name.trim() || "VIMO S3",
        api_key: "mock-key-123",
        online: true,
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
        last_lat: 32.515,
        last_lon: -117.039,
        last_state: "IDLE"
      };
      mockDevices.push(d);
      return Promise.resolve(d);
    }
    return request<any>("/devices", { method: "POST", body: JSON.stringify({ name }) });
  },
  deleteDevice: (id: string) => {
    if (!BASE) {
      mockDevices = mockDevices.filter(d => d.id !== id);
      return Promise.resolve({ success: true });
    }
    return request(`/devices/${id}`, { method: "DELETE" });
  },

  getStatus: (id: string) => {
    if (!BASE) {
      const dev = mockDevices.find(d => d.id === id);
      return Promise.resolve({
        id,
        lat: dev?.last_lat ?? 32.515,
        lon: dev?.last_lon ?? -117.039,
        state: dev?.last_state ?? "IDLE"
      });
    }
    return request<any>(`/devices/${id}/status`);
  },
  getEvents: (id: string, limit = 100) => {
    if (!BASE) return Promise.resolve(mockEvents.slice(0, limit));
    return request<any[]>(`/devices/${id}/events?limit=${limit}`);
  },
  enqueueCommand: (id: string, type: string, payload?: any) => {
    if (!BASE) {
      const newEv = {
        id: `evt_${Date.now()}`,
        type: type === "PANIC" ? "emergency" : "info",
        text: `Comando enviado: ${type} ${payload ? JSON.stringify(payload) : ""}`,
        created_at: new Date().toISOString()
      };
      mockEvents.unshift(newEv);
      
      if (type === "PANIC" || type === "emergencia") {
        const dev = mockDevices.find(d => d.id === id);
        if (dev) dev.last_state = "EMERGENCIA";
        
        const hasAlert = mockAlerts.some(a => a.device_id === id && a.status === "active");
        if (!hasAlert) {
          mockAlerts.unshift({
            id: `alt_${Date.now()}`,
            device_id: id,
            device_name: dev?.name || "VIMO S3",
            status: "active" as const,
            summary: "El botón de pánico de la app ha activado una simulación de emergencia local.",
            lat: dev?.last_lat ?? 32.515,
            lon: dev?.last_lon ?? -117.039,
            location_label: "Tijuana, BC",
            google_maps_url: `https://maps.google.com/?q=${dev?.last_lat ?? 32.515},${dev?.last_lon ?? -117.039}`,
            trigger_text: "APP_PANIC_TRIGGERED",
            created_at: new Date().toISOString(),
            dispatched_911: true,
            dispatch_status: "Modo simulación local activo",
            incident_id: `VMO-${Math.floor(100 + Math.random() * 900)}`
          });
        }
      }
      return Promise.resolve({ success: true });
    }
    return request(`/devices/${id}/commands`, { method: "POST", body: JSON.stringify({ type, payload }) });
  },

  listAlerts: (onlyActive = false) => {
    if (!BASE) {
      if (onlyActive) {
        return Promise.resolve(mockAlerts.filter(a => a.status === "active"));
      }
      return Promise.resolve(mockAlerts);
    }
    return request<any[]>(`/alerts?only_active=${onlyActive}`);
  },
  getAlert: (id: string) => {
    if (!BASE) {
      const a = mockAlerts.find(x => x.id === id);
      if (!a) return Promise.reject(new Error("Alert not found"));
      return Promise.resolve(a);
    }
    return request<any>(`/alerts/${id}`);
  },
  acknowledgeAlert: (id: string) => {
    if (!BASE) {
      const a = mockAlerts.find(x => x.id === id);
      if (!a) return Promise.reject(new Error("Alert not found"));
      a.status = "acknowledged";
      return Promise.resolve(a);
    }
    return request<any>(`/alerts/${id}/acknowledge`, { method: "POST" });
  },
  resolveAlert: (id: string) => {
    if (!BASE) {
      const a = mockAlerts.find(x => x.id === id);
      if (!a) return Promise.reject(new Error("Alert not found"));
      a.status = "resolved";
      const dev = mockDevices.find(d => d.id === a.device_id);
      if (dev) dev.last_state = "IDLE";
      return Promise.resolve(a);
    }
    return request<any>(`/alerts/${id}/resolve`, { method: "POST" });
  },

  listHazards: () => {
    if (!BASE) return Promise.resolve(mockHazards);
    return request<any[]>("/hazards");
  },
  deleteHazard: (id: string) => {
    if (!BASE) {
      mockHazards = mockHazards.filter(h => h.id !== id);
      return Promise.resolve({ success: true });
    }
    return request(`/hazards/${id}`, { method: "DELETE" });
  },

  getDeviceProfile: (id: string) => {
    if (!BASE) return Promise.resolve({ id, sensitivity: "high", speed_limit: 80, notification_enabled: true });
    return request<any>(`/devices/${id}/profile`);
  },
  upsertDeviceProfile: (id: string, profile: any) => {
    if (!BASE) return Promise.resolve(profile);
    return request<any>(`/devices/${id}/profile`, { method: "PUT", body: JSON.stringify(profile) });
  },

  registerPush: (platform: "android" | "ios" | "web", token: string) => {
    if (!BASE) return Promise.resolve({ success: true });
    return request("/register-push", { method: "POST", body: JSON.stringify({ platform, device_token: token }) });
  },
};

export { BASE as API_BASE };
