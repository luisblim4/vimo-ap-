import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

type Device = {
  id: string;
  name: string;
  api_key: string;
  online: boolean;
  last_seen: string | null;
  created_at: string;
  last_lat?: number | null;
  last_lon?: number | null;
  last_state?: string | null;
};

interface DeviceCtx {
  devices: Device[];
  activeDeviceId: string | null;
  setActiveDeviceId: (id: string | null) => void;
  refresh: () => Promise<void>;
  loading: boolean;
}

const Ctx = createContext<DeviceCtx | undefined>(undefined);

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await api.listDevices();
      setDevices(list);
      setActiveDeviceId((prev) => {
        if (prev && list.find((d: Device) => d.id === prev)) return prev;
        return list[0]?.id ?? null;
      });
    } catch (error) {
      console.log("Modo offline detectado, no se pudieron cargar dispositivos físicos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <Ctx.Provider value={{ devices, activeDeviceId, setActiveDeviceId, refresh, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDevices() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDevices must be used inside DeviceProvider");
  return v;
}
