import { useEffect, useState } from "react";

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: object) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Polygon: new (options: object) => KakaoPolygon;
        CustomOverlay: new (options: object) => KakaoOverlay;
        event: {
          addListener: (target: object, type: string, handler: () => void) => void;
        };
      };
    };
  }
}

interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void;
}

interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

interface KakaoPolygon {
  setMap: (map: KakaoMap | null) => void;
}

interface KakaoOverlay {
  setMap: (map: KakaoMap | null) => void;
}

type LoadState = "idle" | "loading" | "ready" | "error";

let globalState: LoadState = "idle";
const listeners: Array<(state: LoadState) => void> = [];

function notifyListeners(state: LoadState) {
  globalState = state;
  listeners.forEach((fn) => fn(state));
}

export function useKakaoMap() {
  const [state, setState] = useState<LoadState>(globalState);

  useEffect(() => {
    const handler = (s: LoadState) => setState(s);
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  useEffect(() => {
    if (globalState !== "idle") return;

    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY as string | undefined;
    if (!apiKey) {
      notifyListeners("error");
      return;
    }

    notifyListeners("loading");

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      try {
        window.kakao.maps.load(() => {
          notifyListeners("ready");
        });
      } catch {
        notifyListeners("error");
      }
    };

    script.onerror = () => {
      notifyListeners("error");
    };

    document.head.appendChild(script);
  }, []);

  return state;
}
