import { useEffect, useState } from 'react';
import type { LocationObjectCoords } from 'expo-location';
import * as Location from 'expo-location';

export function useLocation() {
  const [coords, setCoords] = useState<LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('位置情報の利用が許可されていません。設定から許可してください。');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoords(location.coords);
      setLoading(false);
    })().catch((e) => {
      setError(e instanceof Error ? e.message : '現在地を取得できませんでした。位置情報設定をご確認ください。');
      setLoading(false);
    });
  }, []);

  return { coords, loading, error };
}
