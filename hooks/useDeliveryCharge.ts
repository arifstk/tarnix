// hooks/useDeliveryCharge.ts
// CHANGELOG: Fetches delivery charge from settings API

import { useEffect, useState } from "react";

export function useDeliveryCharge() {
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDeliveryCharge(data.settings.deliveryCharge ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  return { deliveryCharge, loading };
}
