import { useEffect, useState } from "react";

const PAYSTACK_SCRIPT_URL = "https://js.paystack.co/v1/inline.js";
const SCRIPT_ID = "paystack-inline-script";

/**
 * Loads the Paystack inline.js v1 script once and exposes a reliable
 * `openPaystack(config)` helper together with a `ready` flag.
 *
 * config fields: key, email, amount (kobo), currency, ref,
 *                callback(response), onClose()
 */
export function usePaystack() {
  const [ready, setReady] = useState(() => typeof window.PaystackPop !== "undefined");

  useEffect(() => {
    // Already available — nothing to do.
    if (window.PaystackPop) {
      setReady(true);
      return;
    }

    let script = document.getElementById(SCRIPT_ID);
    const isNew = !script;

    if (isNew) {
      script = document.createElement("script");
      script.src = PAYSTACK_SCRIPT_URL;
      script.id = SCRIPT_ID;
      script.async = true;
      document.body.appendChild(script);
    }

    const onLoad = () => setReady(true);
    const onError = () => console.error("[usePaystack] Failed to load Paystack script.");

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
  }, []);

  /**
   * Opens the Paystack payment popup.
   * Returns an object with status information instead of throwing.
   */
  function openPaystack(config) {
    if (!window.PaystackPop || typeof window.PaystackPop.setup !== "function") {
      return { opened: false, reason: "not_ready" };
    }

    const normalizedConfig = {
      ...config,
      ref: config?.ref || config?.reference,
    };

    // Paystack v1 validates callbacks via Object.prototype.toString.call(),
    // which returns "[object AsyncFunction]" for async functions — failing their
    // "[object Function]" check. Wrap any async/non-plain callback in a regular
    // synchronous function so Paystack always sees [object Function].
    if (typeof normalizedConfig.callback === "function") {
      const origCallback = normalizedConfig.callback;
      normalizedConfig.callback = function (response) {
        origCallback(response);
      };
    }

    const host = window.location.hostname;
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    if (
      isLocalhost &&
      typeof normalizedConfig.key === "string" &&
      normalizedConfig.key.startsWith("pk_live_")
    ) {
      return { opened: false, reason: "live_key_on_localhost" };
    }

    // Guard common invalid config states that can make Paystack throw.
    if (
      !normalizedConfig ||
      !normalizedConfig.key ||
      !normalizedConfig.email ||
      !normalizedConfig.ref
    ) {
      return { opened: false, reason: "invalid_config" };
    }

    const amount = Number(normalizedConfig.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { opened: false, reason: "invalid_amount" };
    }

    try {
      const handler = window.PaystackPop.setup(normalizedConfig);
      if (!handler || typeof handler.openIframe !== "function") {
        return { opened: false, reason: "invalid_handler" };
      }
      handler.openIframe();
      return { opened: true };
    } catch (error) {
      return {
        opened: false,
        reason: "setup_failed",
        error,
        message: error?.message || "Paystack setup failed",
      };
    }
  }

  return { ready, openPaystack };
}
