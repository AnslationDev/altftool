const seo = {
  intro:
    "The Health Records App Permission Audit scores a personal health record, ABHA or lab-report app across sixteen permissions and privacy settings, because the biggest leak in this category is rarely a runtime prompt — it is a sharing toggle that defaults to on or an analytics SDK that reports screen names like 'HIV test result'. Health Connect and HealthKit access, background reads, cloud backup and default sharing with partner clinics are each weighted by sensitivity, and a biometric app lock is scored as a core control because it reduces risk rather than adding to it.",
  useCases: [
    "Check the default sharing settings after linking an ABHA number to a health app.",
    "Decide whether to grant Health Connect access record type by record type instead of 'Allow all'.",
    "Review whether a records app is backing up prescriptions to a cloud account you did not choose.",
    "Audit a lab-report app before uploading a family member's reports to it.",
  ],
  benefits: [
    [
      "Settings are audited alongside permissions",
      "Cloud backup, default sharing and analytics are scored as first-class items, not footnotes.",
    ],
    [
      "Credit for protective controls",
      "A biometric app lock counts as core, so the audit rewards the one setting that most reduces exposure.",
    ],
    [
      "Written for India's consent framework",
      "Recommendations point at the consent ledger and the specific, revocable consent the ABDM policy requires.",
    ],
  ],
  faqs: [
    [
      "Is it safe to link my health records to an app?",
      "It depends far more on the sharing defaults than on the permissions. Under India's DPDP Act 2023 and the ABDM Health Data Management Policy, health data may only be shared on your specific, revocable consent — so check the app's consent ledger and turn off any blanket sharing with partner clinics or insurers before uploading anything.",
    ],
    [
      "What is the difference between Health Connect read and background read?",
      "A read grant lets the app pull records while you are using it; background read (added in Android 15) lets it keep pulling when the app is closed, with no visible session. Deny background read unless you rely on automatic syncing, and refresh by opening the app instead.",
    ],
    [
      "Why does analytics matter in a health app?",
      "Because screen names are diagnoses. Even if a third-party SDK never sees the record contents, knowing you opened a screen for a particular test or condition reveals it. Turn off usage or diagnostics sharing in the app's privacy settings.",
    ],
    [
      "Can I remove health data an app has already collected?",
      "Revoking a permission only stops future access, so use the app's account deletion or data erasure request as well. This is informational, not legal or medical advice — talk to your provider before changing anything that affects your care.",
    ],
  ],
};

export default seo;
