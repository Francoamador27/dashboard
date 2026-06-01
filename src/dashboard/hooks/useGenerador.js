import { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

function toFormData(data) {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => fd.append(`${key}[]`, v));
    } else {
      fd.append(key, value); // handles File, string, number
    }
  });
  return fd;
}

export function useGenerar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/generar', toFormData(data)).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

/**
 * With QUEUE_CONNECTION=sync the backend returns assets already completed.
 * startPolling receives the initial assets from the POST response.
 * If all are done immediately, no interval is needed.
 */
export function useGeneracionStatus() {
  const [assets, setAssets] = useState([]);
  const [polling, setPolling] = useState(false);
  const intervalRef = useRef(null);
  const qc = useQueryClient();

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPolling(false);
    qc.invalidateQueries({ queryKey: ['assets'] });
  }, [qc]);

  const startPolling = useCallback((generacionId, initialAssets = []) => {
    setAssets(initialAssets);

    const allDone = (list) => list.every((a) => a.status === 'completed' || a.status === 'failed');

    // If backend already returned completed assets (sync mode), don't poll
    if (allDone(initialAssets)) {
      qc.invalidateQueries({ queryKey: ['assets'] });
      return;
    }

    setPolling(true);

    const poll = async () => {
      try {
        const { data } = await api.get(`/generar/status/${generacionId}`);
        setAssets(data.assets ?? []);
        if (data.done) stopPolling();
      } catch {
        stopPolling();
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);
  }, [stopPolling, qc]);

  return { assets, polling, startPolling, stopPolling };
}
