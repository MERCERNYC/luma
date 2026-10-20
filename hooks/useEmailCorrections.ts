"use client";

import { useEffect, useState } from "react";

/**
 * LUMA — Email Corrections Hook
 *
 * Purpose:
 * Allow users to override LUMA's priority decisions.
 *
 * Corrections are stored in the browser's localStorage.
 * Only email IDs and correction labels are stored.
 *
 * Important:
 * This is user preference persistence, not AI training.
 * It does not modify the original email or Gmail.
 */

export type EmailCorrection =
  | "important"
  | "not_important";

export type EmailCorrections = Record<
  string,
  EmailCorrection
>;

const STORAGE_KEY = "luma-email-corrections-v1";

export function useEmailCorrections() {
  const [corrections, setCorrections] =
    useState<EmailCorrections>({});

  const [loaded, setLoaded] = useState(false);

  /**
   * Load previously saved corrections.
   *
   * This runs in the browser, after the component
   * mounts, because localStorage is not available
   * during server rendering.
   */
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(
        STORAGE_KEY
      );

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (
          parsed !== null &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          const validCorrections: EmailCorrections = {};

          for (const [id, value] of Object.entries(
            parsed
          )) {
            if (
              value === "important" ||
              value === "not_important"
            ) {
              validCorrections[id] = value;
            }
          }

          setCorrections(validCorrections);
        }
      }
    } catch {
      // Invalid or inaccessible browser storage
      // should not prevent LUMA from working.
    } finally {
      setLoaded(true);
    }
  }, []);

  /**
   * Save corrections after initial loading.
   *
   * The loaded flag prevents overwriting saved
   * preferences with the initial empty state.
   */
  useEffect(() => {
    if (!loaded) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(corrections)
      );
    } catch {
      // Continue working in memory if browser
      // storage is unavailable.
    }
  }, [corrections, loaded]);

  /**
   * Create or update one email correction.
   */
  function correctEmail(
    emailId: string,
    correction: EmailCorrection
  ) {
    setCorrections((current) => ({
      ...current,
      [emailId]: correction,
    }));
  }

  /**
   * Remove the user's override.
   * LUMA's original recommendation applies again.
   */
  function undoCorrection(emailId: string) {
    setCorrections((current) => {
      const updated = { ...current };
      delete updated[emailId];
      return updated;
    });
  }

  return {
    corrections,
    correctEmail,
    undoCorrection,
    loaded,
  };
}
