const seo = {
  intro:
    "Old Phone Resale Wipe Checklist orders the steps of preparing a phone for sale as a dependency chain and flags it when you mark one complete before its prerequisite. The order is what matters: on iPhone, Erase All Content and Settings from within Settings is the only route that clears Activation Lock as part of the erase, and on Android the Google account has to be removed before the factory reset or Factory Reset Protection leaves the buyer locked out. It also covers the things a wipe destroys that no backup restores — authenticator seeds, device-bound passkeys and transit passes held in the secure element.",
  useCases: [
    "Sell or trade in a phone without leaving Activation Lock or Factory Reset Protection on it for the buyer.",
    "Work out what has to move to the new phone before the old one is erased, rather than discovering it afterwards.",
    "Check a phone that has already been reset, to find out whether it will actually boot clean for someone else.",
    "Hand a family member a step-by-step order for a device with a work profile, an eSIM and a paired watch.",
  ],
  benefits: [
    ["Order is enforced", "Tick a step whose prerequisite is outstanding and the checklist says exactly what that mistake costs."],
    ["Covers the irreversible parts", "Two-factor seeds, passkeys, transit balances and eSIMs are treated as migration steps, not afterthoughts."],
    ["Ends with a verification", "Booting the wiped phone to the setup screen is the only proof that the account lock is really gone."],
  ],
  faqs: [
    [
      "What order should I wipe my phone in before selling it?",
      "Back up and verify the backup, move the things that only exist on the phone (authenticator seeds, passkeys, wallet passes, eSIM), remove work profiles and manufacturer accounts, remove the Google account on Android, take the SIM out, then erase from within Settings. On iPhone, Settings then General then Transfer or Reset iPhone then Erase All Content and Settings signs you out and clears Activation Lock in one action. Finally, boot the phone to the setup screen to confirm it does not ask for the previous account.",
    ],
    [
      "Do I need to remove my Google account before a factory reset?",
      "Yes. Factory Reset Protection binds a wiped Android phone to the last Google account signed in on it, so a reset performed before removing the account leaves the buyer facing a setup screen that demands your password. Some manufacturers add a second reactivation lock tied to their own account, which has to be removed separately.",
    ],
    [
      "Is a factory reset enough to erase my data securely?",
      "On any modern phone, yes. iOS storage is protected by the Secure Enclave and Android has required file-based encryption since Android 10, so the reset discards the encryption keys and the data becomes unrecoverable. Filling the phone with junk files before resetting is advice left over from unencrypted Android 5 and earlier and achieves nothing today. Removable memory cards are the exception — take them out.",
    ],
    [
      "What do I lose when I wipe my old phone?",
      "The things that were never in the backup: two-factor authenticator seeds if the app does not sync, device-bound passkeys, and any transit pass whose balance sits in the phone's secure element. Move all three to the new device and confirm they work before erasing, because some accounts cannot be recovered from a lost authenticator without a slow support process.",
    ],
  ],
};

export default seo;
