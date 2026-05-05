"use client";

import { useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { buySmartDocPath } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebase";
import { subscribeCached } from "@/lib/firebaseCache";

const RULE_DOC = doc(db, ...buySmartDocPath("ruleSet"));

export default function useIdleRedirect() {
  const timerRef = useRef(null);
  const ruleRef = useRef(null);

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    const startTimer = () => {
      const rule = ruleRef.current;
      if (!rule) return;

      clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        window.location.href = rule.redirectUrl;
      }, rule.idleTimeMs);
    };

    const resetTimer = () => {
      startTimer();
    };

    // ✅ Attach listeners ONCE
    events.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    // ✅ Firestore listener
    const unsubscribe = subscribeCached("buysmart:idle-rule", (emit, fail) => onSnapshot(
      RULE_DOC,
      (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        const bannerRules = data?.banner;

        if (!Array.isArray(bannerRules) || bannerRules.length === 0) return;

        const latestRule = [...bannerRules].sort(
          (a, b) => Number(b.createdAt) - Number(a.createdAt)
        )[0];

        emit({
          active: latestRule.active,
          idleTime: latestRule.idleTime,
          redirectUrl: latestRule.redirectUrl,
        });
      },
      fail,
    ), (latestRule) => {
      const { active, redirectUrl, idleTime } = latestRule || {};

      if (!active || !redirectUrl || !idleTime) {
        ruleRef.current = null;
        clearTimeout(timerRef.current);
        return;
      }

      // ✅ Store parsed rule
      ruleRef.current = {
        redirectUrl,
        idleTimeMs: Number(idleTime) * 1000,
      };

      // ✅ Restart timer with new rule
      startTimer();
    });

    return () => {
      clearTimeout(timerRef.current);
      unsubscribe();

      events.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, []);
}
