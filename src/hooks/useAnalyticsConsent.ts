import { useSyncExternalStore } from "react";
import {
  getAnalyticsConsent,
  subscribeAnalyticsConsent,
} from "../utils/analyticsConsent";

export function useAnalyticsConsent() {
  return useSyncExternalStore(
    subscribeAnalyticsConsent,
    getAnalyticsConsent,
    () => null,
  );
}
