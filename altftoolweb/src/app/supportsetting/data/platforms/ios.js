import {
  CloudDownload,
  HardDrive,
  Cloud,
  EyeOff,
  Lock,
  Wifi,
  BluetoothIcon,
  Sun,
  Accessibility,
  Users,
  RotateCcw,
  Bell,
  Volume2,
  Moon,
  Battery,
  Info,
  SlidersHorizontal,
  LayoutGrid,
  Image,
  Clock4,
  MapPin,
  Signal,
  Router,
  ShieldCheck,
  Share2,
  Search,
  Keyboard,
  Globe,
  Clock,
  LocateFixed,
  Wallet,
  Store,
  Compass,
  Siren,
  Gamepad2,
  Activity,
  Archive,
  BatteryCharging,
  Bluetooth,
  Ear,
  FileText,
  FlaskConical,
  Headphones,
  History,
  KeyRound,
  Mail,
  Mic,
  PieChart,
  RefreshCw,
  Scale,
  Watch,
  ZoomIn,
  Calendar,
  Camera,
  Captions,
  Car,
  Cast,
  Contrast,
  Eye,
  Hand,
  MessageCircle,
  MousePointerClick,
  Phone,
  Plane,
  ShoppingBag,
  Type,
  Zap,
} from "lucide-react";

// iOS Support Settings (iPhone/iPad). New entries — link out to a real,
// verified official Apple support article for each topic (checked live via
// WebFetch). No hotlinked screenshots, matching the same approach used for
// macOS and Android.
export const iosSettings = [
  {
    id: "ios-software-update",
    title: "Software Update",
    icon: CloudDownload,
    platform: "ios",
    category: "system-updates",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Update Your iPhone or iPad",
    description:
      "Software Update keeps iOS current with the latest security fixes, features, and app compatibility. You can update wirelessly, overnight while charging, or via a computer.",
    details: [
      "iOS can download and install updates automatically overnight while charging and connected to Wi-Fi.",
      "You can check for and install updates manually at any time.",
      "Security Responses can install important fixes faster, without waiting for a full iOS version update.",
      "Updates typically require enough free storage and battery (or being plugged in) to install.",
    ],
    important:
      "Very old devices may stop receiving new iOS versions — check whether your specific model is still supported if updates no longer appear.",
    redirectUrl: "https://support.apple.com/en-us/118575",
    afterImageContent: {
      heading: "How iOS Updates Work",
      paragraphs: [
        "Your iPhone checks Apple's servers for available updates and notifies you when one is ready.",
        "Automatic Updates can be turned on so updates install with no action needed from you.",
        "A restart is required to finish installing most iOS updates.",
      ],
      steps: [
        "Open Settings → General → Software Update.",
        "Wait for iOS to check for updates, or tap 'Check for Updates'.",
        "Tap 'Download and Install'.",
        "Enter your passcode and let your device restart when prompted.",
      ],
    },
    whyItMatters:
      "Every iOS update bundles the security patches that close vulnerabilities discovered since the last release, so delaying updates leaves known exploits open on your device. Updates also fix bugs affecting battery life, app crashes, and connectivity, and they're required for many new App Store apps to keep working correctly. Skipping updates for too long can eventually mean losing compatibility with newer app versions and accessories.",
    bestPractices: [
      "Turn on Automatic Updates so security fixes install overnight without you having to remember.",
      "Plug your iPhone in and connect to Wi-Fi before bed so overnight updates actually have a chance to run.",
      "Check manually before a big trip or event, since Apple sometimes ships urgent Security Responses outside the normal update cycle.",
      "Keep at least a few GB of free storage available, since large iOS updates can fail to download when storage is tight.",
      "Restart your device promptly after an update finishes installing rather than leaving it in the 'update pending restart' state.",
    ],
    commonIssues: [
      {
        issue: "Update download stalls at 'Verifying Update' or gets stuck for hours",
        fix: "Restart the iPhone, reconnect to Wi-Fi, and retry from Settings → General → Software Update; if it still stalls, temporarily disable a VPN or content filter that may be blocking Apple's servers.",
      },
      {
        issue: "'Not Enough Storage' error prevents the update from downloading",
        fix: "Free up space in Settings → General → iPhone Storage, or let iOS use its temporary 'offload apps to make room' option during the update.",
      },
      {
        issue: "Automatic Updates never seem to run overnight",
        fix: "Confirm the device is charging, locked, and connected to Wi-Fi at night, and that Settings → General → Software Update → Automatic Updates has both toggles enabled.",
      },
      {
        issue: "An older iPhone no longer shows the newest iOS version available",
        fix: "Check Apple's published device compatibility list for that iOS version — some hardware has reached its final supported release and this is expected, not a bug.",
      },
    ],
    faqs: [
      {
        q: "Will updating my iPhone delete my data?",
        a: "No, a standard software update preserves your apps, photos, and settings — only an 'Erase All Content and Settings' reset deletes data, not a regular iOS update.",
      },
      {
        q: "Can I skip an iOS update and go straight to a newer one?",
        a: "Yes, you can usually update directly to the latest available version; iOS doesn't require installing every intermediate version in sequence.",
      },
      {
        q: "Why does my iPhone ask me to update over Wi-Fi only?",
        a: "Large iOS update files can be several gigabytes, so Apple defaults to Wi-Fi to avoid surprise cellular data charges, though newer iOS versions do allow cellular updates for smaller files.",
      },
      {
        q: "Is it safe to keep using my iPhone while an update downloads in the background?",
        a: "Yes, you can keep using your device normally while the update downloads; it only requires you to stop and restart once you tap 'Install'.",
      },
    ],
    tipsAndTricks: [
      "You can see your exact current iOS build number under Settings → General → About if support needs it for troubleshooting.",
      "Enable 'Security Responses & System Files' installation separately if you want critical patches applied even faster, without waiting on full iOS releases.",
      "If an update keeps failing over Wi-Fi, connecting to a computer with Finder (Mac) or iTunes (Windows) can complete the install when the wireless method won't.",
    ],
    relatedSettingIds: ["ios-iphone-storage", "ios-icloud-backup", "ios-reset-iphone"],
    updateFrequency:
      "Check for updates at least monthly if Automatic Updates is off, and install Security Responses as soon as they appear since they patch actively exploited vulnerabilities.",
  },
  {
    id: "ios-iphone-storage",
    title: "iPhone Storage",
    icon: HardDrive,
    platform: "ios",
    category: "storage-backup-data",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Storage on iPhone",
    description:
      "iPhone Storage shows exactly what's using space on your device and offers one-tap recommendations — like offloading unused apps or reviewing large attachments — to free up room.",
    details: [
      "Offloading an app removes the app itself but keeps its documents and data for when you reinstall it.",
      "Recommendations are personalized based on what's actually taking up space on your device.",
      "You can review storage used by individual apps, photos, messages, and system data.",
      "iCloud Photos with 'Optimize iPhone Storage' keeps lightweight versions locally to save space.",
    ],
    important:
      "Deleting an app (rather than offloading it) permanently removes its local data unless that data is backed up elsewhere.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/manage-storage-on-iphone-iph47c931112/ios",
    afterImageContent: {
      heading: "Freeing Up Space",
      paragraphs: [
        "The Storage screen ranks apps by how much space they use, largest first.",
        "Recommendations may include offloading unused apps or reviewing large video attachments in Messages.",
        "iOS periodically updates its recommendations as your usage changes.",
      ],
      steps: [
        "Open Settings → General → iPhone Storage.",
        "Wait for the storage breakdown to load.",
        "Review the recommendations and tap one to act on it.",
        "Check individual apps for anything you no longer need.",
      ],
    },
    whyItMatters:
      "Running low on storage quietly breaks core iPhone functions — the camera refuses to take photos, apps crash on launch, and iOS updates fail to download. Because iPhone Storage shows exactly which apps and file types are eating your space, it turns a vague 'my phone is full' problem into a specific, fixable list. Regularly clearing space also keeps backups and updates running smoothly instead of stalling partway through.",
    bestPractices: [
      "Offload apps you rarely use instead of deleting them outright, so their data is preserved for a quick reinstall later.",
      "Turn on 'Optimize iPhone Storage' for Photos so full-resolution originals stay safely in iCloud while lightweight versions live on your device.",
      "Review the Messages attachments section periodically — years of received videos and photos can quietly consume tens of gigabytes.",
      "Act on the personalized recommendations at the top of the Storage screen first, since they're calculated from your actual usage.",
    ],
    commonIssues: [
      {
        issue: "'Other' or 'System Data' takes up an unexpectedly large amount of space",
        fix: "Restart the iPhone to clear cached data, and check Safari's website data and app caches, which often account for this category.",
      },
      {
        issue: "Storage still looks full right after deleting a lot of photos",
        fix: "Empty the 'Recently Deleted' album in Photos, since deleted items stay recoverable there for 30 days and still count against storage.",
      },
      {
        issue: "An app reports it needs to be reinstalled after being offloaded",
        fix: "This is expected — offloading removes the app binary but keeps its documents; tap the greyed-out icon to redownload it from the App Store.",
      },
      {
        issue: "iCloud Photos shows photos as taking space even with Optimize Storage on",
        fix: "Give the device time on Wi-Fi and power to finish thinning local copies; it doesn't happen instantly after enabling the setting.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between offloading and deleting an app?",
        a: "Offloading removes the app itself but keeps its saved data and documents, so reinstalling later restores everything; deleting removes the app and its local data together.",
      },
      {
        q: "Why does 'iPhone Storage' show a different total than the About screen?",
        a: "The About screen shows raw capacity, while iPhone Storage reflects usable space after the operating system and system reserves, so the numbers won't match exactly.",
      },
      {
        q: "Does offloading unused apps delete my saved documents or game progress?",
        a: "No, offloading intentionally preserves that data locally so it's restored automatically the next time you reinstall the app from the App Store.",
      },
    ],
    tipsAndTricks: [
      "Tap directly on the colored storage bar at the top of the screen to see which category (Apps, Photos, Media, System) a particular segment represents.",
      "Enable 'Offload Unused Apps' under App Store settings so iOS automatically offloads rarely used apps only when storage actually runs low.",
      "The app list is already sorted by size, so the biggest single offender is usually right at the top rather than buried among many small apps.",
    ],
    relatedSettingIds: ["ios-icloud-backup", "ios-software-update", "ios-reset-iphone"],
    updateFrequency:
      "Glance at the Storage screen monthly, or immediately whenever you get a low-storage warning or an update fails to download.",
  },
  {
    id: "ios-icloud-backup",
    title: "iCloud Backup",
    icon: Cloud,
    platform: "ios",
    category: "storage-backup-data",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Back Up Your iPhone or iPad with iCloud",
    description:
      "iCloud Backup automatically saves a copy of your photos, app data, device settings, and more, so you can restore everything on a new or reset device.",
    details: [
      "Automatic backups happen when your device is locked, connected to power, and on Wi-Fi.",
      "You can trigger a manual backup at any time from Settings.",
      "Backup size depends on your iCloud storage plan — you may need to upgrade for larger backups.",
      "Restoring from a backup is offered automatically during setup on a new or erased device.",
    ],
    important:
      "If your iCloud storage is full, automatic backups will stop — free up space or upgrade your plan to keep backups current.",
    redirectUrl: "https://support.apple.com/en-us/108366",
    afterImageContent: {
      heading: "What's Included in an iCloud Backup",
      paragraphs: [
        "Backups include app data, device settings, home screen layout, and iMessage/text messages.",
        "Photos and videos are typically stored via iCloud Photos rather than the device backup itself.",
        "You can see the date and size of your last backup right in Settings.",
      ],
      steps: [
        "Open Settings → [Your Name] → iCloud → iCloud Backup.",
        "Turn on 'Back Up This iPhone' if it isn't already.",
        "Tap 'Back Up Now' to run an immediate backup over Wi-Fi.",
      ],
    },
    whyItMatters:
      "A current iCloud Backup is the difference between a lost or damaged iPhone being a minor inconvenience and a genuine disaster — it's what lets you restore messages, photos, app data, and your entire home screen layout onto a replacement device. Because backups run automatically overnight, most people never think about them until they desperately need one, which is exactly when an outdated or missing backup causes real data loss. It's one of the few settings where 'set it and forget it' only works if you actually confirm it's working.",
    bestPractices: [
      "Charge your iPhone overnight on a known Wi-Fi network so the automatic backup condition (locked, charging, Wi-Fi) is reliably met.",
      "Check the 'last backed up' date in Settings periodically rather than assuming backups are happening silently.",
      "Upgrade your iCloud+ storage plan if backups are failing due to space, rather than disabling backup for large apps just to fit.",
      "Run a manual 'Back Up Now' before major events like an iOS update, a trade-in, or travel, so you have a fresh restore point.",
    ],
    commonIssues: [
      {
        issue: "Backup hasn't run in weeks despite iCloud Backup being turned on",
        fix: "Confirm the phone is actually locked and charging on Wi-Fi overnight — a case blocking the charging cable or a habit of using the phone at night can silently prevent it.",
      },
      {
        issue: "'Not Enough iCloud Storage' blocks the backup from completing",
        fix: "Either free up iCloud space by removing old backups of unused devices, or upgrade to a larger iCloud+ storage tier.",
      },
      {
        issue: "A newly restored iPhone seems to be missing recent messages or photos",
        fix: "Make sure you restored from the most recent backup date, not an older one, and give iCloud Photos time to finish downloading full-resolution images after setup.",
      },
      {
        issue: "Backup is stuck on 'Estimating time remaining' indefinitely",
        fix: "Turn Wi-Fi off and back on, or restart the device, then retry the manual backup — this usually resolves a stalled network handshake with iCloud.",
      },
    ],
    faqs: [
      {
        q: "Does iCloud Backup include my photos?",
        a: "If iCloud Photos is enabled, your photos are stored and synced there directly rather than duplicated inside the device backup; if iCloud Photos is off, photos are included in the backup itself.",
      },
      {
        q: "How much iCloud storage do I actually need for backups?",
        a: "It depends on your data, but the free 5GB tier is rarely enough for a full backup with photos — most users need at least the 50GB or 200GB iCloud+ tier.",
      },
      {
        q: "Can I back up over cellular data instead of Wi-Fi?",
        a: "Automatic backups require Wi-Fi by default; a manual backup triggered from Settings can sometimes use cellular, but this can consume significant data depending on backup size.",
      },
      {
        q: "What happens to my old backups when I get a new iPhone?",
        a: "Old backups remain in iCloud until you delete them or they age out for storage reasons; you can manage and delete backups for specific devices from the iCloud storage settings.",
      },
    ],
    tipsAndTricks: [
      "Under Settings → [Your Name] → iCloud → Manage Account Storage → Backups, you can see and delete backups for devices you no longer own to free up space.",
      "You can choose which specific apps are included in your iCloud backup from the same Backup screen, excluding large ones you don't need preserved.",
      "Before restoring a new device, back up your current iPhone one last time so nothing from the last few hours or days gets missed.",
    ],
    relatedSettingIds: ["ios-iphone-storage", "ios-reset-iphone", "ios-software-update"],
    updateFrequency:
      "Automatic backups run daily whenever conditions are met (locked, charging, Wi-Fi); verify the 'last backed up' date at least weekly if you're not sure it's running consistently.",
  },
  {
    id: "ios-privacy-permissions",
    title: "Privacy & Permissions",
    icon: EyeOff,
    platform: "ios",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Control App Access to Camera, Microphone & Location",
    description:
      "The Privacy & Security hub lets you review and control exactly which apps can access your Camera, Microphone, Location Services, Contacts, Photos, and more.",
    details: [
      "An orange dot in the status bar means the microphone is currently in use; a green dot means the camera is.",
      "Location Services can be set per app to Never, Ask Next Time, While Using, or Always.",
      "App Privacy Report shows how often apps have accessed sensitive data and contacted other domains.",
      "Tapping any category (like Camera) lists every app that has requested that permission.",
    ],
    important:
      "Denying location access to navigation or delivery apps will prevent core features like turn-by-turn directions from working.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/control-access-to-information-in-apps-iph251e92810/ios",
    afterImageContent: {
      heading: "Reviewing Permissions by Category",
      paragraphs: [
        "iOS groups permissions by data type (Camera, Microphone, Location, Contacts, Photos, etc.).",
        "You can jump straight to any app's individual permission settings from its category listing.",
        "The App Privacy Report gives a longer-term view of how apps have used the permissions you granted.",
      ],
      steps: [
        "Open Settings → Privacy & Security.",
        "Select a category (e.g. Camera or Microphone).",
        "Review which apps have access and toggle any off as needed.",
      ],
    },
    whyItMatters:
      "Apps can quietly request access to your camera, microphone, precise location, contacts, and photo library, and without regular review those permissions tend to accumulate far beyond what's actually needed. Location and microphone access in particular can be used for tracking or advertising purposes well beyond the feature you originally granted them for. Reviewing this hub regularly is one of the highest-leverage privacy habits on iPhone because it directly controls what data leaves your device.",
    bestPractices: [
      "Set location access to 'While Using the App' instead of 'Always' unless a feature genuinely requires background location, like Find My or a delivery app.",
      "Review the App Privacy Report every few weeks to see which apps are actually using the permissions you granted and how often.",
      "Restrict Photos access to 'Selected Photos' for apps that don't need your entire library, rather than granting full access by default.",
      "Pay attention to the orange and green status bar dots — they indicate live microphone or camera use and are worth investigating if they appear unexpectedly.",
    ],
    commonIssues: [
      {
        issue: "A navigation or delivery app stops working correctly after location access is restricted",
        fix: "Set that specific app's location permission back to 'While Using the App' or 'Always' rather than 'Never', since core navigation features depend on it.",
      },
      {
        issue: "Green or orange dot appears in the status bar with no obvious app open",
        fix: "Open Control Center to see which app is listed as recently using the camera or microphone, and check that app's individual permissions if it's unfamiliar.",
      },
      {
        issue: "An app keeps re-requesting a permission you already denied",
        fix: "This is normal behavior for some apps on relaunch; if it becomes intrusive, review the app's settings directly rather than repeatedly dismissing the system prompt.",
      },
      {
        issue: "Photos access shows 'Limited' and an app can't see images you just took",
        fix: "Go to that app's Photos permission and add the new photos to its selected access, or switch it to 'All Photos' if you trust the app.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between 'While Using the App' and 'Always' for location?",
        a: "'While Using the App' only shares location when the app is open and active, while 'Always' allows background location access even when the app is closed, which is rarely necessary outside of navigation, fitness tracking, or Find My-style apps.",
      },
      {
        q: "Does turning off Microphone access for an app break voice features entirely?",
        a: "Yes, an app cannot process any audio input without microphone permission, so voice memos, voice search, or calling features within that specific app will stop functioning until access is restored.",
      },
      {
        q: "Can I see which apps have accessed my location recently?",
        a: "Yes, Settings → Privacy & Security → Location Services shows a recent indicator next to any app that has used your location in the last 24 hours.",
      },
    ],
    tipsAndTricks: [
      "Tap the 'i' info icon next to an app's location setting to see a small map preview of the precision level it's currently allowed.",
      "Turn off 'Precise Location' for apps like weather or shopping that only need your general area, keeping exact GPS coordinates private.",
      "Use App Privacy Report's 'Network Contacts' view to spot apps quietly communicating with third-party domains you don't recognize.",
    ],
    relatedSettingIds: ["ios-face-id-passcode", "ios-wifi", "ios-screen-time-family"],
    updateFrequency:
      "Do a full permissions review every couple of months, and immediately after installing any new app that requests sensitive access.",
  },
  {
    id: "ios-face-id-passcode",
    title: "Face ID & Passcode",
    icon: Lock,
    platform: "ios",
    category: "privacy-permissions",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Face ID and Passcode on iPhone",
    description:
      "Face ID (or Touch ID) and Passcode settings control how you unlock your iPhone, authorize purchases, and protect sensitive data with biometric or code-based security.",
    details: [
      "You can register multiple Face ID appearances or fingerprints for more reliable recognition.",
      "A passcode is always required as a backup to Face ID or Touch ID.",
      "You can choose which features require Face ID: unlocking, Apple Pay, App Store purchases, and more.",
      "Erase Data can be turned on to wipe the device after 10 failed passcode attempts.",
    ],
    important:
      "If you forget your passcode, you may need to erase your device to regain access — always keep a way to recover your Apple Account.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/set-up-face-id-iph6d162927a/ios",
    afterImageContent: {
      heading: "Setting Up Face ID",
      paragraphs: [
        "Face ID setup involves slowly moving your head in a circle so the camera can capture your face from multiple angles.",
        "You can add an Alternate Appearance to improve recognition for changes like glasses or facial hair.",
        "Face ID and passcode settings are grouped in one place for quick review.",
      ],
      steps: [
        "Open Settings → Face ID & Passcode.",
        "Enter your current passcode.",
        "Tap 'Set Up Face ID' and follow the on-screen motion prompts.",
        "Choose which features should use Face ID.",
      ],
    },
    whyItMatters:
      "Face ID and your passcode are the single point of failure protecting everything else on your iPhone — messages, banking apps, saved passwords, and photos are all only as secure as this setting. Because a passcode is always required as a fallback, weak or simple passcodes undermine even a well-configured Face ID setup. This is also the setting that determines what happens after failed unlock attempts, making it central to what happens if your phone is lost or stolen.",
    bestPractices: [
      "Use a 6-digit or custom alphanumeric passcode instead of a 4-digit one, since it's dramatically harder to guess or shoulder-surf.",
      "Register an Alternate Appearance in Face ID if you regularly wear glasses, a hat, or have facial hair changes, to reduce failed unlock attempts.",
      "Enable Face ID for App Store purchases and Apple Pay to avoid separately re-entering passwords for those actions.",
      "Turn on 'Erase Data After 10 Failed Attempts' only if you're confident about your backup situation, since it's irreversible once triggered.",
    ],
    commonIssues: [
      {
        issue: "Face ID stops recognizing your face after wearing a mask or new glasses",
        fix: "Add an Alternate Appearance in Settings → Face ID & Passcode → 'Set Up an Alternate Appearance' rather than resetting Face ID entirely.",
      },
      {
        issue: "iPhone keeps asking for the passcode instead of using Face ID",
        fix: "This happens after a restart, after 48 hours of no unlock, or after several failed Face ID attempts — all are intentional security fallbacks, not a bug.",
      },
      {
        issue: "Forgot the passcode and can't get back in",
        fix: "Use 'Erase iPhone' from the passcode entry screen (after enough failed attempts) or connect to a computer in recovery mode, then restore from your most recent iCloud or computer backup.",
      },
      {
        issue: "Face ID setup fails repeatedly during the initial scan",
        fix: "Make sure nothing (a screen protector edge, dirt, or a case) is blocking the TrueDepth camera area, and try setup again in better lighting.",
      },
    ],
    faqs: [
      {
        q: "Is Face ID or a strong passcode more secure?",
        a: "They work together — Face ID is convenient for daily unlocking, but the passcode remains the ultimate fallback and is what protects the device if Face ID fails or is disabled, so both need to be strong.",
      },
      {
        q: "Can someone unlock my phone by holding it up to my face while I'm asleep?",
        a: "Face ID includes attention awareness that checks your eyes are open and directed at the device by default, which makes this much harder, though you can require a more deliberate look for extra protection.",
      },
      {
        q: "What happens if I enter the wrong passcode too many times?",
        a: "After several failed attempts iOS adds increasing time delays between tries, and if 'Erase Data' is enabled, the device wipes itself entirely after 10 consecutive failures.",
      },
      {
        q: "Does Face ID work with sunglasses on?",
        a: "Face ID can work with many sunglasses since it uses infrared, not just visible light, but very dark or infrared-blocking lenses may prevent recognition.",
      },
    ],
    tipsAndTricks: [
      "Double-clicking the side button at the Lock Screen brings up Apple Pay directly, using Face ID for authentication without unlocking the whole phone first.",
      "You can disable the 'attention-aware' requirement under Accessibility settings if you find the deliberate-glance requirement for Face ID inconvenient or inaccessible.",
      "Set up Face ID indoors under normal lighting rather than in very bright sunlight or complete darkness for the most reliable initial scan.",
    ],
    relatedSettingIds: ["ios-privacy-permissions", "ios-reset-iphone", "ios-icloud-backup"],
  },
  {
    id: "ios-wifi",
    title: "Wi-Fi Connection",
    icon: Wifi,
    platform: "ios",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Connect Your iPhone to Wi-Fi",
    description:
      "Wi-Fi settings let you join nearby networks, share passwords instantly between Apple devices, and manage previously joined networks.",
    details: [
      "Nearby networks are listed automatically with signal strength shown.",
      "Password sharing lets a nearby iPhone or Mac send you a saved Wi-Fi password directly.",
      "Known networks reconnect automatically unless you tell your device to forget them.",
      "'Ask to Join Networks' controls whether iOS prompts you when no known network is in range.",
    ],
    important:
      "Avoid signing in to sensitive accounts while connected to open, password-free public Wi-Fi networks.",
    redirectUrl: "https://support.apple.com/en-us/111107",
    afterImageContent: {
      heading: "Joining and Managing Networks",
      paragraphs: [
        "iOS shows every nearby network along with a lock icon for secured networks.",
        "Forgetting a network removes its saved password so you'll need to re-enter it later.",
        "Private Wi-Fi Address settings can be adjusted per network for extra privacy.",
      ],
      steps: [
        "Open Settings → Wi-Fi.",
        "Tap a network and enter its password (or accept a shared password prompt).",
        "Confirm the network shows 'Connected' with a checkmark.",
      ],
    },
    whyItMatters:
      "Your Wi-Fi connection determines whether backups, software updates, and iCloud Photos sync happen automatically in the background, since most of those tasks are restricted to Wi-Fi to avoid cellular data charges. Joining the wrong network, especially an open public one, also has real privacy implications since data can be more easily intercepted on unsecured networks. Managing known networks properly also solves the everyday annoyance of a phone stubbornly reconnecting to a weak or outdated network instead of a stronger one nearby.",
    bestPractices: [
      "Forget old or no-longer-used networks (like a previous home or a hotel) so your iPhone doesn't waste time trying to reconnect to networks with saved but outdated passwords.",
      "Leave 'Ask to Join Networks' set to 'Notify' so you're aware of available networks without being interrupted by every weak signal in range.",
      "Avoid logging into sensitive accounts like banking apps while connected to open, password-free public Wi-Fi.",
      "Keep Private Wi-Fi Address enabled for most networks, which is the default and recommended setting to limit device tracking.",
    ],
    commonIssues: [
      {
        issue: "iPhone connects to a weak or wrong known network instead of a stronger one nearby",
        fix: "Forget the weaker network in Settings → Wi-Fi so the device stops prioritizing it, then reconnect to the preferred network manually.",
      },
      {
        issue: "Wi-Fi password sharing prompt never appears when a nearby friend's iPhone tries to join your network",
        fix: "Make sure both devices have Wi-Fi and Bluetooth on, are unlocked, and that the receiving device's Apple Account email is in the other person's Contacts.",
      },
      {
        issue: "Wi-Fi keeps disconnecting and reconnecting repeatedly",
        fix: "Forget the network and rejoin with the password entered fresh, or restart the router, since this is often a router-side lease or interference issue rather than an iPhone problem.",
      },
      {
        issue: "'Ask to Join Networks' constantly interrupts with prompts for weak public networks",
        fix: "Change the setting from 'Ask' to 'Notify' or 'Off' under Settings → Wi-Fi → Ask to Join Networks.",
      },
    ],
    faqs: [
      {
        q: "Why won't my iPhone show a nearby Wi-Fi network that I know exists?",
        a: "The network may be using a 5GHz-only or hidden SSID that some settings filter out, or it might be out of effective range despite showing full bars on another device.",
      },
      {
        q: "Is it safe to use free Wi-Fi at a coffee shop or airport?",
        a: "It's reasonably safe for general browsing, but avoid entering passwords or banking details on open networks, or use a VPN for sensitive activity.",
      },
      {
        q: "What does 'Private Wi-Fi Address' actually do?",
        a: "It uses a different, randomized network identifier (MAC address) for each Wi-Fi network you join, making it harder for networks to track your device across visits or locations.",
      },
    ],
    tipsAndTricks: [
      "You can share your Wi-Fi password with someone nearby just by holding their unlock screen close to yours while their device tries to join — no need to read the password aloud.",
      "Tap the small 'i' icon next to any joined network to view or copy its password if you have a stored device passcode or Face ID handy.",
      "Turn off Wi-Fi Assist under Settings → Cellular if you want your phone to strictly stay on Wi-Fi rather than quietly switching to cellular for a weak signal.",
    ],
    relatedSettingIds: ["ios-bluetooth", "ios-privacy-permissions", "ios-software-update"],
  },
  {
    id: "ios-bluetooth",
    title: "Bluetooth Devices",
    icon: BluetoothIcon,
    platform: "ios",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Connect Bluetooth Accessories to iPhone",
    description:
      "Bluetooth settings let you pair AirPods, headphones, speakers, keyboards, and other accessories, and manage previously connected devices.",
    details: [
      "Apple accessories like AirPods often pair instantly with a pop-up animation when nearby.",
      "Third-party accessories need to be put into pairing mode before they appear in the list.",
      "You can rename, disconnect, or forget any paired device from its details screen.",
      "Battery levels for supported accessories are shown right on the Bluetooth settings screen.",
    ],
    important:
      "If an accessory won't reconnect, forget it on your iPhone and re-pair it from scratch — this resolves most stuck connections.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/connect-bluetooth-accessories-iph3c50f191/ios",
    afterImageContent: {
      heading: "Pairing a New Accessory",
      paragraphs: [
        "iOS scans for nearby discoverable Bluetooth accessories automatically once Bluetooth is on.",
        "Audio accessories can be selected as the active output right from Control Center.",
        "Some accessories support automatic switching between your Apple devices.",
      ],
      steps: [
        "Open Settings → Bluetooth.",
        "Turn on Bluetooth if it isn't already.",
        "Put your accessory into pairing mode and tap it under 'Other Devices'.",
      ],
    },
    whyItMatters:
      "Bluetooth settings govern how reliably your AirPods, car stereo, smartwatch, and other accessories connect, and a cluttered or outdated device list is the most common cause of pairing headaches. Because multiple paired devices can compete for an audio connection, understanding this screen helps you control exactly which accessory your iPhone talks to at any moment. It's also relevant to battery life, since Bluetooth scanning left on unnecessarily can contribute to background power drain.",
    bestPractices: [
      "Forget accessories you no longer own or use regularly to keep the device list clean and avoid connection conflicts.",
      "Rename frequently used accessories with recognizable names (like 'Car Stereo' or 'Work AirPods') so switching audio output is faster from Control Center.",
      "Keep only one audio accessory actively connected at a time if you're having trouble with audio routing between multiple paired devices.",
      "Check battery levels for supported accessories directly in the Bluetooth settings screen instead of relying on a separate app.",
    ],
    commonIssues: [
      {
        issue: "AirPods or headphones won't reconnect after working fine previously",
        fix: "Forget the device under Settings → Bluetooth, then put it back into pairing mode and re-pair it from scratch — this resolves the vast majority of stuck connections.",
      },
      {
        issue: "Audio plays from the wrong device (like a car speaker instead of headphones)",
        fix: "Open Control Center and tap the audio output icon to manually select the correct connected Bluetooth device.",
      },
      {
        issue: "A Bluetooth accessory appears in the list but won't connect",
        fix: "Ensure the accessory itself is charged, in range, and not currently connected to another device, since many Bluetooth accessories can only pair to one device at a time.",
      },
      {
        issue: "Bluetooth turns back on by itself after being turned off from Control Center",
        fix: "Control Center's Bluetooth toggle only disconnects temporarily and resets at 5 a.m. or on a location change — turn it off from Settings → Bluetooth instead for it to stay off.",
      },
    ],
    faqs: [
      {
        q: "Why does Bluetooth turn back on automatically after I turn it off?",
        a: "Toggling Bluetooth off from Control Center is a temporary disconnect, by design, so it can still support features like Find My and AirDrop; turn it off in Settings for a persistent off state.",
      },
      {
        q: "Can two people share one pair of AirPods on separate iPhones?",
        a: "AirPods can only actively play audio to one device at a time, though Audio Sharing lets two nearby sets of AirPods listen to the same source from a single iPhone temporarily.",
      },
      {
        q: "Why does my accessory show up as 'Not Connected' even though it's on?",
        a: "It may already be connected to a different device, be out of Bluetooth range, or need its pairing forgotten and redone if the connection has become corrupted.",
      },
    ],
    tipsAndTricks: [
      "Long-press the audio card in Control Center to quickly switch between multiple connected Bluetooth audio devices without opening Settings.",
      "Enable Audio Sharing to temporarily let a second pair of AirPods or Beats headphones listen to the same audio from your iPhone.",
      "Tap the 'i' next to a connected accessory to access device-specific controls, like double-tap actions or noise control settings, that don't appear anywhere else.",
    ],
    relatedSettingIds: ["ios-wifi", "ios-display-brightness", "ios-accessibility"],
  },
  {
    id: "ios-display-brightness",
    title: "Display & Brightness",
    icon: Sun,
    platform: "ios",
    category: "display-sound-notifications",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Adjust Display & Brightness on iPhone",
    description:
      "Display & Brightness settings control screen brightness, True Tone, Dark Mode, text size, and Night Shift for warmer colors in the evening.",
    details: [
      "Auto-Brightness adjusts the screen based on ambient light automatically.",
      "Dark Mode can follow a schedule (sunset to sunrise, or custom hours) or stay on manually.",
      "Night Shift shifts colors warmer at a scheduled time to reduce blue light before bed.",
      "Text size and Bold Text improve readability system-wide.",
    ],
    important:
      "Very low brightness combined with certain accessibility filters can make some content hard to read — check your settings if the screen looks unusually dim or tinted.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/adjust-screen-brightness-color-balance-iph60ba71065/ios",
    afterImageContent: {
      heading: "Customizing Display Settings",
      paragraphs: [
        "Dark Mode changes the whole system's color scheme to a darker palette, and many apps adapt automatically.",
        "Night Shift and True Tone both affect color temperature but work independently of each other.",
        "Display Zoom offers a larger on-screen layout for easier viewing on supported devices.",
      ],
      steps: [
        "Open Settings → Display & Brightness.",
        "Adjust the brightness slider, or toggle Dark Mode / Automatic.",
        "Tap 'Night Shift' or 'True Tone' to configure color settings.",
      ],
    },
    whyItMatters:
      "Display settings directly affect both battery life and eye comfort, since the screen is typically the single largest drain on an iPhone's battery. Dark Mode and Night Shift specifically help reduce eye strain and blue light exposure in the evening, which can affect sleep quality for some users. Text size and Bold Text settings also make a meaningful accessibility difference for anyone who finds default iOS text too small to read comfortably.",
    bestPractices: [
      "Enable Auto-Brightness so the screen adjusts to ambient light automatically instead of manually fighting with the slider all day.",
      "Schedule Dark Mode to switch automatically at sunset and sunrise rather than remembering to toggle it manually.",
      "Set Night Shift to start a couple of hours before your usual bedtime for a gradual, less jarring color shift.",
      "Increase text size gradually through Settings rather than relying on pinch-to-zoom gestures within individual apps.",
    ],
    commonIssues: [
      {
        issue: "Screen looks unusually dim or has a strange tint after adjusting settings",
        fix: "Check that Night Shift or an accessibility color filter isn't accidentally left on, and confirm True Tone is set the way you expect under Display & Brightness.",
      },
      {
        issue: "Auto-Brightness makes the screen too dark in bright sunlight",
        fix: "Manually override the brightness slider temporarily — Auto-Brightness will still learn and adjust its baseline over time based on your manual corrections.",
      },
      {
        issue: "Dark Mode doesn't apply to a particular app even though it's on system-wide",
        fix: "Some apps control their own appearance internally; check that app's own in-app settings for a separate dark theme toggle.",
      },
      {
        issue: "Text size changes in Settings don't affect all apps",
        fix: "Dynamic Type-compatible apps scale with system text size, but some third-party apps use fixed font sizes and require their own in-app font settings.",
      },
    ],
    faqs: [
      {
        q: "Does Dark Mode actually save battery?",
        a: "On iPhones with OLED screens, Dark Mode can meaningfully reduce battery usage since black pixels use little to no power, though the savings vary by how much of the screen is dark in any given app.",
      },
      {
        q: "What's the difference between Night Shift and True Tone?",
        a: "Night Shift shifts the whole display warmer on a schedule you set to reduce blue light in the evening, while True Tone continuously adjusts white balance based on ambient lighting conditions throughout the day, and the two work independently.",
      },
      {
        q: "Will increasing text size make some apps look broken?",
        a: "Occasionally, yes — apps that don't fully support Dynamic Type may truncate or overlap text at very large sizes, which is a limitation of that specific app rather than an iOS setting issue.",
      },
    ],
    tipsAndTricks: [
      "Add a Dark Mode toggle to Control Center for instant switching without opening Settings at all.",
      "Use Display Zoom to get a larger-looking interface across the whole system on supported devices, which is different from just increasing text size.",
      "Long-press the brightness slider in Control Center to reveal Dark Mode, Night Shift, and True Tone toggles in one expanded panel.",
    ],
    relatedSettingIds: ["ios-accessibility", "ios-bluetooth", "ios-privacy-permissions"],
  },
  {
    id: "ios-accessibility",
    title: "Accessibility Settings",
    icon: Accessibility,
    platform: "ios",
    category: "accessibility-language",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Accessibility on iPhone",
    description:
      "Accessibility settings on iPhone include VoiceOver screen reading, Zoom magnification, Voice Control, and many vision, hearing, mobility, and cognitive features.",
    details: [
      "VoiceOver reads the screen aloud and changes touch gestures system-wide.",
      "Zoom lets you magnify all or part of the screen with a simple gesture.",
      "Voice Control lets you navigate and dictate entirely by speaking commands.",
      "Accessibility Shortcut (triple-click the side button) gives one-tap access to your most-used feature.",
    ],
    important:
      "Turning on VoiceOver changes standard tap gestures to selection gestures — review Apple's VoiceOver guide before enabling it for the first time.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/get-started-with-accessibility-features-iph3e2e4367/ios",
    afterImageContent: {
      heading: "Finding the Right Accessibility Feature",
      paragraphs: [
        "Accessibility settings are grouped into Vision, Physical and Motor, Hearing, and General categories.",
        "Most features support the Accessibility Shortcut for quick one-tap or one-click access.",
        "Per-app accessibility settings are also available for some apps that support extra customization.",
      ],
      steps: [
        "Open Settings → Accessibility.",
        "Browse the categories (Vision, Physical and Motor, Hearing, General).",
        "Turn on the feature you need and set up an Accessibility Shortcut if useful.",
      ],
    },
    whyItMatters:
      "Accessibility settings can be the difference between an iPhone being usable or unusable for someone with a vision, hearing, motor, or cognitive difference, but many of these features — like Zoom, Voice Control, and Sound Recognition — are genuinely useful for anyone in the right situation. Because these settings span nearly every part of iOS, this hub consolidates dozens of otherwise scattered options into one place. It's also one of the most frequently overlooked settings screens, meaning many users never discover features that could directly solve a daily frustration they have with their device.",
    bestPractices: [
      "Set up the Accessibility Shortcut (triple-click the side button) for your single most-used feature so you're never digging through menus to turn it on or off.",
      "Try VoiceOver briefly in a low-stakes moment before you actually need it, since it changes standard tap gestures to selection-based gestures system-wide.",
      "Use Zoom's window mode instead of full-screen mode if you only need to magnify part of the screen while keeping the rest at normal size.",
      "Explore Sound Recognition if you're deaf or hard of hearing, since it can alert you to doorbells, alarms, and crying babies via notification.",
    ],
    commonIssues: [
      {
        issue: "VoiceOver was accidentally turned on and normal taps stopped working as expected",
        fix: "Ask Siri to 'turn off VoiceOver', or triple-click the side button if the Accessibility Shortcut was set to VoiceOver, since a single tap now just selects an item rather than activating it.",
      },
      {
        issue: "Zoom gesture (double-tap with two fingers) triggers accidentally during normal use",
        fix: "Turn off Zoom in Settings → Accessibility → Zoom if you don't need it, or practice the exact gesture needed to avoid accidental activation.",
      },
      {
        issue: "Voice Control doesn't recognize commands accurately",
        fix: "Make sure you're in a quiet environment, speak clearly and pause between commands, and try retraining specific custom commands that keep misfiring.",
      },
      {
        issue: "Accessibility Shortcut brings up a menu instead of directly toggling the feature",
        fix: "This happens when more than one feature is assigned to the shortcut — go to Settings → Accessibility → Accessibility Shortcut and select only the single feature you want direct access to.",
      },
    ],
    faqs: [
      {
        q: "Do I need a disability to benefit from Accessibility features?",
        a: "No, many features like Zoom, larger text, Sound Recognition, and Guided Access are broadly useful — for example, Guided Access is popular for locking a phone to one app when handing it to a child.",
      },
      {
        q: "How do I turn off VoiceOver if I enabled it by accident and don't know how to navigate anymore?",
        a: "Ask Siri to 'turn off VoiceOver,' or if configured, triple-click the side button to trigger the Accessibility Shortcut and disable it that way.",
      },
      {
        q: "Can I use different accessibility settings for different apps?",
        a: "Some apps support per-app accessibility customization, but most Accessibility features, like VoiceOver and Zoom, apply system-wide rather than per app.",
      },
    ],
    tipsAndTricks: [
      "Assign more than one feature to the Accessibility Shortcut and it'll present a small menu on triple-click letting you choose which one to toggle.",
      "Use 'Back Tap' (double-tap or triple-tap the back of the iPhone) to trigger shortcuts, screenshots, or accessibility features without touching the screen at all.",
      "Sound Recognition can be trained to alert you specifically to your own smoke alarm, doorbell, or appliance sounds rather than only generic categories.",
    ],
    relatedSettingIds: ["ios-display-brightness", "ios-bluetooth", "ios-screen-time-family"],
  },
  {
    id: "ios-screen-time-family",
    title: "Screen Time & Family",
    icon: Users,
    platform: "ios",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Screen Time & Family Sharing",
    description:
      "Screen Time shows how you (or your family) use your devices and lets you set app limits, downtime schedules, and content restrictions — especially useful when set up through Family Sharing for a child's device.",
    details: [
      "Weekly Screen Time reports break down usage by app and category.",
      "App Limits can cap daily time spent in specific apps or categories.",
      "Downtime schedules block distracting apps during set hours, like bedtime.",
      "Content & Privacy Restrictions can limit explicit content, in-app purchases, and privacy setting changes.",
    ],
    important:
      "A Screen Time passcode is required to change these settings once set — store it somewhere you (or a co-parent) can retrieve if forgotten.",
    redirectUrl: "https://support.apple.com/en-us/108806",
    afterImageContent: {
      heading: "Setting Up Screen Time for a Family Member",
      paragraphs: [
        "Family Sharing lets a parent or guardian manage Screen Time remotely for a child's device.",
        "Requests to extend app time can be sent from the child's device and approved right from a parent's iPhone.",
        "Screen Time settings sync across a person's own devices if they're signed in with the same Apple Account.",
      ],
      steps: [
        "Open Settings → Screen Time.",
        "Tap 'Turn On Screen Time', then set it up for yourself or 'For a Family Member'.",
        "Configure Downtime, App Limits, and Content & Privacy Restrictions.",
        "Set a Screen Time passcode to protect these settings.",
      ],
    },
    whyItMatters:
      "Screen Time turns vague worries about phone use into concrete data, showing exactly which apps are consuming the most time for you or a family member, which is the necessary first step before setting any meaningful limit. For families, it's the primary tool for keeping a child's device age-appropriate — blocking explicit content, restricting in-app purchases, and enforcing bedtime downtime without having to police the phone manually. Because settings are protected by a separate passcode, it also prevents a tech-savvy kid from simply disabling their own restrictions.",
    bestPractices: [
      "Set a Screen Time passcode that's different from the device passcode, and store it somewhere retrievable by another trusted adult if managing a child's device.",
      "Review the weekly Screen Time report together with a family member rather than only using it to enforce limits unilaterally.",
      "Use Downtime scheduled around bedtime rather than blocking apps all day, which tends to be more sustainable and less resented.",
      "Set Content & Privacy Restrictions before handing a device to a child for the first time, rather than retrofitting them after problematic content is already accessible.",
    ],
    commonIssues: [
      {
        issue: "Forgot the Screen Time passcode and can't change any restrictions",
        fix: "Use 'Forgot Passcode?' in Screen Time settings to reset it via Face ID/Touch ID and your Apple Account password, or a parent can reset a linked child's Screen Time passcode from their own device via Family Sharing.",
      },
      {
        issue: "App Limits don't seem to actually block the app once time is up",
        fix: "Confirm 'Block at End of Limit' is enabled rather than just 'Remind Me', since the default reminder-only mode doesn't enforce a hard stop.",
      },
      {
        issue: "A request to extend app time from a child's device never arrives on the parent's phone",
        fix: "Confirm Family Sharing is set up correctly and both devices are signed in to iCloud, since extension requests route through the Family Sharing organizer.",
      },
      {
        issue: "Screen Time reports look inaccurate or show usage on a device you don't recognize",
        fix: "Check that Screen Time isn't combining data across all your own devices signed into the same Apple Account under 'Share Across Devices'.",
      },
    ],
    faqs: [
      {
        q: "Can my child bypass Screen Time restrictions by deleting and reinstalling an app?",
        a: "No, App Limits and Content & Privacy Restrictions are tied to the device and Apple Account settings, not the individual app install, so reinstalling doesn't remove the restriction.",
      },
      {
        q: "What's the difference between App Limits and Downtime?",
        a: "App Limits cap total daily time in specific apps or categories regardless of when they're used, while Downtime blocks broad categories of apps during specific scheduled hours, like overnight.",
      },
      {
        q: "Can I see Screen Time reports for my whole family in one place?",
        a: "Yes, if Family Sharing is set up, the Screen Time app shows a combined view where you can tap into each family member's individual usage and settings.",
      },
    ],
    tipsAndTricks: [
      "Allow 'Always Allowed' apps (like Phone or Messages) to stay accessible even during Downtime, so essential communication isn't blocked.",
      "Use per-category rather than per-app limits (like 'Games' as a whole) to avoid having to configure dozens of individual app limits separately.",
      "Check 'Communication Limits' to control which contacts a child can call or message during Downtime hours, independent of app blocking.",
    ],
    relatedSettingIds: ["ios-privacy-permissions", "ios-accessibility", "ios-face-id-passcode"],
    updateFrequency:
      "Review the weekly Screen Time report every Sunday when it refreshes, and revisit limits whenever a family member's routine or school schedule changes.",
  },
  {
    id: "ios-reset-iphone",
    title: "Reset iPhone",
    icon: RotateCcw,
    platform: "ios",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Reset or Erase Your iPhone",
    description:
      "Reset options let you fix persistent software issues by resetting specific settings (like network or keyboard dictionary) or fully erase the device back to factory defaults.",
    details: [
      "Reset options include Network Settings, Keyboard Dictionary, Home Screen Layout, and full Erase All Content and Settings.",
      "Erasing removes your Apple Account from the device and wipes all personal data.",
      "Back up with iCloud or a computer before erasing if you want to keep your data.",
      "Find My must be turned off before some trade-in or transfer processes will work correctly.",
    ],
    important:
      "This action cannot be undone. Confirm you have a current backup and your Apple Account credentials ready before erasing.",
    redirectUrl: "https://support.apple.com/en-us/108931",
    afterImageContent: {
      heading: "Choosing the Right Reset",
      paragraphs: [
        "A smaller reset (like Network Settings) fixes specific issues without erasing personal data.",
        "Erase All Content and Settings is the option to use before selling, trading in, or giving away your iPhone.",
        "After erasing, the device restarts into the initial Setup Assistant as if it were new.",
      ],
      steps: [
        "Open Settings → General → Transfer or Reset iPhone.",
        "Choose a specific reset, or 'Erase All Content and Settings' for a full wipe.",
        "Confirm your Apple Account and passcode when prompted.",
        "Wait for your device to restart and complete the process.",
      ],
    },
    whyItMatters:
      "Reset options are often the fastest fix for stubborn software glitches — like broken Wi-Fi behavior or a misbehaving keyboard — without requiring a full factory wipe. At the other end of the spectrum, Erase All Content and Settings is the critical last step before selling, trading in, or giving away an iPhone, since it removes your Apple Account and personal data permanently. Understanding the difference between these reset levels prevents both under-reacting to a fixable glitch and over-reacting by wiping a device unnecessarily.",
    bestPractices: [
      "Try a targeted reset (like Network Settings) before jumping straight to a full erase, since most everyday glitches don't require losing all your data.",
      "Confirm you have a current iCloud or computer backup before erasing, and verify it by checking the backup date in Settings first.",
      "Turn off Find My iPhone before initiating a reset connected to trade-in or transfer, since Activation Lock can otherwise block the new owner's setup.",
      "Sign out of your Apple Account only as the final step right before erasing, not earlier, so you don't lose access to Find My protection prematurely.",
    ],
    commonIssues: [
      {
        issue: "Erase All Content and Settings fails partway through or gets stuck",
        fix: "Ensure the device has sufficient battery or is plugged in, then retry; if it remains stuck, connect to a computer and use Finder or iTunes to restore the device instead.",
      },
      {
        issue: "A reset device still shows the previous owner's Apple Account (Activation Lock)",
        fix: "The previous owner needs to remove the device from their Apple Account via Find My or iCloud.com before Activation Lock can be cleared on the new owner's setup.",
      },
      {
        issue: "Reset Network Settings disconnects all saved Wi-Fi passwords and Bluetooth pairings",
        fix: "This is expected — Reset Network Settings clears all saved networks and paired Bluetooth devices, so be prepared to re-enter Wi-Fi passwords and re-pair accessories afterward.",
      },
      {
        issue: "Forgot to back up before erasing and now data seems lost",
        fix: "Check for an existing recent iCloud backup, since automatic backups may have already captured most of your data even without a manual trigger beforehand.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Reset Network Settings and a full erase?",
        a: "Reset Network Settings only clears Wi-Fi passwords, cellular settings, and Bluetooth pairings while keeping all your apps, photos, and personal data intact, whereas a full erase wipes everything on the device back to factory defaults.",
      },
      {
        q: "Do I need to remove my SIM card before erasing my iPhone?",
        a: "It's not required for the erase process itself, but it's a good practical step if you're giving away or trading in the device, so you keep your SIM and phone number.",
      },
      {
        q: "Will erasing my iPhone remove it from Find My automatically?",
        a: "Yes, if you're signed in when you erase, the process automatically signs out of your Apple Account and removes the device from Find My and Activation Lock as part of the standard erase flow.",
      },
    ],
    tipsAndTricks: [
      "Use 'Reset Keyboard Dictionary' specifically if autocorrect keeps suggesting strange or incorrect words it seems to have 'learned' — it clears learned words without touching anything else.",
      "Erase via Settings rather than a computer if possible, since the on-device process automatically handles Activation Lock removal cleanly when you're signed in.",
      "If preparing a device for trade-in, use Apple's own Trade In flow, which prompts you through backup, sign-out, and erase steps in the correct order automatically.",
    ],
    relatedSettingIds: ["ios-icloud-backup", "ios-face-id-passcode", "ios-iphone-storage"],
  },
  {
    id: "ios-notifications",
    title: "Notifications",
    icon: Bell,
    platform: "ios",
    category: "display-sound-notifications",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Notifications on iPhone",
    description:
      "Notification settings let you control exactly how each app alerts you — as a banner, a sound, a badge, or grouped into a scheduled summary — so your Lock Screen and Notification Center reflect what actually deserves your attention.",
    details: [
      "Each app has its own notification style: Banners (temporary or persistent), Sounds, and Badges.",
      "Scheduled Summary bundles non-urgent notifications from chosen apps into one or more delivery times you set.",
      "Lock Screen visibility can be set to Always, When Unlocked Only, or Never per app.",
      "Time Sensitive notifications can bypass a scheduled summary or Focus so urgent alerts still arrive immediately.",
    ],
    important:
      "Government and public safety alerts (like AMBER and Emergency Alerts) cannot be turned off from this screen, by design.",
    redirectUrl: "https://support.apple.com/en-us/HT201925",
    afterImageContent: {
      heading: "How Notifications Work on iPhone",
      paragraphs: [
        "iOS lets you configure notification behavior individually for every installed app rather than applying one global rule.",
        "Notifications can be grouped automatically by app, grouped manually, or shown as individual alerts in the order received.",
        "Scheduled Summary uses on-device intelligence to rank included notifications so the most relevant ones appear near the top.",
      ],
      steps: [
        "Open Settings → Notifications.",
        "Tap an app to customize its Banners, Sounds, Badges, and Lock Screen visibility.",
        "Tap 'Scheduled Summary' to add apps and choose delivery times for bundled, less urgent alerts.",
        "Turn off 'Allow Notifications' entirely for apps you never want to hear from.",
      ],
    },
    whyItMatters:
      "Unmanaged notifications are one of the biggest sources of daily phone distraction, and the difference between a calm Lock Screen and a chaotic one usually comes down to a handful of overly chatty apps. Because each app is configured separately, this screen lets you keep truly important alerts (like messages from people, or delivery updates) immediate while pushing everything else into a scheduled summary instead of an endless stream of interruptions. Getting this right also affects battery life indirectly, since constant notification banners keep waking the screen throughout the day.",
    bestPractices: [
      "Move noisy, non-urgent apps (games, promotional notifications, social media) into Scheduled Summary instead of turning notifications off entirely.",
      "Set Lock Screen visibility to 'When Unlocked Only' for sensitive apps like banking or messaging if you share a room or workspace with others.",
      "Turn off Badges for apps whose unread counts don't reflect anything actionable, like News or a shopping app.",
      "Review notification settings right after installing a new app, since many request an all-or-nothing style by default that's rarely what you actually want.",
      "Reserve 'Persistent' banners only for genuinely important apps, since they require manual dismissal and can pile up if overused.",
    ],
    commonIssues: [
      {
        issue: "An important app's notifications aren't appearing at all",
        fix: "Check Settings → Notifications → [App] to confirm 'Allow Notifications' is on, and that it isn't set to Scheduled Summary only when you need it immediately.",
      },
      {
        issue: "Notifications from one app get silently included in the Scheduled Summary instead of arriving right away",
        fix: "Remove that specific app from the Scheduled Summary list, or mark its notifications as Time Sensitive from within the app if it supports that option.",
      },
      {
        issue: "Too many notifications appear on the Lock Screen even with a passcode set",
        fix: "Set individual apps' Lock Screen visibility to 'When Unlocked Only' rather than relying on a single device-wide privacy setting.",
      },
      {
        issue: "Notification sounds don't match what was chosen in Settings",
        fix: "Some apps use their own in-app sound settings that override the system default — check that app's internal notification preferences as well.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between a Banner and Scheduled Summary?",
        a: "A Banner appears immediately when a notification arrives, while Scheduled Summary holds less urgent notifications from chosen apps and delivers them together at set times you choose, like morning and evening.",
      },
      {
        q: "Can I stop all notifications from an app without deleting it?",
        a: "Yes, turn off 'Allow Notifications' for that app in Settings → Notifications, which silences it completely while keeping the app installed and usable.",
      },
      {
        q: "Do Scheduled Summary notifications still make a sound when they arrive?",
        a: "No, summary notifications are delivered silently as a bundled group at your scheduled time rather than triggering individual sounds or banners.",
      },
    ],
    tipsAndTricks: [
      "Long-press any notification on the Lock Screen or in Notification Center to reveal quick options like muting that app for an hour or a day.",
      "Use 'Notification Grouping' set to 'By App' if you get a lot of alerts from a single chatty app and want them collapsed into one stack.",
    ],
    relatedSettingIds: ["ios-focus", "ios-sounds-haptics", "ios-screen-time-family"],
  },
  {
    id: "ios-sounds-haptics",
    title: "Sounds & Haptics",
    icon: Volume2,
    platform: "ios",
    category: "display-sound-notifications",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Sounds and Haptics on iPhone",
    description:
      "Sounds & Haptics controls ringtone and alert tones, ringer and alert volume, and the tactile vibration feedback (haptics) your iPhone provides for calls, texts, and everyday interactions like typing.",
    details: [
      "Separate tones can be assigned for Ringtone, Text Tone, and other alerts like Mail or Calendar.",
      "The Ringer and Alerts volume slider can be locked, or left adjustable using the physical volume buttons.",
      "System Haptics adds tactile feedback to keyboard taps, toggles, and other interface controls.",
      "Newer iPhones with the Action Button can map a quick press to instantly toggle Silent Mode instead of using a physical switch.",
    ],
    important:
      "Turning off 'Change with Buttons' locks ringer volume to the on-screen slider, so the physical volume buttons will only affect media volume, not calls or alerts.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/change-sounds-and-vibrations-iph07c867f28/ios",
    afterImageContent: {
      heading: "Setting Up Ringtones, Volume, and Haptics",
      paragraphs: [
        "Each alert type (Ringtone, Text Tone, Mail, Calendar, and more) has its own tone and vibration pattern.",
        "You can assign a custom ringtone or vibration pattern to a specific contact so you recognize who's calling without looking.",
        "System Haptics is separate from ringer volume and can be left on even when the phone is silenced.",
      ],
      steps: [
        "Open Settings → Sounds & Haptics.",
        "Drag the Ringer and Alerts slider, or toggle 'Change with Buttons' to use the physical volume buttons instead.",
        "Tap 'Ringtone' or another alert type to choose a sound and vibration pattern.",
        "Toggle 'System Haptics' on or off for tactile feedback throughout iOS.",
      ],
    },
    whyItMatters:
      "The right sound and haptic setup is what lets you tell, without even looking at the phone, whether it's a call, a text, or just a keyboard tap — and getting it wrong means either missing important calls in a noisy environment or being startled by a loud tone in a quiet one. Custom ringtones and vibration patterns per contact are also a practical way to know who's calling before you glance at the screen. Haptics specifically make everyday typing and interface interactions feel more responsive, which is why some people notice their phone feels 'off' after disabling System Haptics without realizing why.",
    bestPractices: [
      "Assign a distinct ringtone or vibration pattern to your most important contacts so you can identify them by feel or sound alone.",
      "Turn off 'Change with Buttons' if you've ever accidentally silenced an important call by pressing the volume buttons in your pocket.",
      "Keep System Haptics on if you rely on tactile confirmation while typing, especially with Haptic Touch interactions elsewhere in iOS.",
      "Lower Ringtone and Text Tone volume independently from media volume if you find yourself constantly adjusting one after watching a video.",
    ],
    commonIssues: [
      {
        issue: "Phone rings much louder or quieter than expected after using the volume buttons during a video",
        fix: "Turn off 'Change with Buttons' under Settings → Sounds & Haptics so media volume and ringer volume are controlled independently.",
      },
      {
        issue: "A custom contact ringtone doesn't play — the default tone plays instead",
        fix: "Confirm the custom tone was properly synced or purchased and is still assigned in the Contacts app entry for that person, since a removed tone silently reverts to default.",
      },
      {
        issue: "Keyboard and toggle switches no longer vibrate when tapped",
        fix: "Check that 'System Haptics' is turned on in Settings → Sounds & Haptics, since it's a single toggle controlling tactile feedback system-wide.",
      },
      {
        issue: "Ringtone plays but there's no vibration, or vice versa",
        fix: "Open the specific Ringtone or Text Tone screen and check that a vibration pattern (not 'None') is selected alongside the chosen sound.",
      },
    ],
    faqs: [
      {
        q: "Can I use my own song as a ringtone?",
        a: "Yes, you can create a ringtone from a song using GarageBand or a third-party tool and sync it to your iPhone, then select it under Settings → Sounds & Haptics → Ringtone.",
      },
      {
        q: "Does turning off System Haptics affect Taptic feedback in games and apps?",
        a: "It mainly affects system-level interface feedback; many third-party apps and games implement their own separate haptic effects that aren't controlled by this single toggle.",
      },
      {
        q: "Why does my phone vibrate even though it's on silent?",
        a: "The silent switch (or Action Button) only mutes ringer and alert sounds; vibration for calls and notifications continues unless you also turn off vibration patterns for those alert types individually.",
      },
    ],
    tipsAndTricks: [
      "Assign a unique vibration pattern (not just sound) to your top contacts so you can identify callers even with the phone face-down and silenced.",
      "Use 'Create New Vibration' under any alert type's vibration menu to tap out a completely custom pattern with your finger.",
    ],
    relatedSettingIds: ["ios-notifications", "ios-display-brightness", "ios-focus"],
  },
  {
    id: "ios-focus",
    title: "Focus",
    icon: Moon,
    platform: "ios",
    category: "display-sound-notifications",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Focus Modes on iPhone",
    description:
      "Focus lets you silence distracting notifications based on what you're doing — like Work, Sleep, or Personal time — while still allowing calls and alerts from specific people or apps you choose to come through.",
    details: [
      "Built-in Focus options include Do Not Disturb, Personal, Work, Sleep, and Driving, plus fully custom Focus modes.",
      "Allowed People and Apps let specific contacts or apps bypass a Focus so their notifications still arrive.",
      "Focus Filters can limit what's shown in supported apps, like hiding non-work calendar events or muting certain Mail accounts.",
      "Share Across Devices syncs your active Focus to other Apple devices signed into the same Apple Account.",
    ],
    important:
      "A Focus can be scheduled to turn on automatically by time, location, or a specific app opening, which can silence notifications without you realizing it's active — check the status bar icon if alerts seem to be missing.",
    redirectUrl: "https://support.apple.com/en-us/HT212608",
    afterImageContent: {
      heading: "Building and Automating a Focus",
      paragraphs: [
        "Each Focus mode has its own separate list of allowed people, apps, and Focus Filters.",
        "Smart Activation can suggest turning a Focus on automatically based on your habits and current context.",
        "When a Focus is on, Messages can let others know your notifications are silenced if they try to reach you.",
      ],
      steps: [
        "Open Settings → Focus.",
        "Select an existing Focus (like Sleep or Work) or tap the '+' to create a custom one.",
        "Add People and Apps allowed to notify you during that Focus.",
        "Set a schedule or automation so the Focus turns on and off automatically.",
      ],
    },
    whyItMatters:
      "Focus is what makes it possible to actually disconnect during sleep or deep work without missing something genuinely urgent, since it separates 'important enough to interrupt me' from 'can wait until later' on a per-person and per-app basis rather than an all-or-nothing silence toggle. Because different Focus modes can carry entirely different allow lists, it also means your phone can behave differently depending on context — quiet during a meeting, but still letting a family member's call through during Sleep. Automations tied to time, location, or app also mean this protection can happen consistently without you remembering to turn it on manually every time.",
    bestPractices: [
      "Set up separate allow lists for Work and Personal Focus modes rather than reusing the same list, since who's urgent during work hours often isn't the same as after.",
      "Schedule Sleep Focus to start automatically before your usual bedtime instead of relying on remembering to turn it on manually.",
      "Use Focus Filters to hide work calendar events and Mail accounts during Personal time, reducing the temptation to check work messages off the clock.",
      "Enable 'Share Across Devices' so your Mac and iPad also respect your active iPhone Focus instead of continuing to ring or notify separately.",
      "Add close family members to your Sleep Focus allow list so a genuine emergency call can still reach you overnight.",
    ],
    commonIssues: [
      {
        issue: "Notifications you expect aren't arriving and you're not sure why",
        fix: "Check the status bar or Settings → Focus for an active Focus mode, since scheduled or location-based automations can turn one on without an obvious prompt.",
      },
      {
        issue: "An important contact's calls are being silenced during Sleep or Work Focus",
        fix: "Add that person to the specific Focus's 'People' allow list, or enable 'Allow Calls From' repeat callers so a second call within three minutes always breaks through.",
      },
      {
        issue: "A Focus schedule doesn't turn off automatically at the expected time",
        fix: "Check for a second overlapping automation (like a location-based trigger) that may be keeping the Focus active past its scheduled end time.",
      },
      {
        issue: "Someone messages you and doesn't realize your notifications are silenced",
        fix: "This is expected unless they're using Messages and you've allowed status sharing — iOS can show a 'Notifications are silenced' indicator to senders when Focus is on and shared.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Do Not Disturb and other Focus modes?",
        a: "Do Not Disturb is one specific built-in Focus, while iOS also supports multiple named Focus modes (like Work, Personal, or Sleep) that each have their own independent allow lists and can be automated separately.",
      },
      {
        q: "Will people know I have Focus turned on?",
        a: "Only if they message you through Messages and you've enabled status sharing — supported apps can then show that your notifications are silenced, though calls and other apps don't disclose this by default.",
      },
      {
        q: "Can I let a specific app always notify me no matter which Focus is active?",
        a: "Yes, adding an app to a Focus's allow list lets its notifications come through during that Focus, and you can repeat this across every Focus mode where you want that app to stay unrestricted.",
      },
    ],
    tipsAndTricks: [
      "Long-press the Focus icon in Control Center for a quick menu to turn any Focus on for a set duration, like 'For 1 hour' or 'Until I leave this location'.",
      "Use a custom Home Screen page tied to a Focus so only relevant apps are visible while that Focus is active, reducing visual temptation to check unrelated apps.",
    ],
    relatedSettingIds: ["ios-notifications", "ios-screen-time-family", "ios-sounds-haptics"],
  },
  {
    id: "ios-battery",
    title: "Battery",
    icon: Battery,
    platform: "ios",
    category: "system-updates",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Check Battery Health and Usage on iPhone",
    description:
      "The Battery screen shows your battery's current health and charging behavior, breaks down which apps used the most power recently, and includes Low Power Mode for stretching a low charge further.",
    details: [
      "Battery Health & Charging shows Maximum Capacity and whether Peak Performance Capability is currently limited.",
      "Optimized Battery Charging learns your daily routine and delays charging past 80% until closer to when you'll unplug.",
      "Battery usage by app is available for both the last 24 hours and the last 10 days, broken down by screen-on and background time.",
      "Low Power Mode reduces background activity, some visual effects, and mail fetch to extend remaining charge for the rest of the day.",
    ],
    important:
      "All rechargeable lithium-ion batteries chemically age over time — a declining Maximum Capacity percentage is normal wear, not necessarily a defect, though very low capacity may warrant a battery service.",
    redirectUrl: "https://support.apple.com/en-us/101575",
    afterImageContent: {
      heading: "Understanding the Battery Screen",
      paragraphs: [
        "Maximum Capacity compares your battery's current full charge to its capacity when new, as a percentage.",
        "iOS may temporarily manage peak performance to prevent unexpected shutdowns if an aged battery can't deliver enough instantaneous power.",
        "The app usage chart identifies exactly which apps drained the most battery recently, split between active use and background activity.",
      ],
      steps: [
        "Open Settings → Battery.",
        "Review the usage chart for the last 24 hours or last 10 days.",
        "Tap 'Battery Health & Charging' to see Maximum Capacity and Optimized Charging status.",
        "Toggle Low Power Mode directly from this screen or from Control Center when you need to stretch a low charge.",
      ],
    },
    whyItMatters:
      "The Battery screen turns 'my phone doesn't last as long as it used to' into a measurable fact by showing Maximum Capacity, which naturally declines through normal chemical aging and directly explains shorter battery life on older devices. The per-app usage breakdown is also one of the fastest ways to diagnose a phone that's draining unusually fast, since a single misbehaving app in the background is a common and fixable culprit. Low Power Mode, meanwhile, is a genuinely useful safety net for getting through the rest of a day on a device that's about to die, without needing to find a charger immediately.",
    bestPractices: [
      "Enable Optimized Battery Charging so your iPhone avoids sitting at 100% charge overnight, which reduces long-term battery wear.",
      "Check the 10-day usage view periodically to catch an app quietly consuming excessive background battery before it becomes a daily annoyance.",
      "Use Low Power Mode proactively when you know you'll be away from a charger for a while, rather than waiting until the battery is critically low.",
      "Avoid extreme heat exposure (like a hot car dashboard), since high temperatures accelerate battery chemical aging more than normal charging cycles do.",
      "Consider a battery service if Maximum Capacity drops well below 80% and you're noticing real day-to-day performance or longevity issues.",
    ],
    commonIssues: [
      {
        issue: "Battery drains noticeably faster than it used to after an iOS update",
        fix: "Give the device a day or two after an update for background indexing to finish, then check Settings → Battery for a specific app using unusually high background power.",
      },
      {
        issue: "Maximum Capacity shows a low percentage and the phone shuts down unexpectedly at low charge",
        fix: "Check whether Peak Performance Capability shows a note about performance management, and consider a battery replacement if the device is out of typical battery health range.",
      },
      {
        issue: "iPhone won't charge past 80% overnight even with Optimized Battery Charging off",
        fix: "Check for a separate Charge Limit setting (on supported models) that may be capping charging independently of Optimized Battery Charging.",
      },
      {
        issue: "Low Power Mode keeps turning itself off after a restart",
        fix: "This is expected — Low Power Mode automatically disables once the battery charges above 80%, and doesn't stay on permanently across charge cycles by design.",
      },
    ],
    faqs: [
      {
        q: "Is it bad for my battery to charge my iPhone overnight?",
        a: "No, Optimized Battery Charging is designed specifically for this — it delays finishing the charge past 80% until shortly before you typically unplug, reducing the time spent at a full charge.",
      },
      {
        q: "Does using Low Power Mode all the time damage my battery?",
        a: "No, Low Power Mode simply reduces power-hungry background activity and doesn't harm the battery; it's safe to leave on indefinitely if you prefer the extended battery life over slightly reduced background performance.",
      },
      {
        q: "What Maximum Capacity percentage means I should replace my battery?",
        a: "Apple doesn't publish one universal cutoff, but many users consider a battery service once capacity falls significantly below 80%, especially if it's paired with noticeable shutdowns or rapid drain.",
      },
    ],
    tipsAndTricks: [
      "Tap the clock icon next to the battery usage chart to switch between 'Last 24 Hours' (hourly detail) and 'Last 10 Days' (daily trend) views.",
      "Add the Low Power Mode toggle to Control Center for one-tap access without opening Settings when your charge is running low.",
    ],
    relatedSettingIds: ["ios-display-brightness", "ios-software-update", "ios-iphone-storage"],
  },
  {
    id: "ios-general-about",
    title: "General & About",
    icon: Info,
    platform: "ios",
    category: "system-info",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "View Device Information on iPhone",
    description:
      "The About screen lists identifying and technical details about your iPhone — name, iOS version, model and serial numbers, storage capacity, and carrier information — that support staff and other apps often need.",
    details: [
      "Device Name is used for AirDrop, Personal Hotspot, and Handoff, and can be renamed at any time.",
      "Model Number, Serial Number, and IMEI/MEID are all listed for warranty, carrier, or support purposes.",
      "Available storage capacity is shown alongside the total, distinct from the more detailed iPhone Storage breakdown.",
      "Legal and regulatory information, along with diagnostic data-sharing preferences, are accessible from this same screen.",
    ],
    important:
      "Never share your Serial Number or IMEI publicly online, since it can be used in scam attempts to falsely report a device as lost or stolen.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/get-information-about-your-iphone-iph3dd5fc7e/ios",
    afterImageContent: {
      heading: "Finding Your Device's Details",
      paragraphs: [
        "The About screen consolidates identifiers that Apple Support, carriers, and third-party services commonly ask for.",
        "Renaming your device here updates how it appears to nearby devices for sharing features like AirDrop.",
        "Diagnostics & Usage settings, found from the same General section, control whether crash data is shared with Apple and app developers.",
      ],
      steps: [
        "Open Settings → General → About.",
        "Scroll to find Model Number, Serial Number, or IMEI as needed.",
        "Tap 'Name' at the top to rename the device for AirDrop and Personal Hotspot.",
      ],
    },
    whyItMatters:
      "The About screen is the fastest way to get exact, verifiable facts about your iPhone — its precise model, iOS version, and unique identifiers — which support calls, warranty claims, carrier transfers, and insurance claims all typically require. Because the device name shown here is what appears to others during AirDrop or Personal Hotspot, an unclear or default name (like 'iPhone') can make it harder to identify your device among several nearby. It's also the quickest place to confirm exactly which iOS version and model you're running before troubleshooting a problem or checking compatibility with a new accessory or app.",
    bestPractices: [
      "Rename your device to something recognizable but not overly personal (avoiding your full name) so it's identifiable during AirDrop without oversharing identity details in public places.",
      "Note down your Serial Number and Model Number somewhere safe before selling, trading in, or sending your device for repair.",
      "Check the exact iOS version here before searching for troubleshooting steps online, since instructions can differ meaningfully between versions.",
      "Review Diagnostics & Usage sharing preferences periodically if you have specific concerns about sharing crash and analytics data.",
    ],
    commonIssues: [
      {
        issue: "Carrier or support staff ask for information you can't immediately find",
        fix: "Open Settings → General → About and scroll through — Model Number, Serial Number, IMEI, and carrier details are all listed together on this one screen.",
      },
      {
        issue: "iPhone shows an unfamiliar or default name to nearby AirDrop users",
        fix: "Tap 'Name' at the top of the About screen and set a clear, recognizable device name.",
      },
      {
        issue: "Unsure which exact iPhone model you own when buying a case or screen protector",
        fix: "Check the Model Number in About and cross-reference it against Apple's published model identifier list to confirm the exact device.",
      },
      {
        issue: "Storage shown in About doesn't match what's listed under iPhone Storage",
        fix: "This is expected — About shows total device capacity, while iPhone Storage reflects usable space after system reserves, so the two numbers won't match exactly.",
      },
    ],
    faqs: [
      {
        q: "Where do I find my iPhone's serial number without the physical device?",
        a: "If you can't access the device, the serial number is often available in Finder or iTunes if it's ever been connected to a computer, on the original packaging, or in your Apple Account's device list.",
      },
      {
        q: "Does renaming my iPhone affect my Apple Account or iCloud settings?",
        a: "No, the device name only affects how it appears locally for features like AirDrop, Personal Hotspot, and Bluetooth pairing, and has no effect on your Apple Account itself.",
      },
      {
        q: "Is it safe to share my iPhone's Model Number with a repair shop?",
        a: "Yes, the Model Number alone is not sensitive, unlike the Serial Number or IMEI, which should be shared only with trusted parties like Apple Support or your carrier.",
      },
    ],
    tipsAndTricks: [
      "Tap the Model Number line to briefly reveal the raw model identifier code (like 'iPhone15,2'), which can help confirm compatibility with certain accessories or older manuals.",
      "Copy the Serial Number directly from the About screen with a long-press instead of retyping it manually when filling out a support or warranty form.",
    ],
    relatedSettingIds: ["ios-software-update", "ios-iphone-storage", "ios-reset-iphone"],
  },
  {
    id: "ios-control-center",
    title: "Control Center",
    icon: SlidersHorizontal,
    platform: "ios",
    category: "personalization",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Control Center on iPhone",
    description:
      "Control Center gives you one-swipe access to frequently used toggles and shortcuts — Wi-Fi, Bluetooth, brightness, Flashlight, and more — and can be fully customized with the specific controls you personally rely on.",
    details: [
      "Controls can be added, removed, and reordered from Settings, including third-party app controls that support it.",
      "Long-pressing (or 3D Touch/Haptic Touch on) many controls reveals an expanded set of related options.",
      "Access from the Lock Screen and Access Within Apps can each be toggled on or off separately for security.",
      "Control Center can span multiple pages, letting you swipe sideways between different groups of controls.",
    ],
    important:
      "Turning off 'Access on Lock Screen' improves security if you lend your phone out or worry about physical access, but also means you'll need to unlock the device for quick toggles like Flashlight.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/use-and-customize-control-center-iph59095ec58/ios",
    afterImageContent: {
      heading: "Adding and Rearranging Controls",
      paragraphs: [
        "The customization screen lists all available controls, separating ones already included from ones you can add.",
        "Reordering controls is done by dragging the grip handle next to each item in the customization list.",
        "Some controls, like Camera or Timer, support press-and-hold for extra shortcuts (like jumping straight to selfie mode).",
      ],
      steps: [
        "Open Settings → Control Center.",
        "Tap the green '+' next to any control to add it, or the red '−' to remove one.",
        "Drag the grip icon on the right to reorder your included controls.",
      ],
    },
    whyItMatters:
      "Control Center is the fastest path to the settings you touch constantly throughout the day, and a customized layout can shave real time off tasks like turning on the flashlight, starting a screen recording, or toggling Airplane Mode before a flight. Because it's reachable from almost anywhere in iOS with a single swipe, what you choose to include here effectively becomes your personal shortcut bar for the whole operating system. Getting the Lock Screen access setting right also matters for security, since some controls could otherwise be triggered by anyone holding a locked phone.",
    bestPractices: [
      "Add controls for features you use daily (like Screen Recording, Low Power Mode, or Notes) rather than leaving only the small default set.",
      "Order your most-used controls near the top-left, since that's typically the fastest area to reach with one hand.",
      "Turn off Lock Screen access for sensitive controls if you frequently hand your phone to others, like children, without unlocking it first.",
      "Long-press seemingly simple controls like Wi-Fi or the Camera icon to discover expanded options you might not know exist, like quick network switching.",
    ],
    commonIssues: [
      {
        issue: "A control you added from Control Center settings doesn't actually appear when swiping down",
        fix: "Confirm you're swiping from the correct corner for your device (top-right on Face ID models, up from the bottom on Touch ID models), since Control Center's gesture location differs by model.",
      },
      {
        issue: "Control Center won't open from the Lock Screen anymore",
        fix: "Check Settings → Face ID & Passcode (or Touch ID & Passcode) → 'Control Center' under Allow Access When Locked, since this can be disabled separately from the main Control Center settings.",
      },
      {
        issue: "Too many controls make Control Center feel cluttered across multiple pages",
        fix: "Remove rarely used controls from Settings → Control Center so your most important toggles fit on the first page.",
      },
      {
        issue: "A third-party app's control doesn't show up in the customization list",
        fix: "Confirm the app has been opened at least once and supports Control Center integration, since not all apps offer a control to add.",
      },
    ],
    faqs: [
      {
        q: "Can I add third-party app controls to Control Center?",
        a: "Yes, apps that support Control Center integration appear in the 'More Controls' list in Settings → Control Center and can be added just like Apple's built-in controls.",
      },
      {
        q: "Why does Control Center open from a different gesture on my iPhone than on a friend's?",
        a: "Face ID iPhones open Control Center with a swipe down from the top-right corner, while older Touch ID iPhones use a swipe up from the bottom edge instead.",
      },
      {
        q: "Is it safe to leave all controls accessible from the Lock Screen?",
        a: "Most controls are low-risk, but a few (like enabling a hotspot or accessing Wallet) could be considered sensitive — disable Lock Screen access entirely if you're concerned about someone using your phone while it's locked.",
      },
    ],
    tipsAndTricks: [
      "Press and hold the brightness or volume sliders in Control Center to reveal additional toggles like Dark Mode, Night Shift, or True Tone in one expanded panel.",
      "Swipe left within Control Center to reach a second page if you've added more controls than fit on the first screen.",
    ],
    relatedSettingIds: ["ios-display-brightness", "ios-bluetooth", "ios-wifi"],
  },
  {
    id: "ios-home-screen-app-library",
    title: "Home Screen & App Library",
    icon: LayoutGrid,
    platform: "ios",
    category: "personalization",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Organize the Home Screen and App Library on iPhone",
    description:
      "Home Screen settings control how new apps are added and how your app pages are arranged, while App Library automatically sorts every installed app into categorized folders you can browse or search without needing a tidy Home Screen at all.",
    details: [
      "App Library is reached by swiping left past your last Home Screen page and groups apps automatically by category.",
      "New apps can be set to install on the Home Screen and App Library, or App Library Only to keep the Home Screen minimal.",
      "Entire Home Screen pages can be hidden (not deleted) from the page-dot editor without removing the apps themselves.",
      "App Library includes a 'Suggestions' folder that surfaces apps based on time of day and usage patterns, plus a 'Recently Added' folder.",
    ],
    important:
      "Hiding a Home Screen page doesn't uninstall its apps — they remain reachable through App Library or Spotlight search even while the page is hidden.",
    redirectUrl: "https://support.apple.com/en-us/108324",
    afterImageContent: {
      heading: "Choosing How Apps Appear",
      paragraphs: [
        "App Library sorts apps into automatically generated categories like Social, Utilities, and Creativity.",
        "The 'Newly Downloaded Apps' setting determines whether future app installs clutter the Home Screen or stay tucked in App Library.",
        "Individual Home Screen pages can be shown or hidden independently from the multi-page dot indicator.",
      ],
      steps: [
        "Touch and hold an empty area of the Home Screen to enter jiggle mode.",
        "Tap the page dots at the bottom to show or hide specific Home Screen pages.",
        "Open Settings → Home Screen to choose whether new apps install to the Home Screen or App Library Only.",
        "Swipe left past your last page to browse or search App Library directly.",
      ],
    },
    whyItMatters:
      "App Library solves the long-standing problem of a Home Screen overwhelmed with dozens of rarely used app icons, by automatically categorizing every installed app so nothing is ever truly lost even if it's not pinned anywhere visible. Setting new downloads to 'App Library Only' keeps a curated, deliberate Home Screen intact instead of every new install landing wherever there's free space. This combination gives you real control over how much visual clutter your phone shows daily, without sacrificing quick access to any app when you actually need it.",
    bestPractices: [
      "Set new app downloads to 'App Library Only' if you want your Home Screen to stay limited to a small, deliberately chosen set of apps.",
      "Hide Home Screen pages you rarely look at instead of leaving them visible and swiping past them out of habit.",
      "Use App Library's search (swipe down or tap the search bar at the top) to open an app quickly instead of hunting across multiple Home Screen pages.",
      "Check the 'Recently Added' folder in App Library after installing several new apps at once to quickly locate and organize them.",
    ],
    commonIssues: [
      {
        issue: "A newly installed app can't be found anywhere on the Home Screen",
        fix: "Check App Library by swiping left past your last page — it's likely there if 'Newly Downloaded Apps' is set to App Library Only.",
      },
      {
        issue: "An entire Home Screen page disappeared unexpectedly",
        fix: "Touch and hold the Home Screen, tap the page dots, and check whether that page was accidentally toggled off rather than the apps being deleted.",
      },
      {
        issue: "App Library categories seem to group unrelated apps together oddly",
        fix: "This is expected behavior since categorization is automatic and based on App Store metadata; there's no manual way to recategorize an app within App Library.",
      },
      {
        issue: "Deleting an app from the Home Screen also seems to remove it everywhere",
        fix: "Tapping 'Remove App' (rather than 'Remove from Home Screen') during jiggle mode fully uninstalls the app; use 'Remove from Home Screen Only' if you just want it out of view but kept in App Library.",
      },
    ],
    faqs: [
      {
        q: "Does hiding a Home Screen page delete the apps on it?",
        a: "No, hiding a page only removes it from view — the apps remain fully installed and accessible through App Library or Spotlight search.",
      },
      {
        q: "What's the difference between removing an app from the Home Screen and deleting it?",
        a: "Removing from the Home Screen keeps the app installed and moves it to App Library only, while deleting uninstalls the app entirely and removes its local data.",
      },
      {
        q: "Can I turn off App Library entirely?",
        a: "No, App Library is a permanent part of iOS and can't be disabled, though you can choose to send new downloads to the Home Screen as well so you rarely need to visit it.",
      },
    ],
    tipsAndTricks: [
      "Tap directly on a folder's small icon preview inside App Library to instantly reveal all the apps in that category without fully opening it.",
      "Swipe down anywhere on a Home Screen page to bring up Spotlight search as a faster alternative to browsing App Library for a specific app.",
    ],
    relatedSettingIds: ["ios-wallpaper", "ios-control-center", "ios-screen-time-family"],
  },
  {
    id: "ios-wallpaper",
    title: "Wallpaper",
    icon: Image,
    platform: "ios",
    category: "personalization",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Change the Wallpaper on iPhone",
    description:
      "Wallpaper settings let you personalize your Lock Screen and Home Screen with photos, curated presets, or Photo Shuffle rotations, plus Lock Screen extras like widgets, filters, and a customizable time display.",
    details: [
      "New wallpapers can be created from your own photos or chosen from preset categories like Weather & Astronomy, Emoji, or Color.",
      "Photo Shuffle rotates through a set of images automatically on a schedule like On Tap, On Lock, Hourly, or Daily.",
      "Lock Screen customization supports adding widgets, applying a photo filter, and changing the font and color of the time.",
      "iPhone 12 and later can generate 3D spatial wallpapers from certain photos for a subtle depth effect.",
    ],
    important:
      "Deleting a wallpaper you're actively using removes it from both the Lock Screen and Home Screen immediately, so switch to a different one first if you want to keep the current look.",
    redirectUrl: "https://support.apple.com/en-us/102638",
    afterImageContent: {
      heading: "Creating and Customizing a Wallpaper",
      paragraphs: [
        "Touching and holding the Lock Screen opens the wallpaper gallery, where you can add, edit, or switch between saved wallpapers.",
        "Each wallpaper is actually a linked pair — one for the Lock Screen, one for the Home Screen — that can be set to match or differ.",
        "Spatial wallpapers take a moment to generate, showing a 'Generating Spatial Scene' message before they're ready to apply.",
      ],
      steps: [
        "Touch and hold an empty area of the Lock Screen until the wallpaper gallery appears.",
        "Tap the '+' button to create a new wallpaper from Photos, a preset, or Photo Shuffle.",
        "Customize widgets, filters, and time style, then tap 'Add' to save it.",
        "Swipe between saved wallpapers and tap one to set it as active.",
      ],
    },
    whyItMatters:
      "Wallpaper is one of the most visible personalization choices on an iPhone, since it's the first thing you see dozens of times a day, and it also does real functional work through Lock Screen widgets that surface information like weather, battery, or calendar events at a glance. Photo Shuffle turns a static wallpaper into a small rotating slideshow of meaningful photos without any manual effort. Because Lock Screen and Home Screen wallpapers are linked as a pair, understanding how to set them independently (or intentionally match them) gives more control over the overall look than most people realize is available.",
    bestPractices: [
      "Use Photo Shuffle with a curated album of favorite photos if you want variety without manually changing the wallpaper yourself.",
      "Add a widget (like Weather or Calendar) to the Lock Screen wallpaper so useful information is visible without unlocking the phone.",
      "Choose a Lock Screen font and color that stays readable against your chosen photo, especially with busy or high-contrast images.",
      "Keep a small library of saved wallpapers rather than only one, so switching your look takes a single tap from the gallery instead of starting from scratch.",
    ],
    commonIssues: [
      {
        issue: "Changing the Home Screen wallpaper unexpectedly changes the Lock Screen too, or vice versa",
        fix: "Wallpapers are saved as a linked pair by default; when creating a new one, choose to set the Home Screen and Lock Screen independently if you don't want them to match.",
      },
      {
        issue: "A wallpaper widget stops updating with current information",
        fix: "Confirm the underlying app (like Weather or Calendar) has background refresh and location access enabled, since the widget relies on that app's own data permissions.",
      },
      {
        issue: "Spatial wallpaper option isn't available for a particular photo",
        fix: "Spatial wallpapers require a compatible photo and an iPhone 12 or later; not every image qualifies for the depth effect to generate correctly.",
      },
      {
        issue: "Deleted a wallpaper by accident and want it back",
        fix: "If it was created from a personal photo, that photo still exists in your library — simply create a new wallpaper from it again with the same customization choices.",
      },
    ],
    faqs: [
      {
        q: "Can I set different wallpapers for the Lock Screen and Home Screen?",
        a: "Yes, when creating or editing a wallpaper you can unlink the pair and choose separate images or styles for each screen instead of having them match.",
      },
      {
        q: "Does Photo Shuffle use my whole photo library or just certain albums?",
        a: "You choose the source — it can pull from a specific album, a smart category like Nature or Pets, or your full library, depending on what you select when setting it up.",
      },
      {
        q: "Do wallpaper widgets drain extra battery?",
        a: "Lock Screen widgets have a minimal impact since they update using the same efficient background refresh mechanisms as Home Screen widgets, not constant live tracking.",
      },
    ],
    tipsAndTricks: [
      "Use a Live Photo as your Lock Screen wallpaper and press firmly (or touch and hold on newer models) to play its motion and sound right from the Lock Screen.",
      "Tap the color dots below a photo wallpaper's preview to quickly try different tinted filter options before committing to one.",
    ],
    relatedSettingIds: ["ios-display-brightness", "ios-home-screen-app-library", "ios-control-center"],
  },
  {
    id: "ios-standby-lock-screen",
    title: "Lock Screen & StandBy",
    icon: Clock4,
    platform: "ios",
    category: "personalization",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Use StandBy and Customize the Lock Screen on iPhone",
    description:
      "StandBy turns your iPhone into a glanceable bedside display of clocks, widgets, and Live Activities whenever it's charging and turned sideways, while Lock Screen settings control what you see without unlocking the device at all.",
    details: [
      "StandBy activates automatically when the iPhone is charging, in landscape orientation, and the screen is locked.",
      "StandBy screens cycle between Clock, Photos, and Widgets views with a swipe, and each remembers its own last state.",
      "Night mode dims StandBy to a red-tinted display in low light so it's less disruptive on a nightstand.",
      "Tapping a StandBy screen once wakes it fully; a second tap can open the related app if Always-On features are supported.",
    ],
    important:
      "StandBy requires a stand, dock, or case that keeps the iPhone propped in landscape while charging — it won't activate lying flat on its back.",
    redirectUrl: "https://support.apple.com/guide/iphone/iph878d77632/ios",
    afterImageContent: {
      heading: "How StandBy Works on iPhone",
      paragraphs: [
        "StandBy detects charging plus landscape orientation and switches automatically to a large-format display within seconds.",
        "On iPhone 14 Pro and later with an always-on display, StandBy can stay dimly visible continuously instead of turning off between glances.",
        "Widgets shown in StandBy are the same interactive widgets available on your Home Screen, just resized for a distance view.",
      ],
      steps: [
        "Plug your iPhone in to charge and prop it up sideways.",
        "Wait a couple of seconds for StandBy to appear automatically.",
        "Swipe left or right to switch between Clock, Photos, and Widgets.",
        "Open Settings → StandBy to adjust Night Mode, Motion to Wake, and default screens.",
      ],
    },
    whyItMatters:
      "StandBy converts an idle charging phone into a useful bedside or desk display without buying a separate smart display or clock, showing the time, calendar events, and Live Activities at a glance. Because it only appears under specific conditions (charging, landscape, locked), understanding those requirements is the difference between it working reliably every night and never appearing at all. It's also worth configuring deliberately since a bright, non-dimmed StandBy screen can be genuinely disruptive on a nightstand if Night Mode isn't set up correctly.",
    bestPractices: [
      "Use a stand or MagSafe dock that reliably holds the iPhone in landscape, since a wobbly or flat charging setup will prevent StandBy from triggering consistently.",
      "Turn on Night Mode so StandBy automatically dims and tints red in a dark bedroom instead of staying at full brightness.",
      "Add Live Activities-aware widgets (like a timer or delivery tracker) to StandBy so in-progress activities stay visible while charging.",
      "Set a default StandBy screen (Clock, Photos, or Widgets) that matches what you actually check most, since it reopens to your last view otherwise.",
      "Disable 'Motion to Wake' if you find StandBy lighting up too often from small vibrations or nearby movement overnight.",
    ],
    commonIssues: [
      {
        issue: "StandBy never appears even though the iPhone is charging",
        fix: "Confirm the device is actually in landscape orientation and the screen is locked — StandBy won't trigger in portrait or while actively in use, and some third-party chargers may not be recognized reliably.",
      },
      {
        issue: "StandBy is too bright at night despite the room being dark",
        fix: "Turn on Night Mode in Settings → StandBy, which only tints and dims automatically once ambient light is low enough for the sensor to detect.",
      },
      {
        issue: "Tapping a StandBy widget doesn't do anything",
        fix: "Tap once to wake the display fully out of its dimmed state first — the first tap after inactivity only wakes the screen rather than activating the widget underneath it.",
      },
      {
        issue: "StandBy keeps switching back to the Clock screen instead of Widgets",
        fix: "Swipe to your preferred screen right before unplugging, since StandBy resumes from whichever view was active the last time it closed.",
      },
    ],
    faqs: [
      {
        q: "Does StandBy work with any charger?",
        a: "It works with any charging method — MagSafe, a Qi charger, or a Lightning/USB-C cable — as long as the iPhone is propped in landscape orientation while charging.",
      },
      {
        q: "Does StandBy drain the battery while charging?",
        a: "No, since the iPhone is plugged in while StandBy is active, the display itself doesn't meaningfully affect charging speed or overall battery health.",
      },
      {
        q: "Can I stop StandBy from turning on automatically?",
        a: "Yes, StandBy can be turned off entirely in Settings → StandBy if you'd rather your Lock Screen stay dark or in its normal locked state while charging.",
      },
    ],
    tipsAndTricks: [
      "Long-press any StandBy screen to access customization options for widgets, clock styles, or photo shuffle sources directly from that view.",
      "Pair StandBy with a Focus mode like Sleep so notifications stay quiet while the display still shows the time and any allowed alerts.",
    ],
    relatedSettingIds: ["ios-wallpaper", "ios-display-brightness", "ios-control-center"],
  },
  {
    id: "ios-location-services",
    title: "Location Services",
    icon: MapPin,
    platform: "ios",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Control Location Services on iPhone",
    description:
      "Location Services is the master switch and per-app control center for GPS-based location sharing on iPhone, letting you decide exactly which apps can see your precise or general location, and when.",
    details: [
      "A master Location Services toggle can disable location access for every app and system service at once.",
      "Each app can independently be set to Never, Ask Next Time, While Using the App, or Always.",
      "System Services (like Find My, Emergency Calls & SOS, and Significant Locations) are listed separately from regular apps.",
      "An arrow icon next to an app in the main Settings list indicates recent or current location use — solid for active, hollow for recent.",
    ],
    important:
      "Turning off Location Services entirely disables Find My iPhone's ability to locate the device, which removes an important anti-theft and lost-device recovery tool.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/control-the-location-information-you-share-iph3dd5f9be/ios",
    afterImageContent: {
      heading: "How Location Permissions Work on iPhone",
      paragraphs: [
        "iOS evaluates location access per app rather than as one blanket permission, so different apps can have entirely different access levels.",
        "Precise Location can be turned off independently, giving an app only your general area instead of exact GPS coordinates.",
        "System Services groups background location features that support Apple's own apps and device security separately from third-party apps.",
      ],
      steps: [
        "Open Settings → Privacy & Security → Location Services.",
        "Confirm the master toggle at the top is on.",
        "Tap an individual app to set its access level and toggle Precise Location.",
        "Scroll to System Services to review background location features like Find My and Significant Locations.",
      ],
    },
    whyItMatters:
      "Location data is some of the most sensitive information your iPhone handles, since it can reveal where you live, work, and travel over time, so granular per-app control is central to real privacy on the device. At the same time, Location Services powers genuinely useful features — accurate navigation, Find My device tracking, and location-based reminders — that stop working correctly if access is revoked too aggressively. Getting this setting right means balancing real privacy protection against not accidentally breaking the exact features you rely on daily.",
    bestPractices: [
      "Set most apps to 'While Using the App' rather than 'Always', reserving 'Always' for genuine background needs like Find My or a delivery-tracking app.",
      "Turn off Precise Location for apps like weather or retail that only need your general area, keeping exact coordinates private.",
      "Review the solid and hollow arrow indicators in the main Settings list periodically to spot apps using location more than expected.",
      "Keep Find My enabled under System Services even if you're cautious elsewhere, since it's one of the most effective tools for recovering a lost or stolen iPhone.",
      "Reset a specific app's location permission back to 'Ask Next Time' if you're unsure it still needs access, rather than leaving old grants unreviewed indefinitely.",
    ],
    commonIssues: [
      {
        issue: "Maps or a navigation app can't find your current position",
        fix: "Check that Location Services is on globally and that the specific app's permission is set to 'While Using the App' or 'Always', not 'Never'.",
      },
      {
        issue: "Find My shows an old or inaccurate last known location",
        fix: "Confirm Location Services and Find My are both enabled under System Services, and that the device has had a recent Wi-Fi or cellular connection to report its position.",
      },
      {
        issue: "Battery seems to drain faster after granting an app 'Always' location access",
        fix: "Change that app's permission to 'While Using the App' unless background tracking is genuinely required, since constant background location checks are one of the more power-hungry permissions.",
      },
      {
        issue: "An app keeps asking for location access even after it was denied once",
        fix: "This is expected for apps whose core function depends on location; if it's intrusive, set it explicitly to 'Never' in Settings → Privacy & Security → Location Services rather than dismissing the in-app prompt repeatedly.",
      },
    ],
    faqs: [
      {
        q: "Does turning off Location Services stop Find My from working?",
        a: "Yes, disabling the master Location Services toggle also disables Find My's ability to report the device's current location, which removes a key anti-theft protection.",
      },
      {
        q: "What's the difference between Precise and general location?",
        a: "Precise Location gives an app your exact GPS coordinates, while turning it off limits that app to a roughly 25-square-kilometer area, which is often enough for weather or local search without exposing your exact position.",
      },
      {
        q: "Can I tell if an app used my location recently without opening its settings?",
        a: "Yes, a solid purple arrow next to an app in the main Settings list means it used location in the last 24 hours, while an outlined arrow means it has geofencing set up but hasn't used it recently.",
      },
    ],
    tipsAndTricks: [
      "Tap 'System Services' at the very bottom of the Location Services screen to review background features like Location-Based Suggestions and Routing & Traffic individually.",
      "Use 'Ask Next Time' instead of a permanent Never/Always choice for apps you use only occasionally, so you're prompted fresh each time it's relevant.",
    ],
    relatedSettingIds: ["ios-privacy-permissions", "ios-battery", "ios-cellular-data"],
    updateFrequency:
      "Review per-app location permissions every couple of months, and immediately after installing any app that requests it.",
  },
  {
    id: "ios-cellular-data",
    title: "Cellular",
    icon: Signal,
    platform: "ios",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Cellular Data on iPhone",
    description:
      "Cellular settings control your mobile data connection, including which apps can use cellular data, whether 5G or data roaming is allowed, and how much of your monthly plan each app has consumed.",
    details: [
      "Cellular Data can be toggled per app, letting you block specific apps from using mobile data while still allowing Wi-Fi.",
      "5G options (Auto, 5G On, or 5G Standalone) balance faster speeds against battery usage depending on your carrier and coverage.",
      "Data Roaming must be turned on separately to use cellular data while traveling internationally, and can incur significant charges if misconfigured.",
      "The Cellular Data Usage section shows how much data each app has used since the current stats were last reset.",
    ],
    important:
      "Cellular data usage statistics only reset when you manually tap 'Reset Statistics' — they don't automatically align with your carrier's monthly billing cycle.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/view-or-change-cellular-data-settings-iph3dd5f213/ios",
    afterImageContent: {
      heading: "Understanding Cellular Settings",
      paragraphs: [
        "The Cellular screen lists every app with its own on/off switch for using mobile data independently of Wi-Fi.",
        "Dual SIM and eSIM users can choose a default line for cellular data and calls, plus configure automatic switching between lines.",
        "Wi-Fi Assist can automatically switch to cellular when a Wi-Fi connection is weak, which is worth knowing about if data usage looks unexpectedly high.",
      ],
      steps: [
        "Open Settings → Cellular (or Mobile Data).",
        "Toggle Cellular Data on or off for individual apps under the app list.",
        "Tap 'Cellular Data Options' to adjust 5G settings, Data Roaming, or reset usage statistics.",
        "Review the usage breakdown to see which apps have consumed the most mobile data.",
      ],
    },
    whyItMatters:
      "Cellular settings directly control your monthly data bill, since large apps like video streaming or cloud backup services can quietly burn through a limited plan if left unrestricted. Data Roaming in particular carries real financial risk, as leaving it on unknowingly while traveling internationally can result in unexpectedly large charges. Per-app cellular toggles also give fine-grained control that a blanket 'Wi-Fi only' device setting can't offer, letting essential apps like Messages or Maps stay connected everywhere while data-heavy apps wait for Wi-Fi.",
    bestPractices: [
      "Turn off Cellular Data for large, non-essential apps (like a video streaming or backup app) if you're on a limited data plan, so they only sync over Wi-Fi.",
      "Turn off Data Roaming before international travel unless your carrier plan specifically includes it, and re-enable only the components (voice, data) your plan supports.",
      "Reset cellular usage statistics on the same day your billing cycle starts each month, so the on-device numbers actually match your carrier's bill.",
      "Set 5G to 'Auto' rather than 'On' if battery life matters more to you than maximizing peak speeds in areas with inconsistent 5G coverage.",
      "Check the Cellular Data Usage list before a trip to identify which apps are worth temporarily restricting while relying on a limited roaming plan.",
    ],
    commonIssues: [
      {
        issue: "An app won't load data or update outside of Wi-Fi",
        fix: "Check Settings → Cellular and confirm that specific app's Cellular Data toggle is turned on, since it may have been disabled intentionally or by an automatic data-saving setting.",
      },
      {
        issue: "Unexpectedly large charges appear after international travel",
        fix: "Verify Data Roaming was off for the trip, or confirm with your carrier that an international plan was active, since roaming data outside a covered plan is billed at a much higher rate.",
      },
      {
        issue: "Cellular Data Usage numbers don't match the carrier's app or bill",
        fix: "Remember these on-device statistics only reset manually and measure raw app usage, not your carrier's specific billing cycle or any Wi-Fi-based data included in your plan.",
      },
      {
        issue: "5G doesn't seem to connect even though it's turned on",
        fix: "5G availability depends on carrier coverage in your specific location — 'Auto' mode will fall back to LTE automatically where 5G isn't available or would drain battery faster than it's worth.",
      },
    ],
    faqs: [
      {
        q: "Does turning off Cellular Data for an app stop it from working entirely?",
        a: "No, it only prevents that app from using mobile data — it will still function normally whenever the iPhone is connected to Wi-Fi.",
      },
      {
        q: "Is 5G Standalone always faster than 5G Auto?",
        a: "Not necessarily — Standalone can offer higher peak speeds on supported networks but typically uses more battery, while Auto intelligently balances speed and power based on your carrier's actual coverage.",
      },
      {
        q: "Why does my data usage look wrong right after I reset the statistics?",
        a: "Resetting only clears the counters, not your carrier's actual billing record, so a brief mismatch is normal until a new full cycle of usage accumulates on-device.",
      },
    ],
    tipsAndTricks: [
      "Turn off 'Wi-Fi Assist' if you want your iPhone to strictly stay on a weak Wi-Fi signal instead of quietly switching to cellular data and consuming your plan.",
      "Set a reminder to reset Cellular Data Usage on your billing date each month, so the app-by-app breakdown always reflects the current cycle accurately.",
    ],
    relatedSettingIds: ["ios-wifi", "ios-personal-hotspot", "ios-vpn"],
  },
  {
    id: "ios-personal-hotspot",
    title: "Personal Hotspot",
    icon: Router,
    platform: "ios",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Share Your iPhone's Internet Connection with Personal Hotspot",
    description:
      "Personal Hotspot turns your iPhone's cellular data connection into a temporary Wi-Fi, USB, or Bluetooth network that other devices like a laptop, tablet, or another phone can join for internet access.",
    details: [
      "Nearby Apple devices signed into the same Apple Account can join automatically via Instant Hotspot without entering a password.",
      "Other devices join like any Wi-Fi network, using the hotspot's name and password shown right on the Personal Hotspot screen.",
      "Connecting over USB or Bluetooth instead of Wi-Fi can noticeably extend your iPhone's battery life while hotspotting.",
      "'Maximize Compatibility' can be turned on if certain older or non-Apple devices have trouble joining the hotspot's default network.",
    ],
    important:
      "Personal Hotspot uses your cellular data plan, so heavy use — like streaming video on a connected laptop — can consume a large amount of data quickly if your plan has a cap.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/share-internet-connection-personal-hotspot-iph45447ca6/ios",
    afterImageContent: {
      heading: "Turning On and Joining a Personal Hotspot",
      paragraphs: [
        "The Personal Hotspot screen displays the network name and password that other devices need to join over Wi-Fi.",
        "Instant Hotspot lets a nearby iPad or Mac join with a single tap, without you needing to manually turn on the hotspot first on some setups.",
        "A blue status bar or banner appears on the iPhone whenever another device is actively connected to the hotspot.",
      ],
      steps: [
        "Open Settings → Personal Hotspot.",
        "Turn on 'Allow Others to Join'.",
        "On the connecting device, choose your iPhone's hotspot network from its Wi-Fi list and enter the shown password.",
        "Confirm the connected devices count updates on your iPhone's Personal Hotspot screen.",
      ],
    },
    whyItMatters:
      "Personal Hotspot is often the difference between staying productive and losing connectivity entirely when traveling, working remotely, or dealing with an outage on a home or office network. Because it draws on the same cellular data plan used for everything else on the iPhone, understanding how it consumes data helps avoid an unpleasant overage surprise after a few hours of laptop use over a hotspot. It's also a genuinely convenient bridge between Apple devices thanks to Instant Hotspot, removing the friction of manually entering a password every time a nearby iPad needs a quick connection.",
    bestPractices: [
      "Change the default hotspot password to something memorable but not guessable if you share it with others regularly, like a coworking group or family.",
      "Prefer a USB or Bluetooth connection over Wi-Fi for a connected laptop when battery life matters more than maximum throughput.",
      "Monitor Cellular Data Usage while hotspotting for an extended session, since a connected computer can consume data far faster than the iPhone alone typically would.",
      "Turn on 'Maximize Compatibility' only if a specific device fails to join normally, since it can reduce hotspot performance for devices that connect fine already.",
      "Turn off 'Allow Others to Join' when you're done, rather than leaving the hotspot broadcasting and available indefinitely.",
    ],
    commonIssues: [
      {
        issue: "A laptop or other device can't find the iPhone's hotspot in its Wi-Fi list",
        fix: "Confirm 'Allow Others to Join' is turned on and the iPhone has an active cellular data connection, since Personal Hotspot requires cellular data to actually function.",
      },
      {
        issue: "Instant Hotspot doesn't appear as an option on a nearby Mac or iPad",
        fix: "Ensure both devices are signed into the same Apple Account with Wi-Fi and Bluetooth turned on, since Instant Hotspot relies on that pairing to detect nearby devices automatically.",
      },
      {
        issue: "Hotspot connection drops repeatedly during use",
        fix: "Move the connected device closer to the iPhone, check for a weak cellular signal, or switch the connection method to USB for a more stable link.",
      },
      {
        issue: "Cellular data plan runs out much faster than expected while hotspotting",
        fix: "Check Cellular Data Usage to see actual consumption, and avoid data-heavy activities like video streaming or large downloads over the hotspot on a limited plan.",
      },
    ],
    faqs: [
      {
        q: "Does Personal Hotspot use Wi-Fi data or cellular data?",
        a: "It uses your iPhone's cellular data connection, converting it into Wi-Fi, USB, or Bluetooth access for other devices — it does not use or require a separate Wi-Fi connection.",
      },
      {
        q: "Can I use Personal Hotspot and be connected to a separate Wi-Fi network at the same time?",
        a: "Generally no on the iPhone itself, since turning on the hotspot uses the cellular connection for others while the iPhone stays on its own network path; some device configurations vary slightly by carrier.",
      },
      {
        q: "How many devices can join my Personal Hotspot at once?",
        a: "The exact limit varies by carrier and iPhone model, but most plans support at least a handful of simultaneous connected devices sharing the same cellular connection.",
      },
    ],
    tipsAndTricks: [
      "Tap the Personal Hotspot password field to reveal and quickly copy it instead of manually typing a long generated password on the connecting device.",
      "Rename your iPhone under General → About if the hotspot network name showing up for others is unclear or overly generic.",
    ],
    relatedSettingIds: ["ios-wifi", "ios-cellular-data", "ios-bluetooth"],
  },
  {
    id: "ios-vpn",
    title: "VPN",
    icon: ShieldCheck,
    platform: "ios",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Connect Your iPhone to a VPN",
    description:
      "VPN settings let your iPhone route its network traffic through a virtual private network, commonly used to access a workplace network securely or to add an extra layer of privacy on public Wi-Fi.",
    details: [
      "Most VPN setups require installing a VPN app from the App Store, which then adds its configuration to Settings → VPN automatically.",
      "A VPN status indicator appears at the top of the screen whenever a VPN connection is actively in use.",
      "'Connect On Demand' can be configured so the VPN activates automatically for specific network conditions without a manual toggle.",
      "Organizations often deploy VPN configurations remotely through a device management profile rather than manual setup.",
    ],
    important:
      "A VPN reroutes all network traffic through its own servers, so only install a VPN app or profile from a source (employer or reputable provider) you genuinely trust.",
    redirectUrl: "https://support.apple.com/guide/iphone/use-vpn-iph45f7e324/13.0/ios/13.0",
    afterImageContent: {
      heading: "Setting Up and Using a VPN",
      paragraphs: [
        "Once a VPN app is installed and configured, its connection toggle typically appears both within the app and in Settings → VPN.",
        "A small VPN icon in the status bar confirms the connection is active system-wide, not just within the VPN app itself.",
        "Work or school VPN profiles installed via device management usually connect automatically without requiring you to open the VPN app manually.",
      ],
      steps: [
        "Install a VPN app from the App Store, or receive a VPN profile from your organization.",
        "Follow the app's in-app setup to authenticate and configure the connection.",
        "Open Settings → VPN and toggle the connection on if it isn't already active.",
        "Confirm the VPN status icon appears in the status bar once connected.",
      ],
    },
    whyItMatters:
      "A VPN is often the only way to securely reach internal company resources, like file servers or intranet tools, from outside the office, making it essential infrastructure for remote and hybrid work rather than an optional privacy add-on. On public or untrusted Wi-Fi, a reputable VPN also adds a real layer of protection against network-level snooping that Wi-Fi encryption alone doesn't fully address. Because a VPN sees all your routed traffic, this is also one of the settings where trusting the wrong provider can undermine the very privacy or security you're trying to add.",
    bestPractices: [
      "Only install a VPN app or accept a VPN profile from your employer or a well-reviewed, reputable provider, since it can see and route all your traffic.",
      "Use 'Connect On Demand' rules so a work VPN activates automatically only when needed, rather than manually remembering to toggle it each time.",
      "Check for the VPN status icon in the status bar after connecting to confirm traffic is actually being routed through it, not just that the app reports 'connected'.",
      "Remove old or unused VPN configurations from Settings → VPN & Device Management to avoid confusion between multiple saved connections.",
      "Contact your IT administrator directly for setup details rather than guessing at server or authentication settings for a work VPN.",
    ],
    commonIssues: [
      {
        issue: "VPN connects but internal work resources still aren't reachable",
        fix: "Confirm with your IT department that the correct VPN profile and authentication method are configured, since a successful VPN connection doesn't guarantee correct routing rules for internal servers.",
      },
      {
        issue: "VPN disconnects randomly throughout the day",
        fix: "Check whether 'Connect On Demand' rules are causing it to drop on certain networks, and confirm the VPN app itself has background app refresh enabled.",
      },
      {
        issue: "No VPN option appears in Settings even after installing a VPN app",
        fix: "Open the VPN app itself and complete its in-app setup first — Settings → VPN typically only shows a configuration after the app has registered one during setup.",
      },
      {
        issue: "Internet feels noticeably slower with the VPN turned on",
        fix: "This is expected to some degree since traffic takes a longer path through the VPN server, but try a different server location within the app if speeds seem unusually poor.",
      },
    ],
    faqs: [
      {
        q: "Do I need a VPN app, or does iPhone have one built in?",
        a: "iPhone doesn't include a general-purpose consumer VPN service built in — you need to install a VPN app from the App Store or receive a configuration profile from an organization to connect to one.",
      },
      {
        q: "Can my employer see everything I do on my personal iPhone if I install their VPN?",
        a: "A work VPN profile can typically only see traffic while the VPN is actively connected and routed through it, not your device's activity outside that connection, though exact visibility depends on how the organization's profile is configured.",
      },
      {
        q: "Does a VPN make public Wi-Fi completely safe to use?",
        a: "It substantially reduces certain risks like network-level snooping, but it doesn't protect against every threat, such as visiting a malicious website or entering credentials into a phishing page.",
      },
    ],
    tipsAndTricks: [
      "Look for the small 'VPN' label next to the time in the status bar as the quickest way to confirm a connection is actually active.",
      "Check Settings → General → VPN & Device Management to see all installed VPN configurations and any management profiles in one place.",
    ],
    relatedSettingIds: ["ios-wifi", "ios-privacy-permissions", "ios-cellular-data"],
  },
  {
    id: "ios-airdrop",
    title: "AirDrop",
    icon: Share2,
    platform: "ios",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Share Files with AirDrop on iPhone",
    description:
      "AirDrop lets you instantly send photos, documents, links, and more to nearby iPhones, iPads, and Macs using a combination of Wi-Fi and Bluetooth, without needing the same network or an internet connection.",
    details: [
      "Receiving options include Contacts Only, Everyone for 10 Minutes, and Receiving Off, controlling who can send you files.",
      "Both Wi-Fi and Bluetooth must be turned on for AirDrop to detect and connect to nearby devices.",
      "On iPhone 15 and later with iOS 17 or later, holding two iPhones close together starts an AirDrop transfer automatically.",
      "Transfers happen over a direct peer-to-peer connection, so no internet connection or shared Wi-Fi network is required.",
    ],
    important:
      "Setting AirDrop to 'Everyone for 10 Minutes' briefly exposes you to file requests from any nearby stranger's device, not just people you know — it automatically reverts afterward for this reason.",
    redirectUrl: "https://support.apple.com/en-us/HT204144",
    afterImageContent: {
      heading: "Sending and Receiving with AirDrop",
      paragraphs: [
        "AirDrop appears as a share sheet option throughout iOS, in Photos, Safari, Files, and most apps with shareable content.",
        "Nearby compatible devices with AirDrop discoverable appear as icons you can tap to send directly to.",
        "The recipient sees a preview and must accept the incoming item before it's saved to their device.",
      ],
      steps: [
        "Open Settings → General → AirDrop and choose Contacts Only or Everyone for 10 Minutes.",
        "In the app you're sharing from, tap the Share icon.",
        "Tap AirDrop, then tap the nearby device you want to send to.",
        "Wait for the recipient to accept the transfer.",
      ],
    },
    whyItMatters:
      "AirDrop remains one of the fastest ways to move files between Apple devices, often completing large transfers in seconds without needing cables, cloud uploads, or a shared network. Because its visibility setting determines who can even attempt to send you something, understanding Contacts Only versus Everyone is a meaningful privacy decision, not just a connectivity preference. It's also relied on constantly in everyday situations — sharing a photo after a group event, sending a boarding pass, or handing off a document in a meeting — making it one of the more frequently touched settings on the device despite rarely needing adjustment.",
    bestPractices: [
      "Keep AirDrop set to 'Contacts Only' as your default, switching to 'Everyone for 10 Minutes' only when you specifically need to receive from someone not in your Contacts.",
      "Turn on both Wi-Fi and Bluetooth before attempting an AirDrop transfer, since either being off will prevent devices from discovering each other.",
      "Confirm the recipient's name and device preview before accepting an AirDrop transfer from someone you don't recognize.",
      "Use AirDrop for large files like videos instead of Messages when both devices are nearby, since it transfers at full quality without any compression.",
    ],
    commonIssues: [
      {
        issue: "A nearby device doesn't appear as an AirDrop option",
        fix: "Confirm both devices have Wi-Fi and Bluetooth turned on, are unlocked, and are within roughly 30 feet of each other, and check the receiving device's AirDrop setting isn't set to 'Receiving Off'.",
      },
      {
        issue: "AirDrop transfer starts but gets stuck or fails partway through",
        fix: "Move the devices closer together and disable Personal Hotspot temporarily on either device, since an active hotspot can sometimes interfere with the Wi-Fi Direct connection AirDrop uses.",
      },
      {
        issue: "Set AirDrop to 'Everyone for 10 Minutes' but it reverted to Contacts Only unexpectedly",
        fix: "This is expected behavior by design — the Everyone setting automatically times out after 10 minutes as a security precaution and needs to be re-enabled if still needed.",
      },
      {
        issue: "Receiving unwanted AirDrop requests from strangers in a public place",
        fix: "Switch AirDrop to 'Contacts Only' or 'Receiving Off' immediately in Settings → General → AirDrop, or via Control Center.",
      },
    ],
    faqs: [
      {
        q: "Does AirDrop use my cellular data or internet connection?",
        a: "No, AirDrop transfers files directly between nearby devices over Wi-Fi and Bluetooth without needing an internet connection or consuming cellular data.",
      },
      {
        q: "Can I AirDrop files to an Android phone?",
        a: "No, AirDrop only works between Apple devices — Mac, iPhone, and iPad — and has no equivalent built-in support for Android or Windows devices.",
      },
      {
        q: "Is it safe to leave AirDrop set to 'Everyone'?",
        a: "It's generally not recommended to leave it that way indefinitely, since it allows any nearby stranger's device to send you a file request; Apple automatically reverts this setting to Contacts Only after 10 minutes for this reason.",
      },
    ],
    tipsAndTricks: [
      "Access AirDrop's visibility setting quickly from Control Center by long-pressing the network card in the top-left group, instead of digging through Settings.",
      "On supported iPhone 15 and later models, simply bring two unlocked iPhones close together to start a transfer without opening the share sheet manually.",
    ],
    relatedSettingIds: ["ios-wifi", "ios-bluetooth", "ios-privacy-permissions"],
  },
  {
    id: "ios-siri-search",
    title: "Siri & Search",
    icon: Search,
    platform: "ios",
    category: "apps-features",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Configure Siri and Search on iPhone",
    description:
      "Siri & Search settings control how you activate Siri (voice, button press, or typing), what each app can contribute to Spotlight search and Siri Suggestions, and how much Siri learns from your usage patterns.",
    details: [
      "Siri can be activated with 'Hey Siri', by pressing the side or Home button, or by typing requests instead of speaking.",
      "Each installed app has its own switch for whether it can appear in Search, Suggestions, and the Look Up feature.",
      "Siri Suggestions use on-device learning to predict what you might need next, like confirming an appointment or suggesting an app at a familiar time or place.",
      "Siri can be prevented from responding when the iPhone is locked, requiring the device to be unlocked first for sensitive requests.",
    ],
    important:
      "Allowing Siri access when locked means some requests, like sending a message or reading notifications, could be triggered by anyone holding the device without unlocking it first.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/change-siri-settings-iphc28624b81abc/ios",
    afterImageContent: {
      heading: "How Siri and Search Settings Work",
      paragraphs: [
        "Siri's voice, language, and activation methods are configured once and apply system-wide across every app.",
        "Per-app Search and Suggestions settings determine whether that app's content shows up in Spotlight results or the Siri Suggestions widget.",
        "Apple Intelligence-enabled devices layer additional contextual understanding on top of standard Siri Suggestions for more relevant results.",
      ],
      steps: [
        "Open Settings → Apps → Siri & Search (or Settings → Siri & Search on older iOS versions).",
        "Adjust 'Listen for Hey Siri', 'Press Side Button for Siri', and 'Allow Siri When Locked'.",
        "Scroll to the app list and toggle Search, Suggestions, and Notifications on Lock Screen per app.",
        "Retrain 'Hey Siri' recognition from this screen if voice detection feels unreliable.",
      ],
    },
    whyItMatters:
      "Siri & Search quietly shapes two very different things at once — how quickly you can get answers or perform tasks hands-free, and how much of your personal data (locations, messages, app content) gets indexed for search and suggestions across the system. Turning off Search and Suggestions for a sensitive app (like a journal or banking app) keeps its content out of Spotlight and the Suggestions widget, which is a meaningful privacy boundary many people never realize is adjustable per app. Because Siri can be configured to respond even when the device is locked, this settings screen is also directly tied to what a person holding your locked iPhone could still access.",
    bestPractices: [
      "Turn off Search and Siri Suggestions for sensitive apps (like journaling, health, or finance apps) so their content doesn't surface in Spotlight or the Suggestions widget.",
      "Disable 'Allow Siri When Locked' if you're concerned about someone accessing messages, notes, or other content without unlocking the device first.",
      "Retrain 'Hey Siri' if voice activation has become unreliable, since your voice and the environment you use it in can change over time.",
      "Leave Suggestions on for frequently used apps you're comfortable with, since it genuinely speeds up common daily actions like opening a ride-share app at a familiar time.",
    ],
    commonIssues: [
      {
        issue: "'Hey Siri' stops responding reliably",
        fix: "Go to Settings → Siri & Search → 'Listen for Hey Siri' and retrain the voice model, especially after a significant change in your voice or usual environment noise.",
      },
      {
        issue: "An app's content shows up in Spotlight search when you'd rather it didn't",
        fix: "Turn off 'Show in Search' for that specific app under Settings → Apps → Siri & Search, or its General settings page depending on iOS version.",
      },
      {
        issue: "Siri responds to requests without the phone being unlocked first",
        fix: "Turn off 'Allow Siri When Locked' if this is a concern, which then requires unlocking before Siri will act on most requests.",
      },
      {
        issue: "Siri Suggestions widget shows irrelevant or unwanted app suggestions",
        fix: "Turn off 'Show Suggestions' for the specific apps generating those suggestions rather than disabling the whole Suggestions feature.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Siri and Search settings for an app?",
        a: "Search controls whether an app's content appears in Spotlight results, while Siri Suggestions controls whether that app can proactively suggest actions or content based on your usage patterns — they can be toggled independently.",
      },
      {
        q: "Does turning off Siri Suggestions for an app delete any data?",
        a: "No, it only stops that app's content and predictions from surfacing in Search and Suggestions — the app itself and its data remain completely unaffected.",
      },
      {
        q: "Can I use Siri without saying 'Hey Siri' out loud?",
        a: "Yes, you can press and hold the side button (or Home button on older models), or turn on 'Type to Siri' to send text requests without speaking at all.",
      },
    ],
    tipsAndTricks: [
      "Use 'Type to Siri' in a quiet environment like a library or meeting where speaking a voice command out loud isn't practical.",
      "Check each app's individual entry under Siri & Search after installing something new, since defaults for Search and Suggestions vary by app.",
    ],
    relatedSettingIds: ["ios-privacy-permissions", "ios-notifications", "ios-keyboard"],
  },
  {
    id: "ios-keyboard",
    title: "Keyboard",
    icon: Keyboard,
    platform: "ios",
    category: "devices-peripherals",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize the Keyboard on iPhone",
    description:
      "Keyboard settings let you add languages and layouts, configure autocorrect and predictive text, and connect a physical Bluetooth or Magic Keyboard for a more traditional typing experience.",
    details: [
      "Multiple keyboards (different languages or layouts like emoji) can be added and switched between with the globe key.",
      "Autocorrect, Predictive Text, and Check Spelling can each be toggled independently based on typing preference.",
      "A paired Bluetooth or Magic Keyboard is managed from the same screen, including custom key mappings on supported models.",
      "Text Replacement lets you create shortcuts, like typing 'omw' to automatically expand into 'On my way!'.",
    ],
    important:
      "Removing a keyboard you're not using also removes its associated dictionary and text replacements for that language until it's added back.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/add-or-change-keyboards-iph73b71eb/ios",
    afterImageContent: {
      heading: "Adding Keyboards and Text Shortcuts",
      paragraphs: [
        "Each added keyboard appears in a rotation accessible by tapping and holding the globe icon on the on-screen keyboard.",
        "Text Replacement entries sync across your devices via iCloud if enabled, so shortcuts stay consistent everywhere you type.",
        "A connected external keyboard can use standard shortcuts for many system functions, like Cmd+Space for Spotlight search.",
      ],
      steps: [
        "Open Settings → General → Keyboard.",
        "Tap 'Keyboards' to add a new language or layout, or remove ones you don't use.",
        "Tap 'Text Replacement' to add custom shortcuts that expand into longer phrases.",
        "Toggle Autocorrection, Predictive Text, and other typing preferences to taste.",
      ],
    },
    whyItMatters:
      "Keyboard settings directly affect typing speed and accuracy for one of the most repetitive interactions on the device, so a poorly tuned autocorrect or missing language keyboard creates daily friction that compounds over thousands of taps. Text Replacement in particular is a genuinely powerful time-saver for anyone who types the same addresses, phrases, or signatures repeatedly, turning a few characters into a full sentence instantly. For bilingual users or anyone pairing a physical keyboard, this screen is also where language switching and external hardware behavior get configured correctly.",
    bestPractices: [
      "Add every language you regularly type in as a separate keyboard, rather than relying on autocorrect to guess between languages incorrectly.",
      "Set up Text Replacement shortcuts for information you type often, like your email address or a common closing line, to save real time over weeks of typing.",
      "Turn off Predictive Text if you find the suggestion bar distracting rather than helpful, since it's an independent toggle from Autocorrect.",
      "Enable 'Text Replacement' iCloud sync so your shortcuts are available immediately on a new or additional device rather than re-entering them manually.",
    ],
    commonIssues: [
      {
        issue: "Autocorrect keeps changing a name or word you type correctly and intentionally",
        fix: "Add that specific word as a Text Replacement with itself as both the shortcut and phrase, which teaches the keyboard to stop 'correcting' it.",
      },
      {
        issue: "Can't find the option to switch to a different language keyboard while typing",
        fix: "Tap and hold the globe icon at the bottom-left of the keyboard (or bottom-right depending on layout) to see and select from all added keyboards.",
      },
      {
        issue: "A connected Bluetooth keyboard types the wrong characters or has swapped keys",
        fix: "Check Settings → General → Keyboard → Hardware Keyboard and confirm the correct keyboard layout matches your physical device's language and region.",
      },
      {
        issue: "Text Replacement shortcuts don't appear on a second iPhone or iPad",
        fix: "Confirm both devices are signed into the same Apple Account with Text Replacement sync enabled under Settings → [Your Name] → iCloud → Saved to iCloud.",
      },
    ],
    faqs: [
      {
        q: "How do I type in more than one language on the same iPhone?",
        a: "Add each language as a separate keyboard under Settings → General → Keyboard → Keyboards, then switch between them by tapping and holding the globe key while typing.",
      },
      {
        q: "Can I use a physical keyboard with my iPhone?",
        a: "Yes, most Bluetooth keyboards, including Apple's Magic Keyboard, can be paired under Settings → Bluetooth and will then appear as a connected hardware keyboard option.",
      },
      {
        q: "What happens to my custom Text Replacement shortcuts if I remove a keyboard?",
        a: "Text Replacement shortcuts are generally tied to your account rather than a specific keyboard, so removing an unrelated language keyboard typically won't delete them, though language-specific dictionary words can be affected.",
      },
    ],
    tipsAndTricks: [
      "Use the one-handed keyboard mode (long-press the globe or emoji key) to shrink the keyboard to one side for easier reach on larger iPhones.",
      "Swipe across letters instead of tapping each one individually if your keyboard supports QuickPath gesture typing, for noticeably faster input on longer messages.",
    ],
    relatedSettingIds: ["ios-accessibility", "ios-siri-search", "ios-bluetooth"],
  },
  {
    id: "ios-language-region",
    title: "Language & Region",
    icon: Globe,
    platform: "ios",
    category: "accessibility-language",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Change Language and Region Settings on iPhone",
    description:
      "Language & Region controls which language iOS displays system-wide, plus region-specific formatting for calendars, number separators, measurement units, and temperature — separate settings that don't have to match each other.",
    details: [
      "iPhone Language sets the primary language used throughout Settings, system apps, and most third-party apps.",
      "Region affects date formats, the calendar system, number formatting, currency, and default measurement units independently of language.",
      "Additional languages can be added so specific apps or keyboards can use a different language than the main system language.",
      "Temperature Unit and the calendar type (like Gregorian or Buddhist) can each be overridden separately from the general Region setting.",
    ],
    important:
      "Changing the primary iPhone Language requires a short restart-like re-launch of the Settings app and can temporarily rename menus you're used to, which is expected, not a glitch.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/change-the-language-and-region-iphce20717a3/ios",
    afterImageContent: {
      heading: "How Language and Region Work Together on iPhone",
      paragraphs: [
        "Language determines the words iOS displays, while Region determines formatting conventions like whether dates read month-first or day-first.",
        "You can pair a language from one country with the region conventions of another, such as English display text with European date and measurement formats.",
        "Some apps use Apple's system language and region settings automatically, while a few manage their own separate in-app language preference.",
      ],
      steps: [
        "Open Settings → General → Language & Region.",
        "Tap 'iPhone Language' to change the primary system language, then confirm the change.",
        "Tap 'Region' to adjust date formats, measurement units, and calendar conventions.",
        "Add an 'Other Languages' entry if you want a secondary language available for specific apps or keyboards.",
      ],
    },
    whyItMatters:
      "Language and Region settings affect far more than the words on screen — they determine whether measurements show in miles or kilometers, how dates are formatted in Mail and Calendar, and which calendar system is used for date calculations. Getting Region wrong after moving or traveling can cause subtle but confusing issues, like a delivery date appearing swapped between day and month. Because language and region are independent settings, understanding that distinction avoids the common mistake of trying to fix a formatting problem by changing the language, or vice versa.",
    bestPractices: [
      "Set Region to match where you actually live day-to-day, even if you keep your iPhone Language set to something else, so dates and units stay locally relevant.",
      "Add a second language under 'Other Languages' instead of switching your primary iPhone Language back and forth if you regularly need both for different apps.",
      "Double check Region after returning from extended travel, since some carriers or Wi-Fi networks can prompt a temporary region suggestion.",
      "Review the Calendar type setting specifically if you rely on a non-Gregorian calendar for religious or cultural dates.",
    ],
    commonIssues: [
      {
        issue: "Dates appear with the day and month seemingly swapped",
        fix: "Check Settings → General → Language & Region → Region, since date order (day-first vs. month-first) is controlled by Region, not Language.",
      },
      {
        issue: "Changing the iPhone Language causes some app names or menus to look unfamiliar",
        fix: "This is expected right after a language change — give apps a moment to relaunch in the new language, and check each app's own language override if one still shows the old language.",
      },
      {
        issue: "Measurement units (miles, temperature) don't match your expectations",
        fix: "Adjust the specific Measurement Units and Temperature settings under Language & Region → Region, which can be set independently from the general region format.",
      },
      {
        issue: "A single app keeps displaying in a different language than the rest of the system",
        fix: "Check that app's own in-app language setting first, since some apps manage their own language preference separately from Settings → Language & Region.",
      },
    ],
    faqs: [
      {
        q: "Can my iPhone display one language while using another region's date formats?",
        a: "Yes, Language and Region are independent settings, so you can, for example, keep the display language in English while using a different region's date, currency, and measurement conventions.",
      },
      {
        q: "Does changing my iPhone Language delete any apps or data?",
        a: "No, changing the language only affects how text is displayed system-wide; your apps, photos, and data remain completely unaffected.",
      },
      {
        q: "Will changing Region affect what's available in the App Store or Apple Music?",
        a: "No, this Region setting under Language & Region is a display and formatting preference; your App Store storefront country is a separate setting tied to your Apple Account.",
      },
    ],
    tipsAndTricks: [
      "Use 'Other Languages' to keep a secondary keyboard and language ready for messaging bilingual contacts without switching your entire system language.",
      "Preview the exact date and number formatting a Region will use right on the Region selection screen before confirming the change.",
    ],
    relatedSettingIds: ["ios-keyboard", "ios-accessibility", "ios-general-about"],
  },
  {
    id: "ios-date-time",
    title: "Date & Time",
    icon: Clock,
    platform: "ios",
    category: "system-info",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set the Date and Time on iPhone",
    description:
      "Date & Time settings normally keep your iPhone's clock accurate automatically using your current location and cellular network, but they can also be set manually and switched between 12-hour and 24-hour display.",
    details: [
      "'Set Automatically' uses location and network time data to keep the clock and time zone continuously accurate, including during travel.",
      "Turning off 'Set Automatically' allows manually choosing a specific time zone, date, and time.",
      "The 24-Hour Time toggle switches the whole system, including Lock Screen, Clock, and Calendar, between 12-hour and 24-hour formats.",
      "An incorrect time zone can silently shift the accuracy of alarms, calendar events, and message timestamps.",
    ],
    important:
      "Turning off 'Set Automatically' means the clock and time zone stay fixed until you change them manually, even after traveling to a different time zone.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/change-the-date-and-time-iph65f82af3e/ios",
    afterImageContent: {
      heading: "How Automatic Date and Time Works",
      paragraphs: [
        "iPhone typically determines the correct time zone using a combination of location data and information from the cellular network.",
        "Devices without cellular service, like Wi-Fi-only iPads, rely more heavily on location and network time servers to stay accurate.",
        "Manual mode is mainly useful in rare cases like testing, or specific regions where automatic time zone detection is unreliable.",
      ],
      steps: [
        "Open Settings → General → Date & Time.",
        "Confirm 'Set Automatically' is turned on for the clock to update using location and network data.",
        "Toggle '24-Hour Time' on or off to match your preferred clock format.",
        "Turn off 'Set Automatically' only if you specifically need to set the date, time, or time zone manually.",
      ],
    },
    whyItMatters:
      "Accurate date and time settings are foundational to dozens of features working correctly at once — alarms firing on schedule, calendar invitations landing at the right hour, message timestamps making sense, and Screen Time or Focus schedules triggering when expected. Because 'Set Automatically' relies on location and cellular data, disabling Location Services for the system or losing cellular signal in a new time zone can cause the clock to drift out of sync without an obvious warning. This is also one of the first things worth checking when a scheduled reminder, alarm, or calendar event seems to fire at the wrong time.",
    bestPractices: [
      "Leave 'Set Automatically' turned on for nearly all everyday use, since it reliably adjusts the time zone during travel without any manual intervention.",
      "Confirm Location Services is enabled for System Services if the clock seems to be drifting, since time zone detection depends partly on location data.",
      "Switch to 24-Hour Time if you regularly work with international teams or schedules where 12-hour AM/PM formatting causes confusion.",
      "Double-check the time zone manually right after landing in a new country if you're on airplane mode without cellular service for an extended period.",
    ],
    commonIssues: [
      {
        issue: "Clock shows the wrong time zone after landing in a new country",
        fix: "Turn cellular data and Location Services back on so 'Set Automatically' can re-detect the correct time zone, since airplane mode alone can delay the update.",
      },
      {
        issue: "Alarms or calendar events fire an hour off from expected",
        fix: "Check Settings → General → Date & Time to confirm the correct time zone is selected, especially after a recent daylight saving time change.",
      },
      {
        issue: "Manually set time keeps resetting back to automatic detection",
        fix: "This happens because 'Set Automatically' was left on — turn it off explicitly if you need the date and time to stay fixed at a manual value.",
      },
      {
        issue: "24-Hour Time change doesn't seem to apply in a specific app",
        fix: "Most system apps like Clock and Calendar follow this setting immediately, but some third-party apps use their own internal time format preference instead.",
      },
    ],
    faqs: [
      {
        q: "Why would I ever turn off 'Set Automatically'?",
        a: "It's mainly useful in rare situations like software testing or specific travel circumstances where automatic time zone detection is unreliable; most users should leave it on.",
      },
      {
        q: "Does 24-Hour Time change how dates are formatted too?",
        a: "No, it only affects the clock time format; date formatting (day-first vs. month-first) is controlled separately by the Region setting under Language & Region.",
      },
      {
        q: "Can my iPhone's clock be wrong even with 'Set Automatically' on?",
        a: "It's uncommon, but a temporary loss of cellular signal and Location Services together can occasionally delay an automatic time zone update until connectivity is restored.",
      },
    ],
    tipsAndTricks: [
      "Add a second time zone clock in the Clock app's World Clock tab instead of manually changing your device's time zone to track a different location.",
      "Check the small time zone name shown at the top of the Date & Time screen to quickly confirm which zone your iPhone currently thinks it's in.",
    ],
    relatedSettingIds: ["ios-general-about", "ios-language-region", "ios-notifications"],
  },
  {
    id: "ios-find-my",
    title: "Find My",
    icon: LocateFixed,
    platform: "ios",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Find My on iPhone",
    description:
      "Find My helps you locate a lost or stolen iPhone on a map, remotely play a sound, mark it as lost, or erase it, and it can also share your location with family members or locate AirTags and other Apple accessories.",
    details: [
      "Find My iPhone must be turned on for the device to appear on a map if it's ever lost or stolen.",
      "'Send Last Location' automatically sends the device's final known location to Apple when the battery gets critically low.",
      "Find My Network lets a lost device (or a paired AirTag) be located using nearby Apple devices, even without its own Wi-Fi or cellular connection.",
      "Family Sharing members can optionally share their location with each other directly from the Find My app.",
    ],
    important:
      "Activation Lock, tied to Find My, requires your Apple Account password to erase or reactivate the device — turn off Find My before trading in or selling your iPhone to avoid blocking the new owner's setup.",
    redirectUrl: "https://support.apple.com/en-us/102648",
    afterImageContent: {
      heading: "How Find My Locates Your iPhone",
      paragraphs: [
        "Find My combines GPS, Wi-Fi, and Bluetooth signals, along with the Find My network of other Apple devices, to estimate a device's location.",
        "Mark As Lost locks the device with a passcode and displays a custom message with a contact number on its lock screen.",
        "Even after the battery dies, a recently reported last location remains visible in the Find My app if 'Send Last Location' was enabled.",
      ],
      steps: [
        "Open Settings → [Your Name] → Find My.",
        "Turn on 'Find My iPhone' and 'Find My Network'.",
        "Enable 'Send Last Location' to report a final position before the battery dies.",
        "Open the Find My app on another Apple device to view the location of your iPhone if it's ever missing.",
      ],
    },
    whyItMatters:
      "Find My is the single most effective built-in protection against a lost or stolen iPhone becoming a total loss, since it lets you locate, remotely lock, or erase the device before someone else can access your data. Activation Lock, which is tied directly to Find My, also makes a stolen iPhone far less valuable to resell, since it can't be reactivated without your Apple Account credentials. Beyond device recovery, Find My underpins family location sharing and AirTag tracking, making it one of the most functionally important privacy and security settings on the entire device.",
    bestPractices: [
      "Keep Find My iPhone turned on at all times, since it's one of the few settings that directly protects the value and data security of the device itself.",
      "Enable 'Send Last Location' so a dying battery doesn't erase your last chance at locating a missing iPhone.",
      "Turn off Find My and sign out of your Apple Account before selling, trading in, or giving away your iPhone, to avoid leaving Activation Lock enabled for the new owner.",
      "Use 'Notify When Left Behind' for tracked items like AirTags paired with Find My, so you're alerted before walking away without them.",
    ],
    commonIssues: [
      {
        issue: "A trade-in or new owner can't activate the iPhone after a factory reset",
        fix: "The previous owner needs to sign in to icloud.com/find or another device and remove the iPhone from their account to clear Activation Lock.",
      },
      {
        issue: "Find My shows an old or inaccurate location for a lost device",
        fix: "Check whether 'Send Last Location' was enabled and whether the device had a recent connection before the battery died, since Find My can only show the most recent location it received.",
      },
      {
        issue: "Find My iPhone can't be turned off during a reset",
        fix: "Enter your Apple Account password when prompted, since disabling Find My intentionally requires authentication to prevent a thief from doing the same thing.",
      },
      {
        issue: "A family member's location isn't showing up in the Find My app",
        fix: "Confirm they've accepted the Family Sharing invitation and enabled location sharing from their own device's Find My settings, since sharing must be turned on individually by each person.",
      },
    ],
    faqs: [
      {
        q: "Can a thief turn off Find My on my stolen iPhone?",
        a: "Not without your Apple Account password — Activation Lock requires those credentials to disable Find My or erase the device, which is what makes stolen iPhones difficult to resell.",
      },
      {
        q: "Does Find My work if my iPhone is off or out of battery?",
        a: "If 'Send Last Location' was enabled, Find My can show its final known position before it powered off; some newer iPhones can also be located for a short time even after shutting down using low-power hardware.",
      },
      {
        q: "Can I use Find My to track an AirTag or someone else's Apple device?",
        a: "You can track your own AirTags and devices, or another person's device only if they've explicitly shared their location with you through Family Sharing or a similar sharing feature.",
      },
    ],
    tipsAndTricks: [
      "Use 'Play Sound' in the Find My app to locate a misplaced iPhone that's still nearby, like lost somewhere in your own home.",
      "Check the Find My app's 'Devices' tab for a full list of every Apple device and accessory linked to your Apple Account, not just your current iPhone.",
    ],
    relatedSettingIds: ["ios-location-services", "ios-icloud-backup", "ios-reset-iphone"],
  },
  {
    id: "ios-apple-pay-wallet",
    title: "Wallet & Apple Pay",
    icon: Wallet,
    platform: "ios",
    category: "apps-features",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Wallet and Apple Pay on iPhone",
    description:
      "Wallet & Apple Pay settings let you add debit, credit, and transit cards for contactless payment, manage boarding passes and IDs, and control which card is used by default along with Face ID or Touch ID authorization.",
    details: [
      "Cards can be added by scanning them with the camera or entering details manually, subject to your card issuer's approval.",
      "A default card is used automatically for Apple Pay unless you select a different one at the moment of payment.",
      "Express Transit Cards can be used to tap through certain transit systems without unlocking the iPhone or authenticating first.",
      "Apple Cash (where available) and person-to-person payments sent through Messages are also managed from this same section.",
    ],
    important:
      "If your iPhone is lost or stolen, use Find My or contact your card issuer promptly — Apple Pay transactions still require device authentication, but suspending cards remotely adds an extra layer of protection.",
    redirectUrl: "https://support.apple.com/en-us/HT204506",
    afterImageContent: {
      heading: "Adding and Using Cards with Apple Pay",
      paragraphs: [
        "Each added card is tokenized rather than stored as a raw card number, meaning your actual card details aren't shared with merchants during a purchase.",
        "Face ID or Touch ID authorizes each Apple Pay transaction individually, in addition to double-clicking the side or Home button on older setups.",
        "Boarding passes, tickets, and IDs added to Wallet from supporting apps appear alongside your payment cards for quick access.",
      ],
      steps: [
        "Open Settings → Wallet & Apple Pay (or open the Wallet app directly).",
        "Tap the '+' button and choose 'Debit or Credit Card'.",
        "Scan the card with the camera or enter its details manually, then verify with your card issuer.",
        "Set your preferred Default Card and confirm Face ID/Touch ID is enabled for Apple Pay.",
      ],
    },
    whyItMatters:
      "Apple Pay replaces handing over a physical card with a tokenized, authenticated transaction, meaning your actual card number is never shared with the merchant and every purchase requires Face ID, Touch ID, or a passcode. This setting is also where Express Transit is configured, letting people move through certain subway or transit gates without unlocking their phone at all, which only works correctly if set up in advance. Because Wallet increasingly holds boarding passes, tickets, and IDs alongside payment cards, this section has become a central hub for everyday essentials well beyond just paying for things.",
    bestPractices: [
      "Set a default card that matches the one you actually want charged most often, since it's used automatically unless you manually select another during checkout.",
      "Enable Face ID or Touch ID specifically for Apple Pay so purchases stay protected even if your general passcode is compromised in some other way.",
      "Set up Express Transit for your city's supported transit system in advance, rather than discovering at the turnstile that authentication is required.",
      "Remove old or canceled cards from Wallet promptly to avoid confusion when selecting a payment method during checkout.",
      "Contact your card issuer immediately if your iPhone is lost, in addition to using Find My, since they can suspend the tokenized card independently.",
    ],
    commonIssues: [
      {
        issue: "A card won't add to Wallet or gets stuck on verification",
        fix: "Confirm the card issuer supports Apple Pay and try re-entering the details manually instead of scanning, or contact the card issuer directly if verification keeps failing.",
      },
      {
        issue: "The wrong card gets charged during a tap-to-pay purchase",
        fix: "Check which card is set as Default under Wallet & Apple Pay, and manually select the correct card in Wallet before tapping to pay if a different one is needed for that purchase.",
      },
      {
        issue: "Express Transit doesn't work at the turnstile without unlocking the phone",
        fix: "Confirm the specific card was set up as an Express Transit Card for your transit system, since only cards explicitly configured this way skip the authentication requirement.",
      },
      {
        issue: "Apple Pay declines at checkout despite the card working elsewhere",
        fix: "Check for a temporary hold from the card issuer, confirm the device's date and time are accurate, and try restarting the iPhone if the terminal still doesn't recognize the tap.",
      },
    ],
    faqs: [
      {
        q: "Does Apple Pay share my actual card number with stores?",
        a: "No, Apple Pay uses a unique tokenized device account number instead of your real card number, so merchants never see or store your actual card details.",
      },
      {
        q: "What happens to my cards in Wallet if I lose my iPhone?",
        a: "You can use Find My to suspend Apple Pay on the missing device remotely, and your card issuer can also freeze or reissue the card independently for extra protection.",
      },
      {
        q: "Can I use Apple Pay without an internet connection?",
        a: "Yes, in-store contactless Apple Pay transactions work over NFC and don't require an active internet connection on the iPhone itself.",
      },
    ],
    tipsAndTricks: [
      "Double-click the side button from the Lock Screen to bring up your default Apple Pay card instantly without fully unlocking or opening the Wallet app.",
      "Long-press a card in Wallet to quickly access its transaction history or card-specific settings without going through Settings.",
    ],
    relatedSettingIds: ["ios-face-id-passcode", "ios-privacy-permissions", "ios-app-store-settings"],
  },
  {
    id: "ios-app-store-settings",
    title: "App Store Settings",
    icon: Store,
    platform: "ios",
    category: "apps-features",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage App Store Settings on iPhone",
    description:
      "App Store settings control automatic app updates and downloads, whether purchases require a password or Face ID confirmation, and content restrictions that limit which apps and in-app purchases are accessible.",
    details: [
      "App Updates can install automatically in the background, or be left for manual review and approval.",
      "'Require Password' settings determine whether free downloads, paid purchases, or in-app purchases prompt for authentication.",
      "Content Restrictions (under Screen Time) can block apps above a certain age rating or disable in-app purchases entirely.",
      "'Offload Unused Apps' automatically removes rarely used apps to save storage while keeping their data intact for reinstallation.",
    ],
    important:
      "Disabling 'Require Password' for purchases makes it easy for anyone with access to an unlocked device, including a child, to make purchases without any confirmation step.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/change-settings-and-restrictions-iph3dfd91de/ios",
    afterImageContent: {
      heading: "Configuring Downloads, Purchases, and Restrictions",
      paragraphs: [
        "Automatic Downloads can sync new app installs and updates across every device signed into the same Apple Account.",
        "In-app purchase confirmation is a separate setting from the main App Store purchase password requirement.",
        "Content Restrictions rely on age ratings that developers assign to their own apps, reviewed periodically by Apple.",
      ],
      steps: [
        "Open Settings → App Store.",
        "Toggle App Updates and Automatic Downloads to your preference.",
        "Adjust 'Require Password' settings for free and paid content.",
        "Open Settings → Screen Time → Content & Privacy Restrictions to limit app ratings or in-app purchases if needed.",
      ],
    },
    whyItMatters:
      "App Store settings quietly control two very different things — how much friction exists before a purchase happens, and how much storage new updates silently consume in the background. For families, Content Restrictions are essential for keeping a child's device limited to age-appropriate apps and preventing surprise in-app purchase charges. For anyone managing storage carefully, disabling automatic app updates or downloads can prevent large background installs from eating into limited space at an inconvenient moment.",
    bestPractices: [
      "Keep 'Require Password' enabled for purchases on any shared or family device, even if it adds a small amount of friction to legitimate buying.",
      "Set Content & Privacy Restrictions before handing a device to a child, rather than reactively restricting access after a problematic download.",
      "Leave App Updates on automatic if storage isn't a concern, since it keeps apps patched with the latest security and bug fixes without manual effort.",
      "Review in-app purchase settings specifically for gaming apps, since those are the most common source of unexpected charges on a shared device.",
    ],
    commonIssues: [
      {
        issue: "A child made an unexpected in-app purchase without a parent noticing",
        fix: "Enable 'Require Password' for purchases immediately in Settings → App Store, and set up Ask to Buy under Family Sharing so purchase requests need explicit parental approval.",
      },
      {
        issue: "Apps keep updating automatically and consuming storage unexpectedly",
        fix: "Turn off 'App Updates' under Settings → App Store → Automatic Downloads if you'd rather review and install updates manually.",
      },
      {
        issue: "An age-appropriate app is blocked from installing on a managed device",
        fix: "Check the allowed app rating under Settings → Screen Time → Content & Privacy Restrictions → iTunes & App Store Purchases, and raise the age limit if it's set too restrictively.",
      },
      {
        issue: "A newly purchased app doesn't appear on another device signed into the same Apple Account",
        fix: "Confirm 'App Downloads' under Automatic Downloads is enabled on that other device, since apps don't sync automatically unless this setting is turned on there too.",
      },
    ],
    faqs: [
      {
        q: "Does 'Require Password' apply to free app downloads too?",
        a: "Yes, you can require authentication for free downloads as well as paid purchases, which is useful on a family or shared device even when no money changes hands.",
      },
      {
        q: "Can I block only in-app purchases without blocking new app installs entirely?",
        a: "Yes, Content & Privacy Restrictions lets you disable in-app purchases specifically while still allowing new app downloads and installs.",
      },
      {
        q: "Will turning off Automatic Downloads stop apps from updating forever?",
        a: "No, it only stops updates from installing automatically in the background — you can still update any app manually anytime from the App Store's Updates tab.",
      },
    ],
    tipsAndTricks: [
      "Enable 'Offload Unused Apps' under Automatic Downloads so iOS quietly frees storage from rarely used apps without deleting their saved data.",
      "Check purchase history in your Apple Account settings if a charge looks unfamiliar, rather than assuming it was unauthorized before investigating.",
    ],
    relatedSettingIds: ["ios-screen-time-family", "ios-iphone-storage", "ios-apple-pay-wallet"],
  },
  {
    id: "ios-safari-settings",
    title: "Safari Settings",
    icon: Compass,
    platform: "ios",
    category: "apps-features",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Safari Settings on iPhone",
    description:
      "Safari settings control your default search engine, privacy protections like Intelligent Tracking Prevention and Privacy Report, AutoFill for passwords and payment details, and how tabs and extensions behave.",
    details: [
      "Intelligent Tracking Prevention limits cross-site tracking by advertisers and analytics scripts automatically, without needing manual configuration.",
      "AutoFill can fill in saved passwords, contact information, and payment card details from Settings or your device's Passwords.",
      "Privacy Report shows a summary of trackers Safari has blocked across the websites you've visited recently.",
      "Extensions installed from the App Store can add content blocking, password management, or other browsing features to Safari.",
    ],
    important:
      "Turning off 'Block Pop-ups' or Fraudulent Website Warning reduces built-in protection against intrusive ads and phishing sites — only disable these for specific, trusted use cases.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/customize-your-safari-settings-iphb3100d149/ios",
    afterImageContent: {
      heading: "Adjusting Privacy, Search, and AutoFill in Safari",
      paragraphs: [
        "Safari's privacy protections work automatically in the background without requiring you to configure individual website permissions.",
        "AutoFill pulls saved information from Contacts and your device's Passwords, and can be turned off independently for names/addresses versus payment cards.",
        "Per-website settings, like camera or location access, can be reviewed separately from Safari's general settings.",
      ],
      steps: [
        "Open Settings → Safari.",
        "Choose your preferred default search engine under 'Search Engine'.",
        "Toggle AutoFill for Contact Info and Credit Cards under 'AutoFill'.",
        "Scroll to Privacy & Security to review Fraudulent Website Warning and Privacy Report settings.",
      ],
    },
    whyItMatters:
      "Safari is the default gateway to the web on iPhone, so its settings determine how much cross-site tracking advertisers can perform, how convenient it is to log in to sites with saved passwords, and how exposed you are to phishing sites. Intelligent Tracking Prevention and Privacy Report work quietly in the background, giving a genuine, measurable reduction in advertiser tracking without requiring technical knowledge to configure. Because AutoFill can store payment card details for one-tap checkout, understanding and reviewing this setting also has real financial security implications, not just convenience.",
    bestPractices: [
      "Leave Fraudulent Website Warning turned on, since it actively blocks known phishing and malware sites before you can accidentally visit them.",
      "Review Privacy Report periodically to see which trackers Safari has blocked recently, and get a sense of which sites are the most aggressive trackers.",
      "Turn on AutoFill for Contact Info for convenience, but review Credit Card AutoFill specifically if you share your device with family members.",
      "Choose a privacy-respecting default search engine if that's a priority, since Safari lets you select alternatives beyond the default search provider.",
    ],
    commonIssues: [
      {
        issue: "Saved passwords or payment cards don't AutoFill on a login or checkout page",
        fix: "Check Settings → Safari → AutoFill to confirm the relevant toggle is on, and verify the specific credential exists in Passwords for that exact website.",
      },
      {
        issue: "A website looks broken or missing content after visiting it",
        fix: "Try Safari's 'Request Desktop Website' option from the aA menu, since some sites render incorrectly or hide features in the default mobile view.",
      },
      {
        issue: "Pop-up blocker prevents a legitimate feature (like a payment window) from opening",
        fix: "Tap the aA icon in the address bar and temporarily allow pop-ups for that specific site rather than disabling the blocker system-wide.",
      },
      {
        issue: "Safari keeps suggesting a search engine you don't want to use",
        fix: "Change the default under Settings → Safari → Search Engine, since Safari always uses whichever provider is selected there regardless of prior searches.",
      },
    ],
    faqs: [
      {
        q: "Does Safari's tracking prevention block all website ads?",
        a: "No, Intelligent Tracking Prevention limits cross-site tracking data used to build a profile of your browsing, but it doesn't function as a full ad blocker; a dedicated content blocker extension is needed for that.",
      },
      {
        q: "Is it safe to let Safari save my credit card for AutoFill?",
        a: "Saved cards are protected by your device's passcode and Face ID or Touch ID before AutoFill will insert them, making it reasonably safe on a personal device, though caution is warranted on any shared device.",
      },
      {
        q: "Can I use a different search engine than the default in Safari?",
        a: "Yes, Settings → Safari → Search Engine offers several alternatives beyond the default, and switching takes effect immediately for new searches.",
      },
    ],
    tipsAndTricks: [
      "Tap the aA icon in Safari's address bar to quickly access Reader view, text size, and per-site content blocker settings without opening the main Settings app.",
      "Use Safari's built-in Privacy Report (tap the shield icon in the address bar) to see trackers blocked on the current page in real time.",
    ],
    relatedSettingIds: ["ios-privacy-permissions", "ios-icloud-backup", "ios-wifi"],
  },
  {
    id: "ios-emergency-sos",
    title: "Emergency SOS",
    icon: Siren,
    platform: "ios",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Emergency SOS on iPhone",
    description:
      "Emergency SOS lets you quickly call for help by pressing the side button rapidly or holding it with a volume button, automatically alerting emergency services and, if configured, notifying your chosen emergency contacts with your location.",
    details: [
      "Pressing and holding the side button and a volume button together starts a countdown before calling emergency services.",
      "Rapidly pressing the side button five times can also trigger Emergency SOS, depending on your region and settings.",
      "Emergency Contacts you've designated are automatically notified with your current location once a call to emergency services ends.",
      "Medical ID information, if set up, can be shared with emergency responders directly from the Lock Screen during a call.",
    ],
    important:
      "Emergency SOS calls emergency services directly and cannot be tested casually — practicing the gesture in a genuine emergency-services region can trigger a real call, so review Apple's guidance carefully before trying it.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/contact-emergency-services-iph3c99374c/ios",
    afterImageContent: {
      heading: "How Emergency SOS Works on iPhone",
      paragraphs: [
        "Triggering Emergency SOS starts a countdown with a warning sound, giving you a moment to cancel if it was activated accidentally.",
        "After the call ends, iOS can automatically send a text to your Emergency Contacts with your current location and updates as it changes.",
        "Medical ID displays critical health information, like allergies or conditions, accessible from the Lock Screen without needing a passcode.",
      ],
      steps: [
        "Open Settings → Emergency SOS.",
        "Choose whether 'Call with Side Button' requires the countdown or an immediate press.",
        "Open the Health app and set up Medical ID, then choose to show it on the Lock Screen.",
        "Add trusted people as Emergency Contacts so they're notified automatically after an Emergency SOS call.",
      ],
    },
    whyItMatters:
      "Emergency SOS can be a genuinely life-saving feature in situations where dialing normally isn't practical, like during an accident, an assault, or a medical emergency where speed and simplicity matter most. Because it automatically shares your location with both emergency services and your designated Emergency Contacts, it closes a real gap that exists when someone can't verbally explain where they are. Setting up Medical ID alongside it means first responders can see critical health information immediately, even if the device is locked and you're unable to communicate.",
    bestPractices: [
      "Set up Medical ID with accurate allergies, medications, and conditions, since responders can view it from the Lock Screen without unlocking the device.",
      "Add at least one or two trusted Emergency Contacts so they're automatically notified with your location if you ever trigger a real Emergency SOS call.",
      "Know your region's exact trigger gesture (hold side + volume, or rapid side-button presses) in advance rather than discovering it during an actual emergency.",
      "Review the countdown and haptic/sound settings so you understand what an accidental trigger feels like and how to cancel it quickly.",
    ],
    commonIssues: [
      {
        issue: "Emergency SOS triggers accidentally while the phone is in a pocket or bag",
        fix: "Cancel the countdown immediately by tapping 'Stop' or sliding to cancel if a call hasn't connected yet, and consider using a case that better protects the side button from accidental presses.",
      },
      {
        issue: "Emergency Contacts weren't notified after a real Emergency SOS call",
        fix: "Confirm Emergency Contacts are correctly added in the Health app's Medical ID and that Location Services is enabled, since both are required for the automatic notification to send.",
      },
      {
        issue: "Medical ID information doesn't appear on the Lock Screen during an emergency",
        fix: "Open the Health app → Medical ID → Edit and confirm 'Show When Locked' is turned on, since Medical ID is hidden from the Lock Screen by default until enabled.",
      },
      {
        issue: "Unsure which gesture triggers Emergency SOS on a specific iPhone model or region",
        fix: "Check Settings → Emergency SOS, which displays the exact trigger method (hold side + volume button, or rapid presses) configured for your device and region.",
      },
    ],
    faqs: [
      {
        q: "Does Emergency SOS work without a cellular plan?",
        a: "In most regions, calls to emergency services are allowed even without an active cellular plan or SIM card, though satellite-based Emergency SOS features have their own separate device and coverage requirements.",
      },
      {
        q: "Will my location automatically be sent to my emergency contacts?",
        a: "Yes, once an Emergency SOS call to emergency services ends, iOS can automatically text your designated Emergency Contacts with your current location and updates for a period afterward.",
      },
      {
        q: "Can emergency responders see my medical conditions if my phone is locked?",
        a: "Yes, if Medical ID is set up with 'Show When Locked' enabled, responders can view it directly from the Lock Screen's emergency access without needing your passcode.",
      },
    ],
    tipsAndTricks: [
      "Set up Medical ID even if you're generally healthy, since basic details like your emergency contacts and blood type can still matter in an unrelated accident.",
      "Review Settings → Emergency SOS after getting a new iPhone or moving to a new country, since the exact trigger gesture can differ by region.",
    ],
    relatedSettingIds: ["ios-location-services", "ios-find-my", "ios-face-id-passcode"],
  },
  {
    id: "ios-game-center",
    title: "Game Center",
    icon: Gamepad2,
    platform: "ios",
    category: "apps-features",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Game Center on iPhone",
    description:
      "Game Center is Apple's social gaming network built into supported games, letting you track achievements and leaderboards, play with friends, and manage your public nickname and profile visibility across every Game Center-enabled app.",
    details: [
      "A Game Center profile includes a nickname and photo that appears to friends and other players across supported games.",
      "Friend requests can be sent and accepted directly within Game Center or through supported games that use it.",
      "Achievements and Leaderboards are tracked per game and sync automatically across your devices signed into the same Apple Account.",
      "Privacy settings control whether friend requests, invitations, or your activity status are visible to others.",
    ],
    important:
      "Game Center activity and friend connections are visible within any game that integrates it, so review your privacy settings if you'd rather limit who can see your profile or send requests.",
    redirectUrl: "https://support.apple.com/en-us/105022",
    afterImageContent: {
      heading: "Setting Up Your Game Center Profile",
      paragraphs: [
        "Game Center is accessed through the Games app or directly within any individual game that supports it.",
        "Your nickname, rather than your real name, is what's shown by default to other players and friends.",
        "Achievements and Leaderboards update automatically as you play, without needing to manually sync progress.",
      ],
      steps: [
        "Open the Games app and sign in with your Apple Account if not already signed in.",
        "Tap your profile icon to set up or edit your Game Center nickname and photo.",
        "Adjust privacy settings for friend requests and activity status.",
        "Open a supported game to see your Achievements and Leaderboards populate automatically.",
      ],
    },
    whyItMatters:
      "Game Center is what turns individual games into a connected social experience, letting achievements, leaderboards, and multiplayer invitations carry across dozens of supported titles instead of each game tracking progress in isolation. Because a Game Center profile is shared across every compatible game, getting the nickname and privacy settings right once saves you from repeatedly managing visibility on a per-game basis. For parents, understanding Game Center's friend request and messaging behavior is also relevant to Screen Time and Content Restrictions when managing a child's device.",
    bestPractices: [
      "Set a nickname that doesn't reveal your real identity if you play multiplayer games with strangers rather than only friends.",
      "Review friend requests periodically rather than accepting them automatically, especially on a device used by a younger family member.",
      "Turn off activity status or friend recommendations if you'd rather keep your gaming presence private from being discoverable by others.",
      "Check Content & Privacy Restrictions under Screen Time if you want to limit or disable multiplayer and friend features for a child's Game Center profile.",
    ],
    commonIssues: [
      {
        issue: "Achievements or Leaderboards don't appear for a game that should support them",
        fix: "Confirm you're signed in to Game Center through the Games app and that the specific game has been opened at least once while signed in to register its data.",
      },
      {
        issue: "A friend request in Game Center never arrives",
        fix: "Confirm the correct nickname or Apple Account email was used to send the request, and check that Game Center privacy settings aren't blocking incoming requests.",
      },
      {
        issue: "Progress doesn't carry over to a new iPhone",
        fix: "Sign in to Game Center with the same Apple Account on the new device, since Achievements and Leaderboards are tied to your account rather than the physical device.",
      },
      {
        issue: "A child's device shows unwanted multiplayer invitations",
        fix: "Restrict multiplayer games and Game Center-based friend features under Settings → Screen Time → Content & Privacy Restrictions.",
      },
    ],
    faqs: [
      {
        q: "Is Game Center required to play games on iPhone?",
        a: "No, Game Center is optional for most games; it only adds social features like Achievements, Leaderboards, and friend invitations to games that choose to integrate it.",
      },
      {
        q: "Can I use a different nickname than my real name in Game Center?",
        a: "Yes, Game Center nicknames are separate from your Apple Account name and can be set to anything you choose within Apple's naming guidelines.",
      },
      {
        q: "Do Game Center achievements sync across my iPhone and iPad?",
        a: "Yes, as long as both devices are signed into the same Apple Account, your Achievements and Leaderboards for supported games carry over automatically.",
      },
    ],
    tipsAndTricks: [
      "Open the Games app to see a unified view of Achievements and recently played Game Center-enabled titles instead of checking each game individually.",
      "Use Game Center's friend suggestions sparingly if you'd rather keep your player list limited to people you already know well.",
    ],
    relatedSettingIds: ["ios-screen-time-family", "ios-app-store-settings", "ios-privacy-permissions"],
  },
  // --- 24 additional iOS entries: Accounts & Family, Devices & Peripherals,
  // Troubleshooting & Diagnostics, Storage & Backup, System Info, System
  // Updates, and Accessibility & Language ---
{
    id: "ios-icloud-account",
    title: "Apple ID & iCloud",
    icon: Users,
    platform: "ios",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Your Apple ID and iCloud",
    description:
      "The account panel at the top of Settings is where your Apple ID lives on iPhone — your name, phone numbers, email addresses, and every iCloud service (Photos, Backup, Drive, Mail, and more) that's currently syncing to your account.",
    details: [
      "Shows the name, profile photo, phone numbers, and email addresses associated with your Apple ID.",
      "Lists which iCloud services (Photos, iCloud Drive, Backup, Mail, Keychain) are turned on for this device.",
      "Links out to Sign-In & Security, Payment & Shipping, Subscriptions, Family Sharing, and Find My.",
      "Shows every device currently signed in to this Apple ID, scrollable at the bottom of the screen.",
    ],
    important:
      "Signing out of your Apple ID here can remove iCloud data (like Photos or Mail) from this device if it isn't backed up elsewhere first.",
    redirectUrl: "https://support.apple.com/apple-id",
    afterImageContent: {
      heading: "How the Apple ID Panel Works",
      paragraphs: [
        "Tapping your name at the very top of Settings opens a single hub for everything tied to your Apple ID, rather than scattering account info across individual app settings.",
        "iCloud toggles here control whether each app's data — Photos, Contacts, Notes, and more — syncs to Apple's servers and across your other Apple devices.",
      ],
      steps: [
        "Open Settings and tap your name/photo at the very top of the screen.",
        "Review your personal info under Name, Phone Numbers, Email.",
        "Tap iCloud to see and adjust which apps are syncing.",
        "Scroll down to see all devices signed in with this Apple ID.",
      ],
    },
    whyItMatters:
      "Your Apple ID is the single account that ties together purchases, backups, Photos, Find My, and iMessage, so a misconfigured iCloud toggle here can silently stop your data from syncing or backing up at all. Because this panel also lists every signed-in device, it's the fastest way to spot a device you don't recognize and act on it.",
    bestPractices: [
      "Keep your recovery phone number and email current here so you never get locked out of your Apple ID.",
      "Periodically scroll through the device list and remove any device you no longer own or recognize.",
      "Turn on iCloud Backup and iCloud Photos from this screen so a lost or damaged iPhone doesn't mean lost data.",
    ],
    commonIssues: [
      {
        issue: "An iCloud toggle (like Photos or Mail) won't turn on or spins indefinitely",
        fix: "Check your internet connection and available iCloud storage, then restart the iPhone and try the toggle again.",
      },
      {
        issue: "An unfamiliar device shows up in the signed-in devices list",
        fix: "Tap the device and choose Remove from Account, then immediately change your Apple ID password from Sign-In & Security.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between the Apple ID panel and Sign-In & Security?",
        a: "This top-level panel is a hub for your profile info and iCloud services, while Sign-In & Security specifically handles your password, two-factor authentication, and trusted devices.",
      },
      {
        q: "Does turning off an iCloud toggle delete data from the app itself?",
        a: "It stops that app's data from syncing to iCloud, but existing data usually stays on the device — though it will no longer back up or appear on your other Apple devices.",
      },
    ],
    tipsAndTricks: [
      "Tap 'Media & Purchases' under this panel to see or manage your Apple ID's payment method for App Store and subscription purchases.",
    ],
    relatedSettingIds: ["ios-sign-in-security", "ios-family-sharing", "ios-icloud-backup"],
  },
  {
    id: "ios-family-sharing",
    title: "Family Sharing",
    icon: Users,
    platform: "ios",
    category: "accounts-sync-family",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Share Purchases and Storage With Family",
    description:
      "Family Sharing lets up to six people share App Store and iTunes purchases, an Apple Music or Apple One subscription, iCloud+ storage, and a shared photo album — plus parental controls for kids' accounts.",
    details: [
      "One family organizer invites up to five other members to join the group.",
      "Purchased apps, movies, and books can be shared automatically among members.",
      "An iCloud+ storage plan can be shared across the whole family instead of buying it separately.",
      "Location sharing and Screen Time parental controls can be set up for child accounts here.",
    ],
    important:
      "Leaving or removing someone from Family Sharing can revoke their access to shared purchases and the shared storage plan going forward.",
    redirectUrl: "https://support.apple.com/en-us/HT201060",
    afterImageContent: {
      heading: "How Family Sharing Works",
      paragraphs: [
        "The family organizer sets up the group and invites members by Apple ID; once accepted, purchase sharing and a shared storage plan activate automatically.",
        "Child accounts created through Family Sharing automatically get Screen Time limits and Ask to Buy, requiring the organizer's approval for purchases.",
      ],
      steps: [
        "Open Settings → tap your name → Family Sharing.",
        "Tap Invite People and choose how to send the invite.",
        "Turn on sharing for Purchases, iCloud+ Storage, or Location as needed.",
        "For a child, tap 'Create Child Account' instead of inviting an existing Apple ID.",
      ],
    },
    whyItMatters:
      "Without Family Sharing, every family member typically pays separately for the same subscriptions and storage plans, and parents have no built-in way to approve a child's purchases or see their location. Setting it up once can meaningfully cut household subscription costs and gives parents real oversight over what kids can download or buy.",
    bestPractices: [
      "Turn on Ask to Buy for every child account so nothing gets purchased without a parent's approval.",
      "Share one higher-tier iCloud+ plan across the family instead of everyone buying separate storage.",
      "Review the family's shared photo album periodically if you're using it, since it can grow large quickly.",
    ],
    commonIssues: [
      {
        issue: "A family member says a purchased app or movie isn't showing up as shared",
        fix: "Confirm Purchase Sharing is turned on for both the organizer and the member in Family Sharing settings, then have the member check the App Store's Purchased tab under their name.",
      },
      {
        issue: "Can't invite a family member because they already belong to another family group",
        fix: "That person needs to leave their current Family Sharing group first (or the organizer removes them) before they can accept a new invitation.",
      },
    ],
    faqs: [
      {
        q: "How many people can be in one Family Sharing group?",
        a: "Up to six people total, including the organizer, can share purchases, subscriptions, and storage.",
      },
      {
        q: "Can a family member leave Family Sharing at any time?",
        a: "Yes, adult members can leave whenever they choose from their own Settings, though child accounts can only be removed by the organizer.",
      },
    ],
    tipsAndTricks: [
      "The family organizer can see everyone's device locations right from the Family Sharing screen if Location Sharing is turned on.",
    ],
    relatedSettingIds: ["ios-icloud-account", "ios-screen-time-family", "ios-apple-pay-wallet"],
  },
  {
    id: "ios-sign-in-security",
    title: "Sign-In & Security",
    icon: KeyRound,
    platform: "ios",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Your Apple ID Password and 2FA",
    description:
      "Sign-In & Security is where you change your Apple ID password, view your two-factor authentication trusted phone numbers, and manage which devices are trusted to approve sign-ins.",
    details: [
      "Change Password updates your Apple ID password directly from the device.",
      "Two-Factor Authentication shows and lets you add or remove trusted phone numbers for verification codes.",
      "Get Verification Code generates a login code for signing in on another device or browser.",
      "Legacy Contact lets you designate someone who can access your account after you pass away.",
    ],
    important:
      "You need at least one working trusted phone number or trusted device at all times, or you risk losing access to two-factor verification codes entirely.",
    redirectUrl: "https://support.apple.com/en-us/HT204915",
    afterImageContent: {
      heading: "How Apple ID Security Works",
      paragraphs: [
        "Two-factor authentication requires both your password and a six-digit code sent to a trusted device or phone number, so a stolen password alone can't get into your account.",
        "Trusted devices are ones already signed in with your Apple ID and verified as belonging to you, and they can generate verification codes even without cell service.",
      ],
      steps: [
        "Open Settings → tap your name → Sign-In & Security.",
        "Tap Change Password to update your Apple ID password.",
        "Tap Two-Factor Authentication to review or add trusted phone numbers.",
        "Review the list of devices under 'Devices You Trust' and remove any you don't recognize.",
      ],
    },
    whyItMatters:
      "Your Apple ID password protects your photos, backups, payment methods, and often your primary email account, making it one of the highest-value credentials to keep secure. Two-factor authentication is what stops someone who's guessed or leaked your password from actually getting in, since they'd also need physical access to a trusted device.",
    bestPractices: [
      "Use a unique, strong password for your Apple ID rather than reusing one from another site.",
      "Keep at least two trusted phone numbers on file in case you lose access to one.",
      "Review the trusted devices list occasionally and remove anything you no longer own.",
    ],
    commonIssues: [
      {
        issue: "Not receiving the two-factor verification code by text or call",
        fix: "Check that the trusted phone number is current under Sign-In & Security, and try 'Get Verification Code' from a trusted device instead of waiting on SMS.",
      },
      {
        issue: "Forgot the Apple ID password and can't sign in",
        fix: "Use 'Forgot Password' on the sign-in screen to reset it via a trusted device, trusted phone number, or your recovery key if one is set up.",
      },
    ],
    faqs: [
      {
        q: "Can I turn off two-factor authentication once it's enabled?",
        a: "On most accounts created in the last several years, two-factor authentication is mandatory and can't be disabled since it's core to Apple ID security.",
      },
      {
        q: "What happens if I lose my only trusted device?",
        a: "You can still verify using a trusted phone number, or use Apple's account recovery process, which may take a waiting period for security reasons.",
      },
    ],
    tipsAndTricks: [
      "Set up a Recovery Key for extra protection — just be aware it puts full responsibility for account recovery on you, since Apple can't bypass it.",
    ],
    relatedSettingIds: ["ios-icloud-account", "ios-face-id-passcode", "ios-find-my"],
  },
  {
    id: "ios-mail-contacts-accounts",
    title: "Mail, Contacts, Calendars Accounts",
    icon: Mail,
    platform: "ios",
    category: "accounts-sync-family",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Add Non-iCloud Mail and Calendar Accounts",
    description:
      "This Accounts list is where you add Gmail, Outlook, Yahoo, or other third-party accounts so their mail, contacts, and calendars sync into the built-in Mail, Contacts, and Calendar apps alongside iCloud.",
    details: [
      "Add Account offers one-tap setup for iCloud, Google, Yahoo, Outlook, and other major providers.",
      "Each account can independently toggle syncing for Mail, Contacts, Calendars, Notes, and Reminders.",
      "Fetch New Data settings control how often accounts check for new mail in the background.",
      "Accounts added here appear as separate inboxes and calendars inside their respective apps.",
    ],
    important:
      "Removing an account here deletes its locally synced mail, contacts, and calendar data from the iPhone, though nothing is deleted from the original service.",
    redirectUrl: "https://support.apple.com/en-us/HT201320",
    afterImageContent: {
      heading: "How Multiple Accounts Sync",
      paragraphs: [
        "Each added account uses its own sync protocol (like Exchange or IMAP) to keep mail, contacts, and calendar events updated between the iPhone and that provider's servers.",
        "You can mix and match — for example, syncing only Calendars from a work Outlook account while leaving Mail and Contacts off.",
      ],
      steps: [
        "Open Settings → Mail (or Contacts, or Calendar) → Accounts.",
        "Tap Add Account and choose your provider.",
        "Sign in with that account's credentials.",
        "Choose which data types (Mail, Contacts, Calendars) to sync for that account.",
      ],
    },
    whyItMatters:
      "Most people use more than one email or calendar service — a personal iCloud account and a work Gmail or Outlook account — and this screen is what lets both show up together in the same Mail and Calendar apps instead of juggling separate apps. Getting the sync toggles right also determines whether a missed meeting invite or new email actually shows up as a notification.",
    bestPractices: [
      "Turn off syncing for data types you don't need from a given account to avoid duplicate contacts or cluttered calendars.",
      "Use Fetch New Data settings to balance battery life against how quickly you want new mail to appear.",
      "Double-check which account is set as default for new emails and calendar events if you manage more than one.",
    ],
    commonIssues: [
      {
        issue: "A Gmail or Outlook account stops syncing new mail",
        fix: "Remove and re-add the account, and make sure two-factor authentication or an app-specific password (if required by the provider) is current.",
      },
      {
        issue: "Duplicate contacts appear after adding a second account",
        fix: "This usually happens when the same person exists in both iCloud and the new account — merge duplicates in the Contacts app or turn off Contacts sync for one account.",
      },
    ],
    faqs: [
      {
        q: "Does adding a Gmail account here also sync Google Photos or Drive?",
        a: "No, this Accounts screen only handles Mail, Contacts, Calendars, Notes, and Reminders — other Google services need their own dedicated apps.",
      },
      {
        q: "Can I have more than one Gmail or Outlook account added at once?",
        a: "Yes, you can add multiple accounts from the same or different providers, and each appears as its own separate inbox and calendar.",
      },
    ],
    tipsAndTricks: [
      "Set a non-iCloud account's Fetch setting to 'Manual' if you rarely check it, to save battery and background data.",
    ],
    relatedSettingIds: ["ios-icloud-account", "ios-notifications", "ios-icloud-backup"],
  },
  {
    id: "ios-airpods-settings",
    title: "AirPods Settings",
    icon: Headphones,
    platform: "ios",
    category: "devices-peripherals",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Your Connected AirPods",
    description:
      "Once AirPods are paired, a dedicated settings page appears for them with controls for noise control modes, spatial audio, press-and-hold gestures, and battery levels for each earbud and the case.",
    details: [
      "Switch between Noise Cancellation, Transparency, and Adaptive Audio (on supported models).",
      "Customize what press-and-hold on the stem does for each AirPod.",
      "Turn on Spatial Audio with head tracking for supported video and music content.",
      "View individual battery percentages for the left bud, right bud, and charging case.",
    ],
    important:
      "Some features, like Adaptive Audio and Conversation Awareness, only appear on newer AirPods Pro models and require a recent iOS version.",
    redirectUrl: "https://support.apple.com/airpods",
    afterImageContent: {
      heading: "How the AirPods Settings Page Works",
      paragraphs: [
        "iOS automatically creates a settings entry for AirPods once they've been paired at least once with the device, listed either in Bluetooth settings or near the top of the main Settings app.",
        "Many controls here, like noise control mode, are also mirrored into Control Center for faster access without opening Settings.",
      ],
      steps: [
        "Open Settings and tap your AirPods' name (or Settings → Bluetooth → tap the ⓘ next to your AirPods).",
        "Choose a Noise Control mode as the default or set it per press-and-hold.",
        "Customize the press-and-hold action for each earbud stem.",
        "Toggle Spatial Audio and Automatic Ear Detection as desired.",
      ],
    },
    whyItMatters:
      "AirPods are one of the most frequently used Apple accessories, and small setting changes here — like disabling Automatic Ear Detection or remapping the stem gesture — directly affect daily comfort and battery life. Getting noise control and spatial audio configured properly is also what makes the difference between AirPods feeling like a basic earbud and a fully featured audio accessory.",
    bestPractices: [
      "Turn off Automatic Ear Detection if you want music to keep playing even when you remove one AirPod.",
      "Set Transparency mode as your default if you frequently need to hear your surroundings, like while walking or commuting.",
      "Check the battery widget or the AirPods settings page before a long trip rather than assuming a full charge.",
    ],
    commonIssues: [
      {
        issue: "AirPods settings page or noise control options don't appear",
        fix: "Make sure the AirPods are connected (not just powered on) via Bluetooth, and that iOS is updated, since older software versions may not show every control.",
      },
      {
        issue: "Press-and-hold gesture stopped switching noise control modes",
        fix: "Re-check the assignment under the AirPods settings page, since it can revert to a single fixed mode after a firmware update.",
      },
    ],
    faqs: [
      {
        q: "Do AirPods update their firmware automatically?",
        a: "Yes, firmware updates install automatically in the background while the AirPods are charging and in Bluetooth range of an iPhone — there's no manual way to trigger or check on it precisely.",
      },
      {
        q: "Can I use different noise control settings for each AirPod?",
        a: "No, Noise Cancellation, Transparency, and Adaptive Audio apply to both earbuds together as a single mode, not independently.",
      },
    ],
    tipsAndTricks: [
      "Use 'Find My' to make disconnected AirPods play a sound if you've misplaced them nearby.",
      "Rename your AirPods from this settings page if you own multiple pairs and want to tell them apart quickly.",
    ],
    relatedSettingIds: ["ios-bluetooth", "ios-sounds-haptics", "ios-bluetooth-accessories"],
  },
  {
    id: "ios-apple-watch-pairing",
    title: "Apple Watch",
    icon: Watch,
    platform: "ios",
    category: "devices-peripherals",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Pair and Manage an Apple Watch",
    description:
      "Pairing an Apple Watch is done through the dedicated Watch app on iPhone, which then manages the Watch's settings, apps, and complications, while the paired connection itself is visible under Bluetooth.",
    details: [
      "The Watch app walks through pairing a new Apple Watch by pointing the iPhone camera at the watch face animation.",
      "Once paired, you can install and arrange apps on the Watch remotely from the iPhone.",
      "Cellular Apple Watch models can be managed here to add or remove them from your cellular plan.",
      "Unpairing from the Watch app creates a final backup before erasing the Watch.",
    ],
    important:
      "Unpairing an Apple Watch erases it completely; make sure you don't need to restore from that specific backup on a different iPhone later without re-pairing to this one first.",
    redirectUrl: "https://support.apple.com/en-us/HT204505",
    afterImageContent: {
      heading: "How Apple Watch Pairing Works",
      paragraphs: [
        "An Apple Watch can only be fully paired with one iPhone at a time, and pairing creates an encrypted, ongoing Bluetooth and Wi-Fi connection between the two devices.",
        "The Watch app becomes the control center for nearly every Watch setting afterward, from app layout to health data permissions, rather than managing those from the Watch itself.",
      ],
      steps: [
        "Open the Watch app on iPhone and tap 'Start Pairing'.",
        "Bring the Apple Watch near the iPhone and center it in the camera viewfinder.",
        "Follow the on-screen prompts to set up Apple Pay, Siri, and other features.",
        "Use the Watch app's My Watch tab afterward to adjust any setting remotely.",
      ],
    },
    whyItMatters:
      "Because so much of the Apple Watch's configuration — apps, complications, notification mirroring, health permissions — is actually managed from the iPhone's Watch app rather than on the Watch itself, understanding this relationship is essential to actually using the Watch well. A poor pairing or connectivity issue also breaks notifications, Apple Pay, and health tracking all at once.",
    bestPractices: [
      "Keep the iPhone's Bluetooth and Wi-Fi turned on, since the Watch relies on both for a stable connection.",
      "Back up before unpairing if you plan to set the Watch up again later, so activity history and settings aren't lost.",
      "Review notification mirroring settings in the Watch app so only the alerts you actually want reach your wrist.",
    ],
    commonIssues: [
      {
        issue: "Apple Watch shows a red exclamation point or 'disconnected' icon",
        fix: "Make sure both devices have Bluetooth and Wi-Fi on and are within range, then try toggling Airplane Mode on the Watch off and on to force a reconnect.",
      },
      {
        issue: "Pairing gets stuck partway through or fails repeatedly",
        fix: "Restart both the iPhone and the Watch, make sure iOS and watchOS are up to date, and try unpairing any previous partial pairing before starting again.",
      },
    ],
    faqs: [
      {
        q: "Can I pair the same Apple Watch with a new iPhone?",
        a: "Yes, unpair it from the old iPhone first (or erase it directly on the Watch if the old iPhone isn't available), then pair it fresh with the new iPhone.",
      },
      {
        q: "Does pairing an Apple Watch require the same Apple ID as the iPhone?",
        a: "Yes, the Apple Watch uses the same Apple ID as its paired iPhone for iCloud, Health, and other synced data.",
      },
    ],
    tipsAndTricks: [
      "Use 'Unlock with iPhone' recovery in the Watch app if you forget your Watch passcode, instead of doing a full erase.",
    ],
    relatedSettingIds: ["ios-bluetooth", "ios-find-my", "ios-bluetooth-accessories"],
  },
  {
    id: "ios-continuity-handoff",
    title: "Handoff",
    icon: Share2,
    platform: "ios",
    category: "devices-peripherals",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Continue Activities Across Apple Devices",
    description:
      "Handoff lets you start something — a webpage, email, document, or FaceTime call — on your iPhone and instantly pick it up on a nearby iPad or Mac signed in with the same Apple ID, without saving or sending anything manually.",
    details: [
      "Works across Safari, Mail, Notes, Maps, Messages, and many third-party apps that support it.",
      "Requires both devices to be signed in to the same Apple ID with Bluetooth and Wi-Fi turned on.",
      "A Handoff icon appears in the App Switcher or Dock on the nearby device when an activity is available.",
      "Can also hand off a phone call or FaceTime call between iPhone, iPad, and Mac.",
    ],
    important:
      "Handoff requires devices to be within roughly Bluetooth range of each other and can silently stop working if either device's Bluetooth or Wi-Fi is off.",
    redirectUrl: "https://support.apple.com/en-us/HT204689",
    afterImageContent: {
      heading: "How Handoff Works",
      paragraphs: [
        "Handoff uses a combination of Bluetooth Low Energy for device discovery and Wi-Fi for transferring the actual activity data between nearby devices.",
        "It works automatically in the background for supported apps — there's no manual 'send' step, just picking up the Handoff icon that appears on the other device.",
      ],
      steps: [
        "Open Settings → General → AirPlay & Handoff.",
        "Make sure Handoff is toggled on.",
        "Start an activity, like browsing a webpage in Safari, on your iPhone.",
        "On a nearby iPad or Mac, tap the Handoff icon in the Dock or App Switcher to continue.",
      ],
    },
    whyItMatters:
      "Handoff removes the small daily friction of emailing yourself a link or manually re-opening a document on a second device, which adds up meaningfully if you regularly switch between an iPhone, iPad, and Mac. It's especially useful mid-task — like finishing a phone call on your Mac's keyboard or picking a half-written email back up on a bigger screen.",
    bestPractices: [
      "Keep Bluetooth and Wi-Fi on across all your Apple devices so Handoff can detect nearby activity reliably.",
      "Sign in to the same Apple ID on every device you want Handoff to work between.",
      "Use Handoff for phone calls specifically if you often get calls while working at a Mac.",
    ],
    commonIssues: [
      {
        issue: "Handoff icon never appears on the other device",
        fix: "Confirm Handoff is enabled in Settings → General → AirPlay & Handoff on both devices, and that both are signed in with the same Apple ID and near each other.",
      },
      {
        issue: "Handoff worked before but suddenly stopped",
        fix: "Restart both devices, and check that Bluetooth wasn't accidentally turned off on either one, since that alone breaks Handoff discovery.",
      },
    ],
    faqs: [
      {
        q: "Do I need iCloud enabled for Handoff to work?",
        a: "Yes, both devices need to be signed in to the same Apple ID, though not every iCloud toggle needs to be on for Handoff specifically to function.",
      },
      {
        q: "Does Handoff work over cellular data if Wi-Fi is off?",
        a: "No, Handoff relies on Bluetooth and local Wi-Fi between nearby devices, so it won't work if Wi-Fi is completely turned off.",
      },
    ],
    tipsAndTricks: [
      "Handoff also works for Maps directions — start routing on your iPhone and continue viewing the route on your Mac.",
    ],
    relatedSettingIds: ["ios-airdrop", "ios-bluetooth", "ios-wifi"],
  },
  {
    id: "ios-bluetooth-accessories",
    title: "Bluetooth Accessories",
    icon: Bluetooth,
    platform: "ios",
    category: "devices-peripherals",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Pair Keyboards, Controllers, and Other Accessories",
    description:
      "Beyond audio devices, the Bluetooth settings screen manages any paired accessory — external keyboards, game controllers, car infotainment systems, fitness sensors, and more — under the 'My Devices' list.",
    details: [
      "Discoverable nearby accessories appear under 'Other Devices' ready to pair.",
      "Each paired accessory shows a connection status and a ⓘ button for accessory-specific options.",
      "Game controllers appear here and can also be checked for compatibility inside Game Center-enabled apps.",
      "Car Bluetooth systems pair here to enable hands-free calling and audio streaming while driving.",
    ],
    important:
      "Some accessories, like certain keyboards or car systems, require a one-time numeric pairing code confirmation shown on both devices before they'll connect.",
    redirectUrl: "https://support.apple.com/en-us/HT202042",
    afterImageContent: {
      heading: "How Accessory Pairing Works",
      paragraphs: [
        "Bluetooth pairing creates a trusted, encrypted link between the iPhone and the accessory that's remembered for future automatic reconnection within range.",
        "Different accessory types expose different options on their info screen — a keyboard might show layout settings, while a car system might show Siri and call-audio routing options.",
      ],
      steps: [
        "Open Settings → Bluetooth and make sure Bluetooth is on.",
        "Put the accessory into pairing mode as described in its manual.",
        "Tap the accessory's name once it appears under Other Devices.",
        "Confirm any on-screen pairing code if prompted.",
      ],
    },
    whyItMatters:
      "Modern life runs through a growing list of Bluetooth accessories — keyboards, controllers, hearing aids, car systems, fitness trackers — and this single screen is the control point for all of them on iPhone. A misconfigured or forgotten pairing can silently cause dropped car audio, an unresponsive controller, or a keyboard that won't reconnect.",
    bestPractices: [
      "Forget and re-pair an accessory that's misbehaving rather than repeatedly toggling Bluetooth, since a corrupted pairing often needs a fresh handshake.",
      "Keep frequently used accessories, like a car system, at the top by reconnecting to them regularly so iOS prioritizes them.",
      "Check accessory firmware update prompts when they appear, since outdated accessory firmware is a common cause of dropped connections.",
    ],
    commonIssues: [
      {
        issue: "A previously working accessory won't reconnect automatically",
        fix: "Tap the ⓘ next to the device and choose Forget This Device, then re-pair it from scratch.",
      },
      {
        issue: "Multiple accessories interfere with each other, causing audio glitches",
        fix: "Disconnect accessories you're not actively using from the Bluetooth list to reduce interference and connection competition.",
      },
    ],
    faqs: [
      {
        q: "How many Bluetooth accessories can be paired to one iPhone?",
        a: "There's no strict published limit on paired accessories, but only a limited number can be actively connected and in use simultaneously.",
      },
      {
        q: "Why does my car's Bluetooth system show a different name than expected?",
        a: "Many car systems broadcast a fixed name set by the manufacturer or dealer, which is separate from your iPhone's own device name.",
      },
    ],
    tipsAndTricks: [
      "Tap and hold an accessory in the Bluetooth list for a quick shortcut to Forget This Device without opening its full info screen.",
    ],
    relatedSettingIds: ["ios-bluetooth", "ios-airpods-settings", "ios-apple-watch-pairing"],
  },
  {
    id: "ios-analytics-improvements",
    title: "Analytics & Improvements",
    icon: Activity,
    platform: "ios",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Control Analytics Data Shared With Apple",
    description:
      "Analytics & Improvements controls whether your iPhone automatically sends anonymized crash reports and usage analytics to Apple, and optionally to third-party app developers, to help diagnose problems and improve software.",
    details: [
      "Share iPhone Analytics sends device and app crash logs to Apple for diagnostic purposes.",
      "Share iCloud Analytics sends usage data specifically about iCloud features.",
      "Share With App Developers lets analytics data be shared with the developers of apps you use, when enabled.",
      "Analytics Data lets you view the actual raw crash and diagnostic logs stored on the device.",
    ],
    important:
      "Apple states this analytics data is designed to be anonymized before it's sent, but turning it off entirely is a valid choice if you'd rather not share any usage data.",
    redirectUrl: "https://support.apple.com/en-us/HT202100",
    afterImageContent: {
      heading: "How Analytics Sharing Works",
      paragraphs: [
        "When enabled, the iPhone periodically bundles crash logs and usage statistics and sends them to Apple's servers, typically overnight while charging and on Wi-Fi.",
        "These logs are also viewable directly on the device, which support staff or developers can use for local troubleshooting without needing the data to leave the device at all.",
      ],
      steps: [
        "Open Settings → Privacy & Security → Analytics & Improvements.",
        "Toggle Share iPhone Analytics and Share iCloud Analytics as desired.",
        "Toggle Share With App Developers if you're comfortable sharing analytics with third-party developers.",
        "Tap Analytics Data to browse the actual log files stored on the device.",
      ],
    },
    whyItMatters:
      "This data is genuinely one of the tools Apple and developers use to catch app crashes and performance regressions that don't show up in testing, so leaving it on can indirectly improve software quality over time. On the flip side, it's also a legitimate privacy lever for anyone who prefers to minimize what leaves their device, even in anonymized form.",
    bestPractices: [
      "Leave analytics sharing on if you don't mind contributing anonymized data and want Apple to catch bugs faster.",
      "Turn off 'Share With App Developers' specifically if you're fine sharing with Apple but not third-party developers.",
      "Check Analytics Data yourself after a crash if you're trying to troubleshoot a specific misbehaving app.",
    ],
    commonIssues: [
      {
        issue: "Analytics toggles appear greyed out or unchangeable",
        fix: "This can happen under certain Screen Time or MDM (mobile device management) restrictions — check Screen Time → Content & Privacy Restrictions or contact whoever manages the device profile.",
      },
      {
        issue: "Analytics Data list is empty despite recent app crashes",
        fix: "Logs can take a little time to generate after a crash — reopen the crashed app once more, then check Analytics Data again after a few minutes.",
      },
    ],
    faqs: [
      {
        q: "Does turning off analytics sharing affect iPhone performance?",
        a: "No, it only affects what diagnostic data leaves your device — it has no effect on how the iPhone itself performs.",
      },
      {
        q: "Can I see exactly what data is being shared with Apple?",
        a: "Yes, tapping into Analytics Data lets you open and read the actual log files that would be shared, in plain text form.",
      },
    ],
    tipsAndTricks: [
      "A crash log's filename and timestamp under Analytics Data can help pinpoint exactly which app crash you're troubleshooting.",
    ],
    relatedSettingIds: ["ios-privacy-permissions", "ios-diagnostics-log", "ios-location-services"],
  },
  {
    id: "ios-recovery-mode-restore",
    title: "Recovery Mode & Restore",
    icon: RefreshCw,
    platform: "ios",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Restore an iPhone That Won't Start Normally",
    description:
      "Recovery Mode is a special startup state used with a computer running Finder (or iTunes on older systems) to reinstall or restore iOS when an iPhone is frozen, stuck on the Apple logo, or won't update normally.",
    details: [
      "Entered using a specific button-press sequence that varies by iPhone model.",
      "Connects to a Mac or PC, which then offers to Update (keeping data) or Restore (erasing data) the device.",
      "Update in Recovery Mode reinstalls iOS while attempting to preserve existing data.",
      "Restore in Recovery Mode erases the device entirely and reinstalls iOS from scratch.",
    ],
    important:
      "Always try Update before Restore in Recovery Mode, since Update preserves your data while Restore erases everything on the device.",
    redirectUrl: "https://support.apple.com/en-us/HT201263",
    afterImageContent: {
      heading: "How Recovery Mode Works",
      paragraphs: [
        "Recovery Mode bypasses the normal iOS boot process entirely, connecting the iPhone to a computer in a low-level state so Finder or iTunes can reinstall the operating system.",
        "It's the go-to fix when an iPhone is unresponsive to normal restarts or force restarts, or when a software update fails and leaves the device stuck.",
      ],
      steps: [
        "Connect the iPhone to a computer with a cable and open Finder (or iTunes).",
        "Use your model's specific button sequence to force it into Recovery Mode.",
        "When the computer detects a device in Recovery Mode, choose Update first.",
        "If Update fails or the issue persists, use Restore as a last resort, understanding it erases the device.",
      ],
    },
    whyItMatters:
      "Recovery Mode is often the only way to bring back an iPhone that's completely stuck — frozen at startup, unresponsive to force restarts, or bricked by a failed update — without a trip to a repair shop. Knowing the difference between Update and Restore in this mode can be the difference between fixing the device with your data intact or losing everything unnecessarily.",
    bestPractices: [
      "Keep a recent iCloud or computer backup so a Restore in Recovery Mode, if it becomes necessary, isn't catastrophic.",
      "Try a standard force restart first, since Recovery Mode should be a later step, not the first thing you try.",
      "Use a genuine or certified Lightning/USB-C cable, since some third-party cables fail to maintain the connection Recovery Mode needs.",
    ],
    commonIssues: [
      {
        issue: "iPhone won't enter Recovery Mode with the button sequence",
        fix: "Double-check the exact sequence for your specific iPhone model, since it differs between Face ID models, Touch ID models with a Home button, and older devices.",
      },
      {
        issue: "Finder or iTunes doesn't detect the iPhone in Recovery Mode",
        fix: "Try a different USB port or cable, restart the computer, and make sure Finder or iTunes is fully up to date.",
      },
    ],
    faqs: [
      {
        q: "Is Recovery Mode the same as DFU (Device Firmware Update) mode?",
        a: "No, DFU mode is a deeper, more thorough restore state used mainly by advanced troubleshooting or repair scenarios, while Recovery Mode is the more common everyday fix.",
      },
      {
        q: "Will using Recovery Mode's Update option delete my apps and photos?",
        a: "No, the Update option is designed to reinstall iOS while preserving your existing data, unlike the Restore option which erases everything.",
      },
    ],
    tipsAndTricks: [
      "If Update in Recovery Mode fails twice, the device usually needs a full Restore followed by restoring from a backup rather than repeated Update attempts.",
    ],
    relatedSettingIds: ["ios-reset-iphone", "ios-software-update", "ios-icloud-backup"],
  },
  {
    id: "ios-diagnostics-log",
    title: "Diagnostic Log",
    icon: FileText,
    platform: "ios",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "View Crash and Diagnostic Reports",
    description:
      "Every app crash or system hang on iPhone generates a diagnostic log you can view directly on the device, useful for troubleshooting a misbehaving app yourself or sharing details with a developer or support team.",
    details: [
      "Logs are listed by app name and timestamp, newest first.",
      "Each log can be opened, viewed as text, and shared via Mail, Messages, or Files.",
      "Logs include technical details like the crash type, memory state, and process being run at the time.",
      "Older logs are automatically cleared after a period of time or once storage is needed elsewhere.",
    ],
    important:
      "Diagnostic logs contain technical crash details, not personal file contents, but developers sometimes ask for them by name — know how to locate and share the right one quickly.",
    redirectUrl: "https://support.apple.com/iphone",
    afterImageContent: {
      heading: "How Diagnostic Logs Work",
      paragraphs: [
        "Every time an app crashes or the system detects an unresponsive process, iOS automatically writes a structured log capturing what the app or system was doing at that moment.",
        "These logs live locally on the device and are only shared with Apple or developers if you explicitly enable analytics sharing or manually export one.",
      ],
      steps: [
        "Open Settings → Privacy & Security → Analytics & Improvements → Analytics Data.",
        "Scroll or search for the log matching the app and approximate crash time.",
        "Tap the log entry to view its contents.",
        "Tap the Share icon to export it via Mail, Messages, or Files if a developer requested it.",
      ],
    },
    whyItMatters:
      "When an app crashes repeatedly and support asks 'do you have the crash log,' this is exactly where to find it — without it, developers are often diagnosing blind. Being able to locate and share a specific diagnostic log can turn a vague bug report into a fixable one much faster.",
    bestPractices: [
      "Note the approximate time an app crashed so you can quickly find the matching log afterward.",
      "Share the specific log file rather than a screenshot when a developer requests crash details, since the raw log has far more diagnostic information.",
      "Periodically clear old logs you no longer need if you're manually managing device storage closely.",
    ],
    commonIssues: [
      {
        issue: "Can't find a log for an app that just crashed",
        fix: "Reopen the app once to let iOS finish generating the log, then check Analytics Data again after a minute or two.",
      },
      {
        issue: "The log list is very long and hard to search through",
        fix: "Logs are typically sorted newest-first and named after the app, so scroll from the top or use the search field if available for your iOS version.",
      },
    ],
    faqs: [
      {
        q: "Do diagnostic logs contain my personal photos or messages?",
        a: "No, they contain technical crash and performance data about the app or system process, not the content of your personal files.",
      },
      {
        q: "Can I delete diagnostic logs manually?",
        a: "iOS manages log retention automatically, though you can share and then ignore ones you don't need — there isn't always a direct manual delete option for individual logs.",
      },
    ],
    tipsAndTricks: [
      "If an app keeps crashing, export a handful of its recent logs at once rather than just one, since a pattern across logs can reveal the real cause faster.",
    ],
    relatedSettingIds: ["ios-analytics-improvements", "ios-battery-health-troubleshoot", "ios-general-about"],
  },
  {
    id: "ios-battery-health-troubleshoot",
    title: "Battery Health & Charging",
    icon: BatteryCharging,
    platform: "ios",
    category: "troubleshooting-diagnostics",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Diagnose Battery Wear and Charging Behavior",
    description:
      "Battery Health & Charging shows your battery's Maximum Capacity as a percentage of its original capacity, its Peak Performance Capability status, and charging optimization options — the key diagnostic info for battery-related complaints.",
    details: [
      "Maximum Capacity estimates how much charge the battery can hold compared to when new.",
      "Peak Performance Capability shows whether the battery can currently support full performance without unexpected shutdowns.",
      "Optimized Battery Charging slows charging past 80% when it predicts you won't need a full charge soon, to reduce wear.",
      "A recommendation to service the battery appears here automatically once capacity drops significantly.",
    ],
    important:
      "All rechargeable batteries wear down with normal use over time — a declining Maximum Capacity percentage is expected aging, not necessarily a defect.",
    redirectUrl: "https://support.apple.com/en-us/HT208387",
    afterImageContent: {
      heading: "How Battery Health Reporting Works",
      paragraphs: [
        "iOS continuously tracks charge cycles and battery chemistry to estimate Maximum Capacity, giving a rough but useful picture of long-term battery wear.",
        "If the battery has degraded enough that it can't reliably deliver peak power, iOS may briefly reduce performance during demand spikes to prevent an unexpected shutdown, which shows up here as a Peak Performance Capability note.",
      ],
      steps: [
        "Open Settings → Battery → Battery Health & Charging.",
        "Check the Maximum Capacity percentage.",
        "Review the Peak Performance Capability status underneath it.",
        "Turn on Optimized Battery Charging if you want to slow long-term wear.",
      ],
    },
    whyItMatters:
      "Battery complaints — 'my phone dies too fast' or 'it shuts off randomly' — are among the most common iPhone support issues, and this screen is the actual diagnostic source of truth rather than guesswork. It's also how you know objectively whether a battery replacement is worth pursuing instead of just living with reduced battery life.",
    bestPractices: [
      "Turn on Optimized Battery Charging if the phone is regularly plugged in overnight, to slow long-term capacity loss.",
      "Avoid letting the battery repeatedly drain to 0% or sit at 100% for extended periods when avoidable.",
      "Consider a battery service once Maximum Capacity drops meaningfully below 80%, especially if you notice unexpected shutdowns.",
    ],
    commonIssues: [
      {
        issue: "Maximum Capacity shows a lower number than expected for the phone's age",
        fix: "This can be normal for heavy daily use, but if it's unusually low for a newer phone, Apple may offer a battery service option — check eligibility on the same screen.",
      },
      {
        issue: "Phone shuts down unexpectedly even with charge remaining",
        fix: "Check Peak Performance Capability status here — if performance management has been applied, a battery replacement typically resolves the unexpected shutdowns.",
      },
    ],
    faqs: [
      {
        q: "What's considered a 'normal' Maximum Capacity percentage?",
        a: "Apple designs the battery to retain up to 80% of its original capacity at 1,000 complete charge cycles under normal conditions, so numbers in that range at that usage level are expected, not faulty.",
      },
      {
        q: "Does using Optimized Battery Charging slow down how fast the phone charges?",
        a: "It can delay finishing the last portion of a charge past 80% when it's confident you won't need it right away, but it's designed to still have the phone fully charged by your typical usage time.",
      },
    ],
    tipsAndTricks: [
      "Turn off Optimized Battery Charging temporarily before a trip if you need a full, fast charge on a predictable schedule.",
    ],
    relatedSettingIds: ["ios-battery", "ios-diagnostics-log", "ios-software-update"],
  },
  {
    id: "ios-icloud-storage-manage",
    title: "Manage iCloud Storage",
    icon: PieChart,
    platform: "ios",
    category: "storage-backup-data",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "See What's Using Your iCloud Storage",
    description:
      "This screen breaks down exactly what's consuming your iCloud storage plan — Backups, Photos, individual apps, Mail — so you can free up space, buy more, or change your iCloud+ plan without guessing.",
    details: [
      "A color-coded bar shows the split between Backup, Photos, and other categories.",
      "Tapping a category (like an old device backup) lets you delete it directly to free space.",
      "Change Storage Plan lets you upgrade, downgrade, or cancel an iCloud+ subscription.",
      "Shared storage used by a Family Sharing group is also reflected here for the organizer.",
    ],
    important:
      "Deleting an old device's iCloud Backup here permanently removes that backup — make sure you don't need to restore from it before removing it.",
    redirectUrl: "https://support.apple.com/en-us/HT207594",
    afterImageContent: {
      heading: "How iCloud Storage Management Works",
      paragraphs: [
        "iCloud storage is shared across every app and service using it — Photos, Backup, Mail, Drive, and even other family members if storage is shared — so this screen consolidates all of it into one view.",
        "Freeing space here can mean deleting old backups you no longer need, thinning out Photos, or simply upgrading to a larger iCloud+ tier.",
      ],
      steps: [
        "Open Settings → tap your name → iCloud → Manage Account Storage (or Manage Storage).",
        "Review the breakdown of what's using space, largest first.",
        "Tap a category, like Backups, to see and delete items you don't need.",
        "Tap Change Storage Plan if you'd rather upgrade than delete anything.",
      ],
    },
    whyItMatters:
      "Running out of iCloud storage quietly breaks iPhone backups and Photos syncing without always giving an obvious warning, so this screen is the fastest way to diagnose why backups have silently stopped working. It's also the only place to compare the cost of deleting old data against simply paying for more storage.",
    bestPractices: [
      "Delete backups from devices you no longer own instead of letting them silently take up space indefinitely.",
      "Check this screen before assuming you need to buy more storage — old backups are often the biggest easy win.",
      "Consider a shared Family Sharing storage plan if multiple family members are each paying for separate iCloud+ tiers.",
    ],
    commonIssues: [
      {
        issue: "iCloud Backup keeps failing with a storage full message",
        fix: "Delete backups for devices you no longer use, or reduce what iCloud Photos and Messages are storing, then retry the backup.",
      },
      {
        issue: "Storage breakdown looks outdated compared to what you just deleted",
        fix: "Give it a few minutes and pull down to refresh the screen — the numbers update after iCloud finishes processing the deletion.",
      },
    ],
    faqs: [
      {
        q: "Does deleting photos from iCloud here also delete them from my iPhone?",
        a: "If iCloud Photos is enabled, yes — Photos syncs both ways, so deleting a photo from iCloud storage removes it everywhere it's synced, not just the cloud copy.",
      },
      {
        q: "Can I downgrade my iCloud+ plan if I'm using less storage than before?",
        a: "Yes, Change Storage Plan lets you move to a smaller tier, though you'll need to first get your used storage under the new plan's limit.",
      },
    ],
    tipsAndTricks: [
      "Tap into 'Backups' specifically to see a per-app breakdown of what's bloating a single device's iCloud Backup, like large chat history in a messaging app.",
    ],
    relatedSettingIds: ["ios-iphone-storage", "ios-icloud-backup", "ios-icloud-photos-optimize"],
  },
  {
    id: "ios-offload-unused-apps",
    title: "Offload Unused Apps",
    icon: Archive,
    platform: "ios",
    category: "storage-backup-data",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Automatically Free Space From Rarely Used Apps",
    description:
      "Offload Unused Apps is a toggle in App Store settings that automatically removes an app's binary — not its documents or data — when the iPhone is low on storage, so you can reinstall and pick up right where you left off.",
    details: [
      "Only triggers automatically when the device is genuinely low on available storage.",
      "Keeps app data, documents, and settings intact even after the app itself is offloaded.",
      "Offloaded apps show a small cloud-download icon on their Home Screen icon.",
      "Individual apps can also be offloaded manually anytime from iPhone Storage, regardless of this toggle.",
    ],
    important:
      "Offloading isn't the same as deleting — but if you manually delete an app instead of letting it offload, its local data is removed too, unless backed up elsewhere.",
    redirectUrl: "https://support.apple.com/en-us/HT202180",
    afterImageContent: {
      heading: "How App Offloading Works",
      paragraphs: [
        "When storage runs critically low, iOS looks for apps you haven't opened in a while and removes just the app binary — the part that takes up the most space — while preserving its saved documents and data.",
        "Reinstalling an offloaded app from the App Store restores its data automatically, making the process feel nearly seamless compared to a full delete-and-reinstall.",
      ],
      steps: [
        "Open Settings → App Store.",
        "Turn on the toggle for Offload Unused Apps.",
        "Let iOS automatically manage offloading during low-storage moments going forward.",
        "Tap a greyed-out, offloaded app icon anytime to redownload it instantly.",
      ],
    },
    whyItMatters:
      "This single toggle quietly prevents the classic 'my phone is full and I don't know what to delete' scenario by letting iOS handle app cleanup automatically and safely, without you losing game progress, documents, or settings. It's one of the lowest-risk storage optimizations available on iPhone.",
    bestPractices: [
      "Turn this on and largely forget about it — it's designed to only act when storage is genuinely tight.",
      "Manually offload a specific rarely used app from iPhone Storage if you want the space back right away rather than waiting.",
      "Redownload an offloaded app over Wi-Fi when possible to avoid using cellular data unexpectedly.",
    ],
    commonIssues: [
      {
        issue: "An app was offloaded and now shows as needing to be redownloaded",
        fix: "This is expected behavior — tap the app's greyed-out icon to redownload it from the App Store, and its data will be restored automatically.",
      },
      {
        issue: "Offloading doesn't seem to free as much space as expected",
        fix: "Offloading only removes the app binary, not any documents or media the app stored separately — check iPhone Storage for what specifically is still using space.",
      },
    ],
    faqs: [
      {
        q: "Will I lose my game progress or app login if it gets offloaded?",
        a: "No, offloading is specifically designed to preserve app data and documents, so progress and logins are restored automatically when you reinstall.",
      },
      {
        q: "Can I choose exactly which apps are eligible for automatic offloading?",
        a: "Not individually — the automatic system decides based on usage patterns, but you can always manually offload or exempt an app from iPhone Storage yourself.",
      },
    ],
    tipsAndTricks: [
      "Offloaded apps still show their icon and name on the Home Screen, so you won't lose track of where they were.",
    ],
    relatedSettingIds: ["ios-iphone-storage", "ios-app-store-settings", "ios-icloud-storage-manage"],
  },
  {
    id: "ios-icloud-photos-optimize",
    title: "Optimize iPhone Storage (Photos)",
    icon: Image,
    platform: "ios",
    category: "storage-backup-data",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Keep Lightweight Photos Locally, Full-Res in iCloud",
    description:
      "When iCloud Photos is on, 'Optimize iPhone Storage' keeps smaller, space-saving versions of your photos and videos on the device while the full-resolution originals stay safely stored in iCloud, downloading full quality only when needed.",
    details: [
      "Optimize iPhone Storage is one of two modes; the alternative, Download and Keep Originals, stores full-res files locally too.",
      "Optimized photos automatically download in full resolution when you open, edit, or share them.",
      "Storage is freed automatically and dynamically based on how much space the device needs.",
      "Requires iCloud Photos to be turned on — it doesn't apply if Photos syncing is off.",
    ],
    important:
      "If you turn off iCloud entirely or lose internet access, optimized (space-saving) photos may not be available in full resolution until they finish downloading.",
    redirectUrl: "https://support.apple.com/en-us/HT204264",
    afterImageContent: {
      heading: "How Optimized Photo Storage Works",
      paragraphs: [
        "With Optimize iPhone Storage on, iOS keeps a smaller, device-appropriate version of each photo locally, while the full-resolution original lives safely in iCloud rather than taking up local space.",
        "The moment you tap to view, edit, or share a photo, iOS automatically fetches the full-resolution version in the background over Wi-Fi or cellular.",
      ],
      steps: [
        "Open Settings → tap your name → iCloud → Photos.",
        "Make sure Sync this iPhone (iCloud Photos) is turned on.",
        "Select Optimize iPhone Storage under Photo/Video storage options.",
        "Let iOS manage local storage automatically going forward.",
      ],
    },
    whyItMatters:
      "Photo and video libraries are consistently one of the largest storage consumers on iPhone, and this single setting is what lets a device with modest storage still hold a library of thousands of photos without running out of space. It quietly resolves what would otherwise be one of the most common storage complaints.",
    bestPractices: [
      "Leave Optimize iPhone Storage on for most day-to-day use, especially on devices with smaller storage tiers.",
      "Switch to Download and Keep Originals temporarily before travel somewhere without reliable internet, if you'll need full-res access offline.",
      "Make sure iCloud Backup or another backup method is active too, since optimized local copies aren't a substitute for a real backup.",
    ],
    commonIssues: [
      {
        issue: "Photos appear blurry or low-quality immediately after opening them",
        fix: "This is temporary while the full-resolution version downloads from iCloud — wait a moment on a stable connection, and it will sharpen automatically.",
      },
      {
        issue: "Local storage doesn't shrink right after turning on Optimize iPhone Storage",
        fix: "Give the device time on Wi-Fi and power to finish thinning locally stored originals — it's a gradual background process, not instantaneous.",
      },
    ],
    faqs: [
      {
        q: "Does Optimize iPhone Storage delete my original photos?",
        a: "No, full-resolution originals remain safely stored in iCloud; only the local, on-device copy is replaced with a smaller version.",
      },
      {
        q: "What happens to optimized photos if I turn off iCloud Photos later?",
        a: "iOS will prompt you to either download all full-resolution photos to the device or keep them only in iCloud, depending on available local storage.",
      },
    ],
    tipsAndTricks: [
      "Editing a photo forces it to download in full resolution first, so heavy editing sessions work best on a solid Wi-Fi connection.",
    ],
    relatedSettingIds: ["ios-iphone-storage", "ios-icloud-storage-manage", "ios-icloud-backup"],
  },
  {
    id: "ios-legal-regulatory",
    title: "Legal & Regulatory",
    icon: Scale,
    platform: "ios",
    category: "system-info",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "View Legal Notices and Regulatory Info",
    description:
      "Legal & Regulatory, tucked under General, lists the legal notices, open-source license acknowledgments, and regulatory certification numbers (like FCC ID) tied to your specific iPhone model.",
    details: [
      "Shows regulatory certification identifiers required in different countries and regions.",
      "Lists software license acknowledgments for open-source components used in iOS.",
      "Includes links to Apple's legal terms covering the device and software.",
      "Certification details here can vary slightly depending on your iPhone model and region.",
    ],
    redirectUrl: "https://www.apple.com/legal/",
    afterImageContent: {
      heading: "Why This Screen Exists",
      paragraphs: [
        "Regulators in many countries require devices to display specific certification numbers and compliance information, and Apple consolidates all of it here instead of printing it physically on the device.",
        "This is also where Apple fulfills open-source license disclosure obligations for any third-party code included in iOS.",
      ],
      steps: [
        "Open Settings → General → Legal & Regulatory.",
        "Scroll to find the regulatory certification section for your region.",
        "Tap into any linked legal document for the full text.",
        "Note the specific certification number if a regulator or repair provider requests it.",
      ],
    },
    whyItMatters:
      "This is rarely needed day-to-day, but it becomes important when dealing with customs, regulatory compliance questions, or verifying a device's authenticity and certification for a specific country. It's also the transparent record of exactly which open-source software is built into iOS.",
    bestPractices: [
      "Check this screen if a customs or regulatory form asks for your device's certification number.",
      "Reference it if you need to confirm iOS's open-source license disclosures for compliance purposes.",
      "Don't confuse this with warranty information — it's purely legal and regulatory documentation, not support coverage.",
    ],
    commonIssues: [
      {
        issue: "Can't find a specific certification number requested by a regulator or customs form",
        fix: "Scroll through the full regulatory section here, as it lists multiple certifications by country/region, and cross-reference the exact one needed.",
      },
      {
        issue: "Confusing this screen with warranty or AppleCare coverage information",
        fix: "Warranty and coverage details live under a separate 'Coverage' entry on the About screen, not under Legal & Regulatory.",
      },
    ],
    faqs: [
      {
        q: "Does this screen show my AppleCare warranty status?",
        a: "No, warranty and AppleCare coverage are shown separately on the General → About screen, not under Legal & Regulatory.",
      },
      {
        q: "Why does the certification info vary by region?",
        a: "Different countries have different regulatory bodies and requirements, so Apple lists the certification relevant to where the specific device unit was sold or activated.",
      },
    ],
    tipsAndTricks: [
      "The open-source license list here can be useful if you're verifying which licensed components ship inside iOS for compliance reasons.",
    ],
    relatedSettingIds: ["ios-general-about", "ios-diagnostics-usage-info", "ios-language-region"],
  },
  {
    id: "ios-carrier-info",
    title: "Carrier",
    icon: Signal,
    platform: "ios",
    category: "system-info",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Check Your Carrier and SIM Details",
    description:
      "The Carrier entry (and the Carrier section under General → About) shows which cellular carrier your SIM or eSIM is currently registered with, along with the installed Carrier Settings update version.",
    details: [
      "Displays your current carrier's name as recognized by the SIM or eSIM.",
      "Shows the Carrier Settings version, which controls things like network names, voicemail, and hotspot behavior.",
      "Prompts to update Carrier Settings appear automatically when your carrier releases a new version.",
      "Dual-SIM iPhones show carrier info separately for each active line.",
    ],
    important:
      "Carrier Settings updates are separate from iOS updates and are pushed by your specific carrier, not by Apple directly.",
    redirectUrl: "https://support.apple.com/iphone",
    afterImageContent: {
      heading: "How Carrier Settings Work",
      paragraphs: [
        "Carrier Settings are small configuration files, specific to your mobile carrier, that fine-tune things like network behavior, hotspot support, and visual voicemail — separate from the iOS software itself.",
        "When your carrier releases an update, iOS checks for it automatically over Wi-Fi or cellular and prompts you to install it.",
      ],
      steps: [
        "Open Settings → General → About and look for the Carrier entry.",
        "Check the currently installed Carrier Settings version listed there.",
        "If prompted, install any available carrier settings update.",
        "For dual-SIM setups, check each line's carrier info separately if needed.",
      ],
    },
    whyItMatters:
      "Carrier issues — no signal, hotspot not working, visual voicemail broken — are frequently fixed simply by installing a pending Carrier Settings update, making this one of the fastest troubleshooting checks for cellular problems. Knowing where to check the carrier name and version also helps quickly confirm you're on the right network after switching SIMs or carriers.",
    bestPractices: [
      "Install Carrier Settings updates promptly when prompted, since they often resolve network-specific bugs.",
      "Check this info first when troubleshooting hotspot, voicemail, or signal problems before assuming it's a hardware issue.",
      "Confirm the right carrier is shown here after inserting a new SIM or activating a new eSIM.",
    ],
    commonIssues: [
      {
        issue: "No prompt appears for a Carrier Settings update even though issues persist",
        fix: "Restart the iPhone and ensure it has cellular or Wi-Fi connectivity, since the update check happens automatically and silently in the background.",
      },
      {
        issue: "Carrier name shows as 'No Service' or a generic label instead of the real carrier",
        fix: "Reseat the physical SIM card or reset the eSIM's cellular plan, and confirm the account is active with the carrier directly.",
      },
    ],
    faqs: [
      {
        q: "Are Carrier Settings updates the same as iOS updates?",
        a: "No, Carrier Settings updates are small, carrier-specific configuration files pushed independently of full iOS software updates.",
      },
      {
        q: "Do I need to do anything after switching to a new carrier?",
        a: "Usually the correct carrier name and settings appear automatically after activation, but installing any prompted Carrier Settings update helps ensure full compatibility.",
      },
    ],
    tipsAndTricks: [
      "If a Carrier Settings update seems stuck, toggling Airplane Mode on and off can sometimes trigger the check again immediately.",
    ],
    relatedSettingIds: ["ios-cellular-data", "ios-diagnostics-usage-info", "ios-general-about"],
  },
  {
    id: "ios-diagnostics-usage-info",
    title: "System Diagnostics Info",
    icon: Info,
    platform: "ios",
    category: "system-info",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Find Your Model, Serial, and Firmware Details",
    description:
      "The About screen under General is the definitive source for an iPhone's exact model name/number, serial number, IMEI/MEID, modem firmware version, and other identifiers often needed for support, insurance, or trade-in.",
    details: [
      "Shows the device name, iOS version, model name and number, and serial number.",
      "Lists IMEI (or MEID) and eSIM details needed for carrier activation or support calls.",
      "Displays modem firmware version, useful for advanced cellular troubleshooting.",
      "Includes total storage capacity and available storage at a glance.",
    ],
    redirectUrl: "https://support.apple.com/en-us/HT204073",
    afterImageContent: {
      heading: "How to Read the About Screen",
      paragraphs: [
        "The About screen aggregates hardware and software identifiers that are otherwise printed nowhere on the physical device on modern iPhones, since there's no removable back panel with a label.",
        "Support agents, insurance claims, trade-in services, and carrier activations all typically ask for one or more of these exact identifiers.",
      ],
      steps: [
        "Open Settings → General → About.",
        "Scroll to find Serial Number, IMEI, or Model Number as needed.",
        "Tap and hold a field like Serial Number to copy it directly.",
        "Reference Modem Firmware if a carrier or support agent specifically asks for it.",
      ],
    },
    whyItMatters:
      "Almost every official interaction about your iPhone — a warranty claim, a trade-in appraisal, a carrier activation, an insurance claim — starts with one of the identifiers on this screen, so knowing exactly where to find them quickly saves real time. It's also the fastest way to confirm you have the exact model and storage capacity you think you have.",
    bestPractices: [
      "Tap and hold any field like Serial Number or IMEI to copy it instantly rather than retyping it manually.",
      "Screenshot or note your serial number somewhere safe before sending a device in for repair or trade-in.",
      "Double check your exact Model Number here if you need to verify compatibility with an accessory or carrier.",
    ],
    commonIssues: [
      {
        issue: "A support agent or carrier asks for the IMEI but you can't find the physical SIM tray label",
        fix: "Skip the tray entirely and get the IMEI directly from Settings → General → About, where it's always accurate and easy to copy.",
      },
      {
        issue: "Trade-in or insurance provider says the serial number doesn't match",
        fix: "Re-copy the serial number directly from About rather than typing it manually, since a single mistyped character is a common cause of mismatches.",
      },
    ],
    faqs: [
      {
        q: "Where can I find my iPhone's IMEI without going into Settings?",
        a: "It's also printed on the original box and etched on the SIM tray of some models, but the About screen in Settings is the most reliable and always-current source.",
      },
      {
        q: "Does the Model Number here tell me if my iPhone is unlocked?",
        a: "Not directly — model numbers can hint at regional variants, but carrier lock status is best confirmed through your carrier or Apple's official IMEI check tools.",
      },
    ],
    tipsAndTricks: [
      "The About screen's storage figure is the true usable capacity, which is always somewhat less than the marketed capacity due to system reserves.",
    ],
    relatedSettingIds: ["ios-general-about", "ios-carrier-info", "ios-software-update"],
  },
  {
    id: "ios-automatic-updates",
    title: "Automatic Updates",
    icon: Moon,
    platform: "ios",
    category: "system-updates",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Let iOS Install Updates Overnight",
    description:
      "Automatic Updates, found inside Software Update settings, controls whether iOS downloads and installs new versions on its own overnight — while charging and on Wi-Fi — without you needing to tap through it manually.",
    details: [
      "A separate toggle controls Automatically Download versus Automatically Install.",
      "Updates typically install overnight while the iPhone is locked, charging, and connected to Wi-Fi.",
      "Security Responses can be configured to install automatically even faster than full iOS updates.",
      "You can still check for and install updates manually anytime, regardless of these toggles.",
    ],
    important:
      "Automatic installs still require the device to be charging and connected to Wi-Fi overnight — they won't happen on cellular data alone or with the battery critically low.",
    redirectUrl: "https://support.apple.com/en-us/HT204204",
    afterImageContent: {
      heading: "How Automatic Updates Work",
      paragraphs: [
        "iOS checks for new versions in the background and, when Automatic Updates is on, downloads them ahead of time so they're ready to install as soon as conditions are right.",
        "The actual install typically happens overnight, since it requires a restart and works best when you're not actively using the device.",
      ],
      steps: [
        "Open Settings → General → Software Update → Automatic Updates.",
        "Turn on Download iOS Updates.",
        "Turn on Install iOS Updates.",
        "Leave the iPhone charging and on Wi-Fi overnight so updates can complete.",
      ],
    },
    whyItMatters:
      "Security patches only protect you once they're actually installed, and Automatic Updates is what closes that gap without relying on you to remember to check manually. It's one of the single most effective 'set it and forget it' security habits available on iPhone.",
    bestPractices: [
      "Turn on both Download and Install toggles so updates require zero manual effort.",
      "Charge your iPhone overnight on Wi-Fi regularly so automatic installs actually get the chance to run.",
      "Still check manually before a major event or trip, since automatic installs run on their own schedule, not instantly.",
    ],
    commonIssues: [
      {
        issue: "Automatic Updates never seem to actually install overnight",
        fix: "Confirm the iPhone is charging, locked, and connected to Wi-Fi overnight, and that both Download and Install toggles are enabled.",
      },
      {
        issue: "An update installed automatically at an inconvenient time",
        fix: "Automatic installs are designed to run overnight, but if timing is a problem, turn off Install iOS Updates and install manually on your own schedule instead.",
      },
    ],
    faqs: [
      {
        q: "Can I turn on automatic downloading but keep installing manual?",
        a: "Yes, Download iOS Updates and Install iOS Updates are separate toggles, so you can let it download ahead of time while still choosing when to install.",
      },
      {
        q: "Does Automatic Updates work over cellular data?",
        a: "Large iOS updates generally require Wi-Fi to download automatically, though smaller Security Responses may be more flexible depending on iOS version and settings.",
      },
    ],
    tipsAndTricks: [
      "Automatic Updates and Security Responses & System Files have separate toggles — turn both on for the fastest possible protection against newly discovered vulnerabilities.",
    ],
    relatedSettingIds: ["ios-software-update", "ios-update-history", "ios-beta-updates"],
  },
  {
    id: "ios-update-history",
    title: "Update History",
    icon: History,
    platform: "ios",
    category: "system-updates",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "See Every iOS Version Installed on This Device",
    description:
      "Update History, found on the General → About screen, lists every iOS and iPadOS version that has ever been installed on this specific device, along with the date each one was installed.",
    details: [
      "Lists each installed version number alongside its install date.",
      "Includes both full iOS version updates and smaller Security Responses.",
      "Useful for confirming exactly when a specific update was applied.",
      "Doesn't include updates that failed partway through or were never completed.",
    ],
    redirectUrl: "https://support.apple.com/en-us/HT201222",
    afterImageContent: {
      heading: "How Update History Works",
      paragraphs: [
        "Every time iOS finishes installing a new version, it logs the version number and the date, building a running timeline of the device's software history.",
        "This history is device-specific — it doesn't transfer if you restore a fresh device from a backup on new hardware.",
      ],
      steps: [
        "Open Settings → General → About.",
        "Scroll down and tap iOS Update History (or similar, depending on iOS version).",
        "Review the list of installed versions and their install dates.",
        "Cross-reference a specific update date if troubleshooting when an issue started.",
      ],
    },
    whyItMatters:
      "When trying to pin down exactly when a bug or behavior change started, Update History gives you an objective timeline instead of relying on memory. It's also a quick way to confirm that a specific security update you expected to install actually completed successfully.",
    bestPractices: [
      "Check Update History after troubleshooting to confirm an update actually completed rather than assuming from a notification alone.",
      "Reference the dates here if you're trying to correlate a new issue with a recent software update.",
      "Don't rely on this list to include partially failed installs — it only shows successfully completed updates.",
    ],
    commonIssues: [
      {
        issue: "A recently installed update doesn't appear in the history yet",
        fix: "Restart the iPhone, since the history list can take a moment to refresh after an install completes.",
      },
      {
        issue: "Can't tell whether a Security Response or a full iOS update was installed on a given date",
        fix: "Security Responses typically show a letter suffix (like 18.1.1 (a)) in the version number, distinguishing them from full iOS releases.",
      },
    ],
    faqs: [
      {
        q: "Does Update History carry over when I set up a new iPhone from a backup?",
        a: "No, Update History reflects the physical device's own software timeline, so a new iPhone starts its own fresh history regardless of what backup you restore.",
      },
      {
        q: "Can I use Update History to undo or roll back to a previous iOS version?",
        a: "No, this screen is informational only — reverting to an older iOS version isn't officially supported by Apple in almost all cases.",
      },
    ],
    tipsAndTricks: [
      "Update History is a handy way to double-check that a Security Response installed successfully after a prompt, without digging through notifications.",
    ],
    relatedSettingIds: ["ios-software-update", "ios-automatic-updates", "ios-general-about"],
  },
  {
    id: "ios-beta-updates",
    title: "Beta Updates",
    icon: FlaskConical,
    platform: "ios",
    category: "system-updates",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Enroll in the iOS Public Beta Program",
    description:
      "Beta Updates lets you opt an iPhone into Apple's Developer or Public Beta program directly from Software Update settings, so it receives pre-release iOS versions ahead of the general public release.",
    details: [
      "Choose between no beta, Public Beta, or Developer Beta tracks, depending on eligibility.",
      "Beta versions install like any other Software Update once enrolled.",
      "You can opt out at any time, though returning to a stable release may require a full erase and restore.",
      "Beta software can include unfinished features and known bugs that a stable release wouldn't have.",
    ],
    important:
      "Beta software is inherently less stable than public releases and can occasionally cause app compatibility issues or bugs — avoid installing it on a primary daily-use device.",
    redirectUrl: "https://beta.apple.com",
    afterImageContent: {
      heading: "How the Beta Program Works",
      paragraphs: [
        "Once enrolled, the device's Software Update screen starts offering pre-release iOS builds instead of only stable public releases, letting you try new features before they officially launch.",
        "Apple collects feedback and bug reports from beta participants, which factors into fixing issues before the final public release.",
      ],
      steps: [
        "Open Settings → General → Software Update → Beta Updates.",
        "Select Public Beta (or Developer Beta if enrolled as a developer).",
        "Confirm the choice and return to Software Update.",
        "Tap Download and Install when a beta version becomes available.",
      ],
    },
    whyItMatters:
      "Beta access lets enthusiasts and developers try new iOS features early and contribute feedback that shapes the final release, but it comes with a real tradeoff in stability that matters if the device is your only phone. Understanding this tradeoff up front avoids being surprised by an unfinished feature or unexpected bug on a device you rely on daily.",
    bestPractices: [
      "Back up the iPhone completely before installing any beta version, given the higher chance of bugs.",
      "Avoid installing betas on your primary device if you depend on it for essential daily tasks or work.",
      "Turn off Beta Updates once you've had your fill, and simply wait for the next stable public release instead.",
    ],
    commonIssues: [
      {
        issue: "Want to go back to a stable iOS version after installing a beta",
        fix: "There's no official downgrade path in most cases — you typically need to erase the device and restore it using the public release via Finder or iTunes, ideally from a pre-beta backup.",
      },
      {
        issue: "An app stopped working correctly after installing a beta update",
        fix: "Check with the app developer for known beta compatibility issues, and consider opting out of future betas until the app catches up.",
      },
    ],
    faqs: [
      {
        q: "Is the Public Beta the same as the Developer Beta?",
        a: "They're closely related, but the Developer Beta track is intended for registered developers and can sometimes receive builds slightly ahead of the Public Beta track.",
      },
      {
        q: "Will I still get automatic security updates while on a beta version?",
        a: "Yes, but they'll come as newer beta builds rather than the stable public release, until you opt out of the beta program entirely.",
      },
    ],
    tipsAndTricks: [
      "Submit feedback through Apple's Feedback Assistant app while on a beta — it's the direct channel Apple's engineers use to prioritize fixes.",
    ],
    relatedSettingIds: ["ios-software-update", "ios-automatic-updates", "ios-reset-iphone"],
  },
  {
    id: "ios-voiceover",
    title: "VoiceOver",
    icon: Ear,
    platform: "ios",
    category: "accessibility-language",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Use iPhone's Built-In Screen Reader",
    description:
      "VoiceOver is iOS's gesture-based screen reader that describes aloud everything on screen — text, buttons, images — letting blind and low-vision users navigate the entire iPhone by touch and sound instead of sight.",
    details: [
      "Changes standard tap gestures to selection gestures; a double-tap is needed to actually activate an item.",
      "Includes a customizable Rotor for quickly switching between navigation modes like words, lines, or headings.",
      "Speaking rate, verbosity, and voice can all be adjusted to personal preference.",
      "Supports braille displays over Bluetooth for tactile reading alongside speech.",
    ],
    important:
      "Turning on VoiceOver immediately changes basic touch gestures system-wide — practice the double-tap-to-activate gesture before relying on it, or know how to quickly disable it via Siri.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/turn-on-and-practice-voiceover-iph3e2e415f/ios",
    afterImageContent: {
      heading: "How VoiceOver Works",
      paragraphs: [
        "VoiceOver reads aloud whatever is under your finger as you explore the screen, and gestures shift from direct activation to a select-then-double-tap model so you can safely explore without accidentally triggering something.",
        "The Rotor, accessed with a two-finger twist gesture, gives quick access to jumping between headings, links, or adjusting settings like speaking rate without leaving the current screen.",
      ],
      steps: [
        "Open Settings → Accessibility → VoiceOver.",
        "Turn on the VoiceOver toggle.",
        "Explore the screen by touch — VoiceOver will speak each item as you move over it.",
        "Double-tap anywhere on the screen to activate the currently selected item.",
      ],
    },
    whyItMatters:
      "For blind and low-vision users, VoiceOver isn't a convenience feature — it's the primary way the iPhone is usable at all, turning a purely visual interface into one navigable by touch and sound. It's also one of the most mature and widely relied-upon accessibility technologies in any consumer smartphone.",
    bestPractices: [
      "Set up the Accessibility Shortcut (triple-click the side button) for VoiceOver so it can be toggled quickly without needing sight to navigate menus.",
      "Practice core gestures — single-tap to select, double-tap to activate, swipe to move between items — before depending on VoiceOver daily.",
      "Customize the Rotor to include only the navigation options you actually use, to keep it fast to cycle through.",
    ],
    commonIssues: [
      {
        issue: "VoiceOver was turned on accidentally and normal taps stopped working",
        fix: "Ask Siri to 'turn off VoiceOver,' or triple-click the side button if the Accessibility Shortcut is set to VoiceOver.",
      },
      {
        issue: "VoiceOver speaks too fast or too slow to follow comfortably",
        fix: "Adjust the Speaking Rate slider in Settings → Accessibility → VoiceOver → Speech, or via the Rotor for quick on-the-fly changes.",
      },
    ],
    faqs: [
      {
        q: "Can I use VoiceOver with Braille displays?",
        a: "Yes, VoiceOver supports a wide range of Bluetooth braille displays, letting you read screen content tactilely alongside or instead of spoken audio.",
      },
      {
        q: "Does VoiceOver work inside every app?",
        a: "Most built-in and well-designed third-party apps support VoiceOver well, though poorly labeled custom controls in some apps can be harder to navigate.",
      },
    ],
    tipsAndTricks: [
      "Use a two-finger 'scrub' gesture (moving two fingers back and forth) as a universal Back or Cancel action in VoiceOver, regardless of the app.",
      "Try 'Screen Curtain' (triple-tap with three fingers) to turn off the display entirely while VoiceOver keeps speaking, for privacy or battery savings.",
    ],
    relatedSettingIds: ["ios-accessibility", "ios-magnifier", "ios-voice-control"],
  },
  {
    id: "ios-magnifier",
    title: "Magnifier",
    icon: ZoomIn,
    platform: "ios",
    category: "accessibility-language",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Turn Your iPhone Camera Into a Magnifying Glass",
    description:
      "Magnifier uses the iPhone's camera to magnify nearby text, objects, or your surroundings in real time, with added tools like Detection Mode for identifying people, doors, and objects for users with low vision.",
    details: [
      "Adjustable zoom, brightness, contrast, and color filters help make small or low-contrast details easier to see.",
      "Detection Mode can call out doors, people, and their approximate distance using spoken guidance.",
      "Multiple saved 'setting groups' let you jump between different presets quickly.",
      "Can be launched instantly via the Accessibility Shortcut, Control Center, or Back Tap.",
    ],
    important:
      "Detection Mode features like People Detection are meant as a mobility aid and shouldn't be relied on as a sole safety measure in traffic or other hazardous environments.",
    redirectUrl: "https://support.apple.com/en-us/HT209517",
    afterImageContent: {
      heading: "How Magnifier Works",
      paragraphs: [
        "Magnifier repurposes the iPhone's camera and image processing to act like a digital magnifying glass, letting you zoom in, freeze the frame, and adjust contrast or filters to make small text or details easier to read.",
        "Detection Mode goes a step further, using the camera and, on supported models, the LiDAR scanner to identify people and doors nearby and describe their distance out loud.",
      ],
      steps: [
        "Open Settings → Accessibility → Magnifier and turn it on.",
        "Launch Magnifier from the Home Screen, Control Center, or the Accessibility Shortcut.",
        "Use the zoom slider and filter options to adjust the view.",
        "Tap Detection to access People Detection or Door Detection if supported on your device.",
      ],
    },
    whyItMatters:
      "For users with low vision, Magnifier turns a device everyone already carries into a genuinely useful daily tool — reading a menu, a medicine label, or a street sign — without needing a separate dedicated magnifier. Detection Mode extends that further into real-world navigation assistance that wasn't previously possible on a phone.",
    bestPractices: [
      "Add Magnifier to the Accessibility Shortcut or Control Center so it's one tap away when you need it.",
      "Try different color filters if you have specific contrast sensitivity, since the default view isn't ideal for everyone.",
      "Use the freeze-frame capture feature to hold a magnified image steady instead of trying to keep your hand perfectly still.",
    ],
    commonIssues: [
      {
        issue: "Magnifier app icon or shortcut isn't available on the device",
        fix: "Turn it on first in Settings → Accessibility → Magnifier, since it needs to be enabled before it appears as a launchable app or shortcut.",
      },
      {
        issue: "Detection Mode features like Door Detection aren't available",
        fix: "These features require a LiDAR scanner, which is only present on certain Pro-model iPhones — check your specific model's specs to confirm.",
      },
    ],
    faqs: [
      {
        q: "Is Magnifier the same thing as the Camera app's zoom?",
        a: "No, Magnifier is a dedicated accessibility tool with contrast filters, brightness controls, and freeze-frame capture built specifically for reading and identifying nearby details.",
      },
      {
        q: "Does Magnifier work in low light?",
        a: "Yes, it can use the flashlight as a supplemental light source, and brightness/contrast adjustments help compensate for dim environments.",
      },
    ],
    tipsAndTricks: [
      "Save a custom setting group (like high contrast plus a specific zoom level) so you don't have to reconfigure Magnifier every time you open it.",
    ],
    relatedSettingIds: ["ios-accessibility", "ios-voiceover", "ios-control-center"],
  },
  {
    id: "ios-voice-control",
    title: "Voice Control",
    icon: Mic,
    platform: "ios",
    category: "accessibility-language",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Control Your Entire iPhone by Voice",
    description:
      "Voice Control lets you navigate and operate nearly all of iOS — opening apps, tapping buttons, dictating text, scrolling — entirely by speaking commands, built for users who can't or prefer not to use touch input.",
    details: [
      "Overlays numbers or a grid on screen so you can say exactly what to tap.",
      "Supports full dictation with voice-based editing and punctuation commands.",
      "Custom commands and vocabulary can be trained for specific words or phrases.",
      "Requires downloading a voice control language file the first time it's enabled.",
    ],
    important:
      "Voice Control needs a one-time language file download and works best in a quiet environment; background noise can cause misrecognized commands.",
    redirectUrl: "https://support.apple.com/en-us/HT210417",
    afterImageContent: {
      heading: "How Voice Control Works",
      paragraphs: [
        "Voice Control processes spoken commands on-device to identify interface elements — buttons, links, fields — and lets you refer to them either by their visible label or by an overlaid number or grid coordinate.",
        "Beyond navigation, it fully supports dictation with spoken punctuation and editing commands, so text entry doesn't require touching the keyboard at all.",
      ],
      steps: [
        "Open Settings → Accessibility → Voice Control.",
        "Turn on Voice Control and allow the initial language file download.",
        "Say 'Show Numbers' or 'Show Grid' to reveal tappable overlays.",
        "Speak a number, label, or command to interact with the screen.",
      ],
    },
    whyItMatters:
      "For users with limited hand mobility, Voice Control can make an iPhone fully operable without ever touching the screen, covering everything from opening apps to precise text editing. It's also useful in situational cases, like when your hands are full or injured temporarily.",
    bestPractices: [
      "Use a quiet environment when first learning Voice Control commands, since background noise increases misrecognition.",
      "Learn the 'Show Numbers' and 'Show Grid' overlay commands early, since they cover nearly any tap you'd need to make.",
      "Train custom commands for phrases or actions you use often to speed up repetitive tasks.",
    ],
    commonIssues: [
      {
        issue: "Voice Control keeps misrecognizing commands",
        fix: "Move to a quieter environment, speak clearly with brief pauses between commands, and check that the correct language/dialect is selected in settings.",
      },
      {
        issue: "Can't tap a specific small button reliably",
        fix: "Say 'Show Grid' instead of 'Show Numbers' for more precise coordinate-based tapping on small or closely spaced elements.",
      },
    ],
    faqs: [
      {
        q: "Does Voice Control work without an internet connection?",
        a: "Yes, once the initial language file is downloaded, Voice Control processes commands on-device and doesn't require an active internet connection.",
      },
      {
        q: "Can I use Voice Control and Siri at the same time?",
        a: "Voice Control temporarily takes over listening for its own commands, so you generally use one or the other in the moment, though both remain enabled and available.",
      },
    ],
    tipsAndTricks: [
      "Say 'Go to Sleep' to temporarily pause Voice Control listening without turning the whole feature off, useful during a conversation nearby.",
    ],
    relatedSettingIds: ["ios-accessibility", "ios-voiceover", "ios-keyboard"],
  },
{
  id: "ios-switch-control",
  title: "Switch Control",
  icon: MousePointerClick,
  platform: "ios",
  category: "accessibility-language",
  controlType: "action",
  heading: "Navigate iPhone Using External Switches",
  description: "Switch Control lets people operate iPhone using one or more adaptive switches, the screen, or a camera instead of direct touch, scanning through items on screen until the desired one is selected.",
  details: [
    "Supports auto scanning, manual scanning, and single-switch step scanning modes",
    "Works with external Bluetooth switches, screen taps, or head/camera tracking as switches",
    "Recipes let you assign custom actions to switch combinations",
    "Point Scanning narrows selection with crosshairs for precise taps",
    "Adjustable scanning speed, auto-tap timing, and highlight color",
  ],
  redirectUrl: "https://support.apple.com/accessibility/iphone",
  whyItMatters: "Switch Control is often the only practical way for people with limited mobility to operate a touchscreen device independently. By turning nearly any binary input—a single button, a sip-and-puff device, or even a head movement—into full iPhone navigation, it opens up communication, entertainment, and productivity apps that would otherwise be inaccessible. Because it works system-wide rather than per-app, it removes the need for specialized hardware or software beyond the switch itself. Getting scanning speed and recipes tuned correctly can dramatically change how efficiently someone can use their device day to day.",
  bestPractices: [
    "Start with a slower scanning speed and increase it as the user gains familiarity",
    "Use Point Scanning for apps with small or closely spaced controls",
    "Create custom recipes for frequently repeated multi-step actions",
    "Pair a physical switch via Bluetooth for more reliable, lower-latency input than screen taps",
  ],
  commonIssues: [
    { issue: "Scanning feels too slow or too fast for the user", fix: "Adjust Auto Scanning Time and Tap Behavior individually in Switch Control settings" },
    { issue: "A Bluetooth switch isn't recognized", fix: "Re-pair the switch in Settings > Bluetooth, then add it again under Switch Control > Switches" },
    { issue: "Scanning skips over needed on-screen elements", fix: "Switch to Item Mode with a different scanning style, or enable Group Scanning" },
  ],
  faqs: [
    { q: "Can I use my iPhone's screen as a switch?", a: "Yes, Full Screen can be set as a switch so any tap on the display advances the scan." },
    { q: "Does Switch Control work with third-party apps?", a: "Yes, because it operates at the system accessibility layer, it works with most apps that use standard iOS controls." },
    { q: "Can I combine Switch Control with Voice Control?", a: "They can both be enabled, but only one is typically the primary input method at a time to avoid conflicts." },
  ],
  tipsAndTricks: [
    "Use the Switch Control recipe editor to build shortcuts for common multi-tap actions like copy-paste",
    "Enable auditory or visual scan cues to make timing predictable for new users",
  ],
  relatedSettingIds: ["ios-accessibility", "ios-voice-control", "ios-assistivetouch"],
  afterImageContent: {
    heading: "How Switch Control Works",
    paragraphs: [
      "Switch Control scans through interactive items on screen—buttons, links, and fields—highlighting each in sequence. When the desired item is highlighted, the user activates their switch to select it.",
      "Switches can be physical adaptive hardware, screen taps, or even camera-based gestures like a head turn, all configured under Settings > Accessibility > Switch Control > Switches.",
    ],
    steps: [
      "Open Settings → Accessibility → Switch Control",
      "Tap Switches to add and configure input sources",
      "Choose a scanning style (Auto, Manual, or Step)",
      "Adjust timing under Auto Scanning Time and Tap Behavior",
      "Toggle Switch Control on to begin scanning navigation",
    ],
  },
},
{
  id: "ios-assistivetouch",
  title: "AssistiveTouch",
  icon: Hand,
  platform: "ios",
  category: "accessibility-language",
  controlType: "action",
  heading: "Add an On-Screen Menu for Gestures and Buttons",
  description: "AssistiveTouch places a customizable floating button on screen that opens a menu for performing gestures, hardware button actions, and multitasking without needing to touch the physical buttons or use multi-finger gestures.",
  details: [
    "Simulates pinch, multi-finger swipes, and shake gestures with single taps",
    "Custom actions can be assigned to single-tap, double-tap, and long-press on the AssistiveTouch button",
    "Includes a virtual Home button, Siri, Control Center, and screenshot shortcuts",
    "Menu items can be added, removed, and reordered to match frequently used actions",
  ],
  redirectUrl: "https://support.apple.com/accessibility/iphone",
  whyItMatters: "AssistiveTouch helps anyone who has difficulty pressing physical buttons or performing precise multi-finger gestures, whether due to a motor impairment, a damaged button, or simply a case that makes buttons hard to reach. It also benefits people using switches or head tracking as an alternative way to trigger complex gestures with a single input. Because the on-screen menu is fully customizable, users can pare it down to just the actions they need, reducing scanning time and cognitive load in Switch Control or Voice Control setups.",
  bestPractices: [
    "Customize the top-level menu to surface only the actions used most often",
    "Assign Siri or Control Center to a quick double-tap if hardware buttons are unreliable",
    "Adjust the idle opacity so the floating button doesn't obscure content",
    "Use it alongside Switch Control when hardware buttons are physically inaccessible",
  ],
  commonIssues: [
    { issue: "The floating button covers important on-screen content", fix: "Lower its idle opacity or drag it to a screen edge/corner" },
    { issue: "A custom gesture doesn't trigger the expected action", fix: "Re-record the gesture under AssistiveTouch > Create New Gesture with slower, more deliberate movements" },
    { issue: "AssistiveTouch disappeared after an update", fix: "Re-enable it under Settings > Accessibility > Touch > AssistiveTouch" },
  ],
  faqs: [
    { q: "Can AssistiveTouch replace a broken Home or side button?", a: "Yes, its virtual buttons can substitute for most physical button functions." },
    { q: "Can I record custom gestures?", a: "Yes, Create New Gesture lets you draw and save a custom multi-touch gesture for reuse." },
    { q: "Does it work during phone calls?", a: "Yes, the menu remains available and can trigger mute, keypad, or end-call actions." },
  ],
  tipsAndTricks: [
    "Set a triple-click of the side button as a quick way to toggle AssistiveTouch on and off",
    "Use the virtual trackpad-style dragging mode to move the button anywhere with a finger drag",
  ],
  relatedSettingIds: ["ios-accessibility", "ios-switch-control", "ios-voice-control"],
  afterImageContent: {
    heading: "How AssistiveTouch Works",
    paragraphs: [
      "AssistiveTouch overlays a small circular button on top of everything on screen. Tapping it opens a menu of customizable actions, from simulated gestures to hardware controls.",
      "Each menu item can launch a system function, run a custom recorded gesture, or open a nested submenu, letting users build a personalized control panel.",
    ],
    steps: [
      "Open Settings → Accessibility → Touch → AssistiveTouch",
      "Toggle AssistiveTouch on",
      "Tap Customize Top Level Menu to choose which actions appear",
      "Adjust Idle Opacity and button size as needed",
      "Tap the floating button anytime to access the menu",
    ],
  },
},
{
  id: "ios-sound-recognition",
  title: "Sound Recognition",
  icon: Ear,
  platform: "ios",
  category: "accessibility-language",
  controlType: "action",
  heading: "Get Alerts When iPhone Detects Important Sounds",
  description: "Sound Recognition uses on-device listening to identify sounds like alarms, doorbells, sirens, car horns, or a crying baby, and sends a notification when one is detected nearby.",
  details: [
    "Covers categories including Alarms, Animals, Household, and People (like a crying baby or shouting)",
    "Runs entirely on-device for privacy—audio isn't sent to Apple",
    "Notifications appear even when iPhone is locked or in another app",
    "Individual sound types can be toggled on or off within each category",
  ],
  important: "Sound Recognition is a convenience aid and should not be relied on as the sole method of detecting safety-critical sounds like smoke alarms.",
  redirectUrl: "https://support.apple.com/accessibility/iphone",
  whyItMatters: "Sound Recognition gives Deaf and hard-of-hearing users, or anyone wearing headphones, visibility into important audio events happening around them that they might otherwise miss. Detecting a doorbell, smoke alarm, or crying baby without needing to hear it directly can meaningfully improve independence and safety at home. Because processing happens on-device, it works without an internet connection and keeps ambient audio private, which matters given the feature is effectively always listening for pattern matches.",
  bestPractices: [
    "Enable only the sound categories that are actually relevant to reduce notification noise",
    "Test each enabled sound type in its real environment to confirm reliable detection",
    "Pair with visual or haptic alert settings for a fuller multisensory notification",
    "Keep it off in very noisy environments where false positives are more likely",
  ],
  commonIssues: [
    { issue: "A sound isn't being detected reliably", fix: "Move iPhone closer to the sound source and confirm the specific sound type is enabled" },
    { issue: "Too many false alerts in noisy settings", fix: "Disable the specific sound categories triggering false positives" },
    { issue: "Notifications aren't appearing", fix: "Check Settings > Notifications to ensure Sound Recognition alerts aren't being silenced by Focus" },
  ],
  faqs: [
    { q: "Does Sound Recognition record audio?", a: "No, it analyzes sound patterns on-device in real time and doesn't save or transmit audio." },
    { q: "Does it drain battery quickly?", a: "It has a modest battery impact since detection runs locally using efficient on-device models." },
    { q: "Can it recognize my own custom sounds?", a: "No, it's limited to Apple's predefined sound categories, not custom user-trained sounds." },
  ],
  tipsAndTricks: [
    "Combine with Live Captions to get both a sound alert and a text description of speech nearby",
    "Enable Fire/Smoke Alarm detection in bedrooms as a supplemental (not primary) safety layer",
  ],
  relatedSettingIds: ["ios-accessibility", "ios-notifications", "ios-captions-subtitles"],
  afterImageContent: {
    heading: "How Sound Recognition Works",
    paragraphs: [
      "Once enabled, iPhone's microphone continuously analyzes ambient audio on-device, comparing it against trained models for each enabled sound category.",
      "When a match is detected with sufficient confidence, iPhone shows a notification identifying the sound, even if the screen is locked.",
    ],
    steps: [
      "Open Settings → Accessibility → Sound Recognition",
      "Toggle Sound Recognition on",
      "Tap Sounds to choose which categories to detect",
      "Enable individual sound types within each category",
      "Keep iPhone nearby and unmuted for reliable detection",
    ],
  },
},
{
  id: "ios-guided-access",
  title: "Guided Access",
  icon: Lock,
  platform: "ios",
  category: "accessibility-language",
  controlType: "action",
  heading: "Lock iPhone Into a Single App Session",
  description: "Guided Access temporarily restricts iPhone to one app and lets you disable specific screen areas, hardware buttons, or gestures, helping someone stay focused or preventing accidental exits.",
  details: [
    "Started with a triple-click of the side or Home button once enabled",
    "Can disable touch on specific screen regions by circling them",
    "Supports a time limit that ends the session automatically",
    "Ends with a passcode, Face ID, or Touch ID to prevent unauthorized exit",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/turn-on-guided-access-iph37e517346/ios",
  whyItMatters: "Guided Access is widely used for individuals with attention-related or cognitive disabilities who benefit from staying within a single task, as well as by parents handing a phone to a young child, and by businesses running kiosk-style demo devices. Locking navigation gestures and specific buttons prevents accidental exits or purchases that could otherwise interrupt an activity or create unwanted charges. It's a lightweight alternative to full mobile device management for single-purpose use cases.",
  bestPractices: [
    "Set a session time limit for structured, focused activities",
    "Circle interactive areas like in-app purchase buttons to disable them during a session",
    "Use a passcode distinct from the device unlock code when handing the phone to a child",
    "Turn off Sleep/Wake button and volume buttons for kiosk-style deployments",
  ],
  commonIssues: [
    { issue: "Can't exit a Guided Access session", fix: "Triple-click the side or Home button and enter the Guided Access passcode, or use Face ID/Touch ID if enabled" },
    { issue: "Triple-click doesn't start Guided Access", fix: "Confirm Guided Access is enabled under Settings > Accessibility > Guided Access" },
    { issue: "Forgot the Guided Access passcode", fix: "Restart the device or use Face ID/Touch ID at the end screen; as a last resort restore may be required" },
  ],
  faqs: [
    { q: "Can Guided Access disable specific gestures?", a: "Yes, under Options you can disable Touch, Motion, Keyboards, and more." },
    { q: "Does Guided Access work with any app?", a: "Yes, it restricts the currently open app regardless of which one it is." },
    { q: "Can I set it to end automatically?", a: "Yes, a Time Limit can be set to end the session and lock the screen after a set duration." },
  ],
  tipsAndTricks: [
    "Use Guided Access during video calls with children to prevent them from navigating away",
    "Combine with a Screen Time downtime schedule for layered restriction during specific hours",
  ],
  relatedSettingIds: ["ios-accessibility", "ios-screen-time-family", "ios-sign-in-security"],
  afterImageContent: {
    heading: "How Guided Access Works",
    paragraphs: [
      "Guided Access pins the current app in the foreground and disables the standard ways of leaving it, such as swiping to the Home Screen or App Switcher.",
      "Options let you further restrict specific screen zones, hardware buttons, keyboard input, and even set a maximum session duration.",
    ],
    steps: [
      "Open Settings → Accessibility → Guided Access",
      "Toggle Guided Access on and set a Passcode Settings",
      "Open the app you want to restrict",
      "Triple-click the side or Home button to start a session",
      "Adjust Options, then tap Start; triple-click again and enter the passcode to end",
    ],
  },
},
{
  id: "ios-captions-subtitles",
  title: "Captions & Subtitles",
  icon: Captions,
  platform: "ios",
  category: "accessibility-language",
  controlType: "action",
  heading: "Customize Closed Caption Style and Availability",
  description: "Captions & Subtitles controls whether closed captions appear by default during video playback and lets you customize their font, size, color, opacity, and background style.",
  details: [
    "Toggle for automatically preferring closed captions and SDH when available",
    "Style presets plus a fully custom editor for font, size, color, and edge style",
    "Applies system-wide across apps that support standard iOS caption rendering",
    "Separate from Live Captions, which generates real-time captions for audio and calls",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/turn-on-closed-captions-iph3e51364b1/ios",
  whyItMatters: "Captions and subtitles are essential for Deaf and hard-of-hearing users, but they're also widely used by hearing viewers watching in noisy environments, learning a new language, or wanting to follow dialogue more precisely. Having consistent styling that's readable against any background reduces eye strain and improves comprehension, especially for users with low vision. Because the setting applies system-wide, it saves people from having to re-enable captions in every individual app.",
  bestPractices: [
    "Choose a high-contrast style (like white text with a black outline) for readability on any video background",
    "Enable auto-prefer captions if you frequently watch with the sound off",
    "Increase caption size for small-screen viewing or low-vision needs",
    "Test styling on both light and dark video content before finalizing",
  ],
  commonIssues: [
    { issue: "Captions don't appear in a specific app", fix: "Confirm the app supports standard iOS captions and that the content itself includes a caption track" },
    { issue: "Custom caption style looks inconsistent across apps", fix: "Some apps use their own in-app caption renderer instead of the system style, which can't be overridden" },
    { issue: "Captions are hard to read on bright scenes", fix: "Increase background opacity or switch to a bold outlined style" },
  ],
  faqs: [
    { q: "Is this the same as Live Captions?", a: "No, Captions & Subtitles governs pre-existing caption tracks in video, while Live Captions generates real-time captions from live audio." },
    { q: "Will captions turn on automatically for all videos?", a: "Only if 'Prefer Closed Captions and SDH' is enabled and the content includes a caption track." },
    { q: "Can I create multiple caption styles?", a: "You can save one custom style at a time, choosing from presets or fully customizing it." },
  ],
  tipsAndTricks: [
    "Use SDH (Subtitles for the Deaf and Hard of Hearing) tracks when available for sound-effect descriptions",
    "Pair with Sound Recognition for a fuller picture of both speech and ambient sound",
  ],
  relatedSettingIds: ["ios-accessibility", "ios-display-brightness", "ios-sound-recognition"],
  afterImageContent: {
    heading: "How Captions & Subtitles Works",
    paragraphs: [
      "When enabled, iPhone renders closed caption tracks embedded in video content using the system caption style you've defined.",
      "The style editor lets you preview changes live against a sample caption before applying them everywhere.",
    ],
    steps: [
      "Open Settings → Accessibility → Subtitles & Captioning",
      "Toggle Closed Captions + SDH",
      "Tap Style to choose a preset or create a new style",
      "Adjust font, size, color, and background in the custom editor",
      "Play a video to confirm captions display as expected",
    ],
  },
},
{
  id: "ios-screen-time-limits",
  title: "App Limits & Downtime",
  icon: Clock4,
  platform: "ios",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Set Daily App Limits and Scheduled Downtime",
  description: "App Limits and Downtime, part of Screen Time, let you cap daily time spent in app categories and schedule periods when only phone calls and allowed apps remain available.",
  details: [
    "App Limits apply per category (e.g., Social, Games) or to individual apps",
    "Downtime schedules recurring or one-time blocks where restricted apps are unavailable",
    "'Always Allowed' apps stay accessible even during Downtime",
    "A 'One More Minute' request can be sent to a parent/guardian to extend time",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT208982",
  whyItMatters: "App Limits and Downtime give families and individuals a structured way to reduce compulsive app use without deleting apps outright, which research on digital wellbeing consistently shows is more sustainable than all-or-nothing blocking. For parents, these controls are the primary lever for managing a child's device use during school nights or family time, with requests to extend time creating a natural conversation rather than a silent workaround. For adults managing their own habits, seeing a hard stop reinforces intention over impulse.",
  bestPractices: [
    "Set Downtime to start well before bedtime to protect sleep",
    "Use category-based limits rather than blocking single apps to close loopholes",
    "Review the weekly Screen Time report before adjusting limits",
    "Keep essential apps like Phone, Maps, or Health in Always Allowed",
  ],
  commonIssues: [
    { issue: "An app is blocked during Downtime unexpectedly", fix: "Add it to Always Allowed under Screen Time if it's needed during restricted hours" },
    { issue: "A child bypasses limits by deleting and reinstalling an app", fix: "Enable 'Block deleting apps' under Screen Time content restrictions" },
    { issue: "Limit extension requests aren't arriving", fix: "Confirm both devices are signed into Family Sharing and notifications are enabled" },
  ],
  faqs: [
    { q: "Do App Limits reset automatically?", a: "Yes, they reset daily at midnight unless configured otherwise." },
    { q: "Can Downtime differ by day of the week?", a: "Yes, you can set a custom schedule that varies for different days." },
    { q: "Does Downtime block phone calls?", a: "No, Phone and any apps marked Always Allowed remain usable during Downtime." },
  ],
  tipsAndTricks: [
    "Use a shorter limit as a trial before committing to a stricter long-term schedule",
    "Combine with Guided Access for single-session focus time beyond daily limits",
  ],
  relatedSettingIds: ["ios-screen-time-family", "ios-family-sharing", "ios-guided-access"],
  afterImageContent: {
    heading: "How App Limits & Downtime Work",
    paragraphs: [
      "App Limits track time spent in chosen categories or apps and lock them once the daily budget is used, showing a reminder screen instead.",
      "Downtime works on a schedule, restricting all apps except those marked Always Allowed for the duration of the scheduled window.",
    ],
    steps: [
      "Open Settings → Screen Time",
      "Tap App Limits → Add Limit and choose categories or apps",
      "Set the daily time budget and days it applies",
      "Tap Downtime and set a start/end schedule",
      "Review Always Allowed to keep essential apps accessible",
    ],
  },
},
{
  id: "ios-apple-cash-family-payments",
  title: "Apple Cash & Family Payments",
  icon: Wallet,
  platform: "ios",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Manage a Family Member's Apple Cash and Card",
  description: "Apple Cash Family lets an organizer set up Apple Cash for a family member under 18, issue a virtual or physical debit card, fund their balance, and monitor or limit their transactions.",
  details: [
    "Organizer can send money instantly to a family member's Apple Cash balance",
    "Transaction notifications and spending limits can be configured for teens",
    "A physical Apple Cash Family Card can be ordered for in-store use",
    "Family members' cards can be locked remotely from the organizer's device",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT209465",
  whyItMatters: "Apple Cash Family gives parents a controlled way to introduce children to digital payments with real oversight, rather than handing over an unrestricted debit card. Because transactions and balances are visible to the organizer, it functions as a teaching tool for budgeting while still letting kids make independent purchases, send money to friends, or get paid back for shared expenses. The remote lock feature also adds a safety net if a device is lost.",
  bestPractices: [
    "Set spending notifications so both organizer and family member see activity in real time",
    "Start with small, replenishable balances rather than large lump sums",
    "Use the physical card for in-person purchases where Apple Pay isn't accepted",
    "Review transaction history together periodically as a budgeting conversation",
  ],
  commonIssues: [
    { issue: "A family member can't set up Apple Cash", fix: "Confirm they're part of Family Sharing and meet the age requirement for their region" },
    { issue: "Card payments are declining", fix: "Check the Apple Cash balance and confirm the card isn't locked from the organizer's device" },
    { issue: "Money sent isn't appearing", fix: "Confirm both parties are signed into iCloud and check for pending identity verification" },
  ],
  faqs: [
    { q: "Is Apple Cash Family available everywhere?", a: "No, it's limited to specific countries and regions where Apple Cash operates." },
    { q: "Can I set a per-transaction limit?", a: "Family payment controls let organizers monitor and lock the card, though granular per-transaction limits vary by feature availability." },
    { q: "Does the family member need their own Apple ID?", a: "Yes, they need an Apple ID managed under Family Sharing, often a Child Account." },
  ],
  tipsAndTricks: [
    "Use Apple Cash requests among family members to settle shared expenses like groceries or rides",
    "Pair with Screen Time reports to discuss both spending and app usage habits together",
  ],
  relatedSettingIds: ["ios-family-sharing", "ios-icloud-account", "ios-ask-to-buy"],
  afterImageContent: {
    heading: "How Apple Cash Family Works",
    paragraphs: [
      "The organizer sets up Apple Cash for a family member from their own Wallet settings, linking it to the family group and enabling parental oversight features.",
      "Once active, the family member can send and receive money, use it with Apple Pay, and the organizer can view transactions, add funds, or lock the card at any time.",
    ],
    steps: [
      "Open Settings → tap your name → Family Sharing",
      "Select the family member and tap Apple Cash",
      "Tap Set Up Apple Cash and follow the prompts",
      "Add funds and configure notifications",
      "Order a physical card if needed from the family member's Wallet app",
    ],
  },
},
{
  id: "ios-ask-to-buy",
  title: "Ask to Buy",
  icon: ShoppingBag,
  platform: "ios",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Approve Purchases Before Family Members Download",
  description: "Ask to Buy requires children in a Family Sharing group to send a purchase or download request that an organizer approves or declines from their own device before it completes.",
  details: [
    "Applies to App Store, Apple Books, and Music purchases and downloads, including free apps",
    "Requests appear as a notification the organizer can approve or decline instantly",
    "Automatically enabled for Child accounts and optional for teen accounts",
    "Approval history is visible for reviewing what's been purchased or downloaded",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT201089",
  whyItMatters: "Ask to Buy closes the gap between giving a child a capable device and losing control over what gets installed or purchased on it. Even free app downloads get routed through approval, which matters for age-appropriate content control, not just spending. For families, it turns purchasing into a quick conversation rather than a surprise credit card charge or an unsuitable app showing up on a child's Home Screen.",
  bestPractices: [
    "Keep notifications enabled on the organizer's device so requests aren't missed for long",
    "Use the approval prompt to check content ratings before approving",
    "Review purchase history periodically for spending patterns",
    "Turn off Ask to Buy gradually as teens demonstrate responsible purchasing habits",
  ],
  commonIssues: [
    { issue: "Approval requests aren't arriving", fix: "Confirm the organizer's notifications for the App Store are enabled and the child is correctly in the family group" },
    { issue: "A free app still requires approval", fix: "This is expected—Ask to Buy applies to all downloads, not just paid purchases" },
    { issue: "Can't turn off Ask to Buy for a teen", fix: "Family Sharing settings allow the organizer to disable it once the member is old enough per account settings" },
  ],
  faqs: [
    { q: "Does Ask to Buy work for in-app purchases?", a: "It covers App Store, Books, and Music purchases; in-app purchase behavior may also be governed by Screen Time content restrictions." },
    { q: "Can more than one parent approve requests?", a: "Yes, any parent/guardian role in the family group can receive and respond to requests." },
    { q: "What happens if a request is ignored?", a: "It remains pending until approved or declined; the child can send a reminder." },
  ],
  tipsAndTricks: [
    "Use Screen Time's App Store content restrictions alongside Ask to Buy for age-based filtering",
    "Check the family purchase history together to model healthy spending decisions",
  ],
  relatedSettingIds: ["ios-family-sharing", "ios-screen-time-family", "ios-app-store-settings"],
  afterImageContent: {
    heading: "How Ask to Buy Works",
    paragraphs: [
      "When a child attempts to buy or download something, the request is sent to the family organizer instead of completing immediately.",
      "The organizer receives a notification with the item's details and can approve or decline it directly from the alert.",
    ],
    steps: [
      "Open Settings → tap your name → Family Sharing",
      "Select the family member's name",
      "Toggle Ask to Buy on",
      "Respond to approval notifications as they arrive",
      "Review Purchase History periodically under the App Store account settings",
    ],
  },
},
{
  id: "ios-calendar-accounts",
  title: "Calendar Accounts",
  icon: Calendar,
  platform: "ios",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Sync Calendars From Multiple Accounts",
  description: "Calendar account settings let you add and sync calendars from iCloud, Google, Exchange, Yahoo, and other CalDAV services, choosing which calendars are visible and how invitations are handled by default.",
  details: [
    "Each added account can enable or disable Calendars independently of Mail and Contacts",
    "A default calendar can be set for new events created outside a specific calendar",
    "Time zone override lets events display in a fixed zone instead of the device's current one",
    "Shared and subscribed calendars appear alongside personal ones with distinct colors",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/welcome/ios",
  whyItMatters: "Most people juggle a work calendar, a personal calendar, and sometimes a shared family calendar, and Calendar account settings are what unify them into one view instead of forcing app-switching. Getting sync right prevents double-booking and missed events, which has real consequences for both professional and personal commitments. The color-coding and per-account toggles also help visually separate contexts at a glance, which matters more as the number of connected accounts grows.",
  bestPractices: [
    "Assign a distinct color to each account's calendar for quick visual scanning",
    "Set a sensible default calendar so quick-added events land where expected",
    "Disable calendars you don't need visible to reduce clutter rather than removing the whole account",
    "Use Time Zone Override when traveling to keep event times fixed to your home base",
  ],
  commonIssues: [
    { issue: "Events from one account aren't appearing", fix: "Check that Calendars is toggled on for that account under Settings > Calendar > Accounts" },
    { issue: "Duplicate events show up", fix: "Check for the same calendar subscribed under two different accounts and remove the redundant one" },
    { issue: "Invitations aren't syncing", fix: "Verify the account's calendar sync is enabled and check Mail settings for invitation handling" },
  ],
  faqs: [
    { q: "Can I add a non-Apple calendar like Google?", a: "Yes, add it under Settings > Calendar > Accounts > Add Account and enable Calendars for it." },
    { q: "Can I subscribe to a public calendar like a sports schedule?", a: "Yes, use Add Subscribed Calendar under Settings > Calendar > Accounts." },
    { q: "Will deleting an account delete its calendar events?", a: "It removes them from the device, but events remain on the original server account." },
  ],
  tipsAndTricks: [
    "Use Default Alert Times to standardize reminders across all your calendars",
    "Turn on 'Show Invitee Declines' to see who's turned down shared meeting invites",
  ],
  relatedSettingIds: ["ios-mail-contacts-accounts", "ios-icloud-account", "ios-sign-in-security"],
  afterImageContent: {
    heading: "How Calendar Accounts Sync Works",
    paragraphs: [
      "Each account added to iPhone can independently sync its own calendar data, keeping events, invitations, and reminders updated in the background.",
      "The unified Calendar app merges all enabled calendars into one view, using distinct colors to keep sources visually separate.",
    ],
    steps: [
      "Open Settings → Calendar → Accounts",
      "Tap Add Account and sign in to the service",
      "Toggle Calendars on for that account",
      "Return to Settings → Calendar to set defaults and colors",
      "Open the Calendar app to confirm events from all accounts appear",
    ],
  },
},
{
  id: "ios-subscriptions-management",
  title: "Subscriptions",
  icon: RefreshCw,
  platform: "ios",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "View and Manage Active Subscriptions",
  description: "The Subscriptions screen lists every active and expired subscription tied to your Apple ID, letting you review billing dates and amounts, upgrade or downgrade plans, and cancel directly.",
  details: [
    "Shows renewal date, price, and billing cycle for each active subscription",
    "Includes subscriptions shared with family members through Family Sharing",
    "Cancelling stops future renewals but doesn't refund the current billing period",
    "Expired and cancelled subscriptions remain listed for reference",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT202039",
  whyItMatters: "Subscription creep—small recurring charges that pile up unnoticed—is one of the most common sources of unwanted spending, and this screen is the single place to audit every App Store-billed subscription in one pass. It matters especially for families sharing subscriptions, where it's easy to lose track of what's active across multiple apps and services. Reviewing it periodically is a low-effort way to catch forgotten free-trial conversions before they renew.",
  bestPractices: [
    "Review the Subscriptions list monthly to catch unused services before renewal",
    "Cancel before the renewal date shown, since cancelling doesn't provide a partial refund",
    "Check which subscriptions are shared with family members to avoid duplicate purchases",
    "Use the price-change notifications Apple sends before enabling silent renewal at a new rate",
  ],
  commonIssues: [
    { issue: "A subscription is missing from the list", fix: "It may be billed outside the App Store (directly through the developer's website) and won't appear here" },
    { issue: "Cancelled subscription still shows as active", fix: "Confirm the cancellation date shown; access typically continues until the current billing period ends" },
    { issue: "Can't find where to cancel", fix: "Go to Settings > [Your Name] > Subscriptions and tap the subscription to cancel" },
  ],
  faqs: [
    { q: "Does cancelling refund the current period?", a: "No, you generally retain access until the end of the paid period, with no partial refund." },
    { q: "Can family members see each other's subscriptions?", a: "Only subscriptions explicitly shared through Family Sharing are visible to the group." },
    { q: "Will I be notified before a price increase?", a: "Yes, Apple requires developers to notify subscribers before a price change takes effect." },
  ],
  tipsAndTricks: [
    "Set a recurring calendar reminder a few days before annual subscriptions renew",
    "Use free trials cautiously—set a reminder to cancel before the trial converts if unwanted",
  ],
  relatedSettingIds: ["ios-icloud-account", "ios-app-store-settings", "ios-apple-pay-wallet"],
  afterImageContent: {
    heading: "How Subscriptions Management Works",
    paragraphs: [
      "The Subscriptions screen pulls billing data directly from your Apple ID account, aggregating every App Store subscription regardless of which app sold it.",
      "Tapping any entry shows its renewal date and price, with options to change plans or cancel immediately from that screen.",
    ],
    steps: [
      "Open Settings → tap your name",
      "Tap Subscriptions",
      "Review active and expired subscriptions",
      "Tap a subscription to view details or change its plan",
      "Tap Cancel Subscription to stop future renewals",
    ],
  },
},
{
  id: "ios-messages-settings",
  title: "Messages Settings",
  icon: MessageCircle,
  platform: "ios",
  category: "apps-features",
  controlType: "action",
  heading: "Configure iMessage, SMS, and Filtering Options",
  description: "Messages settings control iMessage activation, SMS/MMS relay from a Mac or iPad, read receipts, filtering for unknown senders, and how long messages are kept before expiring.",
  details: [
    "iMessage toggle enables encrypted messaging over data instead of SMS/MMS",
    "Text Message Forwarding relays SMS to other Apple devices on the same account",
    "Filter Unknown Senders separates messages from non-contacts into a filtered list",
    "Expire settings can auto-delete messages after 30 days, 1 year, or keep forever",
  ],
  redirectUrl: "https://support.apple.com/messages",
  whyItMatters: "Messages is the primary communication channel for most iPhone users, so its settings directly shape both privacy and daily convenience—whether read receipts reveal when you've seen a text, whether spam and scam texts clutter the main inbox, and whether old conversations quietly consume storage. Filtering unknown senders in particular has become more important as SMS phishing has increased, giving users a first line of defense without blocking legitimate contacts outright.",
  bestPractices: [
    "Enable Filter Unknown Senders to reduce exposure to SMS phishing and spam",
    "Turn off read receipts for contacts where you'd rather not confirm you've seen a message",
    "Set message expiration to 1 year if storage is a concern, keeping recent history intact",
    "Enable Text Message Forwarding if you regularly message from a Mac or iPad",
  ],
  commonIssues: [
    { issue: "Green bubbles appear instead of blue for a known iPhone contact", fix: "Confirm iMessage is enabled for that contact's number and both devices have a data connection" },
    { issue: "SMS isn't relaying to iPad or Mac", fix: "Check Text Message Forwarding under Settings > Messages and ensure the other device is signed into the same Apple ID" },
    { issue: "Legitimate messages land in the filtered/unknown list", fix: "Add the sender to Contacts so future messages route to the main list" },
  ],
  faqs: [
    { q: "Are iMessages encrypted?", a: "Yes, iMessages are end-to-end encrypted between Apple devices; SMS/MMS to non-Apple devices is not." },
    { q: "Can I hide my read receipts from just one person?", a: "Yes, open that conversation, tap the contact info, and toggle Send Read Receipts individually." },
    { q: "Does message expiration delete photos too?", a: "Yes, expiration removes the full conversation history including attachments after the chosen period." },
  ],
  tipsAndTricks: [
    "Use Filters in the Messages app to separate Unknown Senders, Transactions, and Promotions automatically",
    "Pin important conversations to the top for quick access",
  ],
  relatedSettingIds: ["ios-notifications", "ios-focus", "ios-mail-contacts-accounts"],
  afterImageContent: {
    heading: "How Messages Settings Work",
    paragraphs: [
      "Messages settings determine whether outgoing texts use iMessage over the internet or fall back to carrier SMS/MMS, and how incoming messages from unrecognized numbers are handled.",
      "Filtering and expiration settings run automatically in the background, sorting or deleting messages according to the rules you've configured.",
    ],
    steps: [
      "Open Settings → Messages",
      "Toggle iMessage on and configure Send & Receive addresses",
      "Enable Filter Unknown Senders under the Unknown & Spam section",
      "Set Keep Messages under Message History",
      "Turn on Text Message Forwarding for other Apple devices if needed",
    ],
  },
},
{
  id: "ios-maps-settings",
  title: "Maps Settings",
  icon: Compass,
  platform: "ios",
  category: "apps-features",
  controlType: "action",
  heading: "Adjust Navigation Voice, Units, and Preferences",
  description: "Maps settings let you set preferred navigation voice volume, driving versus walking as your default routing mode, distance units, and how much location data is used for traffic and directions.",
  details: [
    "Driving & Navigation options include preferred routing type (driving, walking, transit, or cycling)",
    "Navigation Voice Volume can be set independently of the ringer and media volume",
    "Distances can display in miles or kilometers regardless of region",
    "Extensions let ride-share and food delivery apps surface actions directly within Maps",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/welcome/ios",
  whyItMatters: "Maps has become a default utility for daily commuting, travel, and finding nearby places, so its settings quietly shape a lot of time spent in the car or on foot. Getting navigation volume and preferred transportation mode right avoids the friction of manually adjusting settings on every trip. Extensions integration also means Maps can act as a hub for third-party services like ride-hailing, reducing the need to jump between separate apps mid-errand.",
  bestPractices: [
    "Set your default routing preference (driving vs. transit) to match your most common commute",
    "Lower navigation voice volume relative to media if you often listen to music or podcasts while driving",
    "Enable relevant ride-share or delivery extensions you actually use to avoid app clutter",
    "Switch distance units to match the country you're traveling in for clearer trip planning",
  ],
  commonIssues: [
    { issue: "Navigation voice is too loud or too quiet relative to music", fix: "Adjust Navigation Voice Volume separately under Settings > Maps > Driving & Navigation" },
    { issue: "Maps defaults to the wrong transportation mode", fix: "Set a Preferred Routing Type under Settings > Maps > Driving & Navigation" },
    { issue: "A ride-share extension isn't appearing", fix: "Confirm the third-party app is installed and its extension is enabled under Settings > Maps > Extensions" },
  ],
  faqs: [
    { q: "Can Maps show traffic-based rerouting automatically?", a: "Yes, when Traffic and Alternate Routes are enabled, Maps can suggest a faster route mid-trip." },
    { q: "Does Maps work without a data connection?", a: "Downloaded offline maps can support basic navigation without a live connection." },
    { q: "Can I change the app used for directions from other apps?", a: "The Default Navigation App under Settings can be set to Maps or a supported third-party app." },
  ],
  tipsAndTricks: [
    "Download offline maps for regions with unreliable connectivity before traveling",
    "Use Maps extensions to book a ride or order food without leaving the app",
  ],
  relatedSettingIds: ["ios-airplane-mode", "ios-wifi", "ios-find-my"],
  afterImageContent: {
    heading: "How Maps Settings Work",
    paragraphs: [
      "Maps settings apply globally across the app, shaping how routes are calculated, how voice guidance is delivered, and which units are displayed.",
      "Extensions are managed centrally, letting supported third-party apps add actions like booking a ride directly inside a Maps place card.",
    ],
    steps: [
      "Open Settings → Maps",
      "Tap Driving & Navigation to set routing and voice preferences",
      "Choose Miles or Kilometers under Distances",
      "Tap Extensions to enable third-party integrations",
      "Open Maps to confirm the new preferences are applied",
    ],
  },
},
{
  id: "ios-camera-settings",
  title: "Camera Settings",
  icon: Camera,
  platform: "ios",
  category: "apps-features",
  controlType: "action",
  heading: "Customize Photo and Video Capture Formats",
  description: "Camera settings control photo and video formats, resolution, grid lines, the level tool, and behaviors like preserving your last-used camera mode or automatically scanning QR codes.",
  details: [
    "Formats setting toggles High Efficiency (HEIF/HEVC) versus Most Compatible (JPEG/H.264)",
    "Grid and Level assist with composition and horizon alignment",
    "Preserve Settings remembers the last-used mode, filter, and lighting between launches",
    "Scan QR Codes lets the Camera app auto-detect and act on QR codes without opening a separate scanner",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/welcome/ios",
  whyItMatters: "Camera settings determine both the technical quality and file size of every photo and video captured, which has downstream effects on storage use and compatibility when sharing with non-Apple devices. Composition aids like Grid and Level help even casual photographers produce noticeably better-framed shots without any editing later. As QR codes have become common for menus, payments, and Wi-Fi sharing, having the Camera app recognize them instantly removes friction from everyday interactions.",
  bestPractices: [
    "Use High Efficiency format to save storage unless you regularly share files with non-Apple devices",
    "Enable Grid for better rule-of-thirds composition",
    "Turn on Preserve Settings if you frequently reuse the same shooting mode",
    "Keep Scan QR Codes enabled for quick access to menus, Wi-Fi, and payment codes",
  ],
  commonIssues: [
    { issue: "Photos won't open on a non-Apple device", fix: "Switch Formats to Most Compatible under Settings > Camera > Formats" },
    { issue: "Camera resets to default mode each time it opens", fix: "Enable the relevant toggles under Settings > Camera > Preserve Settings" },
    { issue: "QR codes aren't being recognized", fix: "Confirm Scan QR Codes is enabled under Settings > Camera and that there's adequate lighting" },
  ],
  faqs: [
    { q: "What's the difference between HEIF and JPEG?", a: "HEIF offers similar quality at roughly half the file size, while JPEG has broader compatibility with older devices and software." },
    { q: "Does the Level tool work with video too?", a: "Level primarily assists with photo composition, showing a horizon guide during framing." },
    { q: "Can I disable the shutter sound?", a: "In regions where it's legally optional, muting the Ring/Silent switch mutes the shutter sound." },
  ],
  tipsAndTricks: [
    "Use the Level tool along with Grid for precisely aligned architecture or landscape shots",
    "Enable Mirror Front Camera if you prefer selfies to match what you see in the viewfinder",
  ],
  relatedSettingIds: ["ios-photos-settings", "ios-display-brightness"],
  afterImageContent: {
    heading: "How Camera Settings Work",
    paragraphs: [
      "Camera settings adjust how the Camera app captures and encodes photos and video before they're saved to the Photos library.",
      "Composition aids like Grid and Level overlay guides in the viewfinder without affecting the final captured image.",
    ],
    steps: [
      "Open Settings → Camera",
      "Tap Formats to choose High Efficiency or Most Compatible",
      "Toggle Grid and Level under Composition",
      "Enable relevant options under Preserve Settings",
      "Open Camera to confirm the new behavior",
    ],
  },
},
{
  id: "ios-photos-settings",
  title: "Photos Settings",
  icon: Image,
  platform: "ios",
  category: "apps-features",
  controlType: "action",
  heading: "Manage iCloud Photos Sync and Library Options",
  description: "Photos settings control whether your library syncs via iCloud Photos, whether originals or space-optimized versions are stored on-device, and options for Shared Albums and Memories.",
  details: [
    "iCloud Photos keeps the full library synced across all signed-in devices",
    "Optimize iPhone Storage keeps smaller versions locally, downloading full-resolution as needed",
    "Shared Library lets a household contribute photos to a combined collection automatically",
    "Summarize with Apple Intelligence and Show Content controls affect what appears in Memories and For You",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT207305",
  whyItMatters: "Photos is typically one of the largest consumers of both local storage and iCloud storage on an iPhone, so these settings directly affect available space and monthly iCloud storage costs. iCloud Photos also underpins cross-device access—without it, photos taken on iPhone won't automatically appear on an iPad or Mac. Shared Library in particular changes how families collect memories together, removing the manual work of sharing individual photos after every event.",
  bestPractices: [
    "Enable Optimize iPhone Storage if local storage is limited but iCloud storage is sufficient",
    "Use Shared Library for family events so everyone's photos land in one combined album",
    "Regularly empty Recently Deleted to reclaim storage from removed photos",
    "Review iCloud storage plan if the library frequently approaches its limit",
  ],
  commonIssues: [
    { issue: "Photos aren't syncing to other devices", fix: "Confirm iCloud Photos is enabled on all devices and signed into the same Apple ID" },
    { issue: "iPhone storage fills up quickly", fix: "Enable Optimize iPhone Storage under Settings > Photos" },
    { issue: "A photo appears blurry until tapped", fix: "This is expected with Optimize iPhone Storage—the full-resolution version downloads on demand" },
  ],
  faqs: [
    { q: "Does turning off iCloud Photos delete my photos?", a: "No, but it stops syncing across devices; existing photos on-device remain unless you choose to remove them." },
    { q: "What's the difference between Shared Albums and Shared Library?", a: "Shared Albums are curated collections you choose to share, while Shared Library merges an entire ongoing photo stream among selected people." },
    { q: "Can I turn off Memories?", a: "Yes, Show Content options under Photos settings let you limit what appears in Memories and featured content." },
  ],
  tipsAndTricks: [
    "Use Shared Library with automatic sharing based on people or date range to reduce manual curation",
    "Check Settings > [Your Name] > iCloud > Photos to see current storage usage",
  ],
  relatedSettingIds: ["ios-icloud-account", "ios-camera-settings"],
  afterImageContent: {
    heading: "How Photos Settings Work",
    paragraphs: [
      "iCloud Photos syncs your library in the background, keeping every enabled device up to date with new photos, edits, and deletions.",
      "Storage optimization decides whether full-resolution originals stay on-device or are fetched from iCloud only when opened.",
    ],
    steps: [
      "Open Settings → Photos",
      "Toggle iCloud Photos on",
      "Choose Optimize iPhone Storage or Download and Keep Originals",
      "Set up Shared Library if sharing with household members",
      "Adjust Show Content options for Memories and For You",
    ],
  },
},
{
  id: "ios-shortcuts-settings",
  title: "Shortcuts App Settings",
  icon: Zap,
  platform: "ios",
  category: "apps-features",
  controlType: "action",
  heading: "Control Automation and Shortcut Permissions",
  description: "Shortcuts app settings manage which shortcuts can run without confirmation, Siri suggestions for automations, sharing permissions, and access to sensitive apps and data used inside shortcuts.",
  details: [
    "Allow Untrusted Shortcuts controls whether shortcuts from outside the App Store can run",
    "Personal Automations can trigger based on time, location, app launch, or device events",
    "Siri suggests shortcuts based on usage patterns for quick access",
    "Individual app permissions (Contacts, Photos, etc.) can be reviewed per shortcut",
  ],
  redirectUrl: "https://support.apple.com/guide/shortcuts/welcome/ios",
  whyItMatters: "Shortcuts is Apple's automation engine, letting users chain actions across apps to save repetitive taps, and its settings are the main safeguard against running unreviewed automations that could access sensitive data or perform unwanted actions. Because shortcuts can read Contacts, Photos, and other private data, controlling permissions per shortcut is a meaningful privacy boundary. Personal Automations extend this further into background triggers, so understanding what's set to run silently matters for both convenience and control.",
  bestPractices: [
    "Review shortcuts from third-party sources before running them, especially ones requesting broad data access",
    "Use Personal Automations sparingly for truly repetitive, predictable triggers to avoid unexpected background actions",
    "Periodically audit which apps and data types installed shortcuts can access",
    "Keep 'Allow Untrusted Shortcuts' off unless intentionally installing from a trusted external source",
  ],
  commonIssues: [
    { issue: "A downloaded shortcut won't run", fix: "Enable Allow Untrusted Shortcuts under Settings > Shortcuts if it's from outside the Shortcuts gallery/App Store" },
    { issue: "An automation runs at unexpected times", fix: "Review its trigger conditions under the Automation tab in the Shortcuts app and adjust or delete it" },
    { issue: "A shortcut is denied access to an app's data", fix: "Grant the specific permission when prompted, or review it under Settings > Privacy & Security" },
  ],
  faqs: [
    { q: "Are all shortcuts safe to run?", a: "Not necessarily—shortcuts can access sensitive data and system functions, so review unfamiliar ones before running." },
    { q: "Can Siri suggest shortcuts automatically?", a: "Yes, based on app usage patterns, Siri can suggest relevant shortcuts on the Lock Screen or in Search." },
    { q: "Do Personal Automations require confirmation to run?", a: "You can toggle whether an automation asks before running or runs immediately without a prompt." },
  ],
  tipsAndTricks: [
    "Add frequently used shortcuts to the Home Screen or widgets for one-tap access",
    "Use Personal Automations with Focus modes to trigger app or setting changes automatically",
  ],
  relatedSettingIds: ["ios-siri-search", "ios-app-store-settings"],
  afterImageContent: {
    heading: "How Shortcuts Settings Work",
    paragraphs: [
      "Shortcuts settings govern the trust and permission boundaries for automations, whether built manually, downloaded, or suggested by Siri.",
      "Personal Automations run in the background based on triggers you define, while app-level permissions determine what data each shortcut step can access.",
    ],
    steps: [
      "Open Settings → Shortcuts",
      "Toggle Allow Untrusted Shortcuts if needed",
      "Open the Shortcuts app → Automation tab to review triggers",
      "Tap a shortcut's settings to review its app and data permissions",
      "Adjust or delete automations that are no longer needed",
    ],
  },
},
{
  id: "ios-airplane-mode",
  title: "Airplane Mode",
  icon: Plane,
  platform: "ios",
  category: "connectivity-network",
  controlType: "action",
  heading: "Disable Wireless Radios Instantly",
  description: "Airplane Mode turns off cellular, Wi-Fi, and Bluetooth radios with one toggle, and can be configured to leave Wi-Fi or Bluetooth on individually after enabling, for use during flights or to save battery.",
  details: [
    "Instantly disables cellular data, calls, and texts",
    "Wi-Fi and Bluetooth can be re-enabled individually while Airplane Mode stays on",
    "Available from both Settings and Control Center for quick access",
    "GPS/location services can remain functional in Airplane Mode on most flights",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT204234",
  whyItMatters: "Airplane Mode exists primarily for regulatory compliance during flights, but it's also a practical tool for extending battery life, avoiding interruptions, or troubleshooting connectivity issues by forcing a full radio reset. Many airlines now offer Wi-Fi even with Airplane Mode required, which is why iOS allows re-enabling Wi-Fi separately rather than an all-or-nothing switch. Understanding this distinction avoids confusion when trying to connect to in-flight Wi-Fi.",
  bestPractices: [
    "Enable Airplane Mode before boarding to comply with airline policy, then reconnect Wi-Fi if offered",
    "Use Airplane Mode overnight if you want zero notifications without fully powering off the device",
    "Toggle it on and off as a quick fix for minor cellular or Wi-Fi connectivity glitches",
    "Add the Control Center shortcut for fast access without opening Settings",
  ],
  commonIssues: [
    { issue: "Can't connect to in-flight Wi-Fi", fix: "Re-enable Wi-Fi specifically after turning on Airplane Mode; the two aren't mutually exclusive" },
    { issue: "Cellular doesn't reconnect after disabling Airplane Mode", fix: "Toggle Airplane Mode on and off again, or restart the device" },
    { issue: "Alarms don't work as expected in Airplane Mode", fix: "Alarms function normally in Airplane Mode since they don't require a network connection" },
  ],
  faqs: [
    { q: "Does Airplane Mode turn off GPS?", a: "No, Location Services can still function for offline maps and apps that don't require a network." },
    { q: "Can I still use Bluetooth headphones in Airplane Mode?", a: "Yes, re-enable Bluetooth after turning on Airplane Mode to keep it active." },
    { q: "Does Airplane Mode save significant battery?", a: "Yes, disabling radio searching for signal can meaningfully extend battery life in low-coverage areas." },
  ],
  tipsAndTricks: [
    "Use Airplane Mode plus Wi-Fi as a quick way to browse without cellular data charges while traveling internationally",
    "Combine with a Focus mode for a distraction-free work block that still allows local music playback",
  ],
  relatedSettingIds: ["ios-wifi", "ios-bluetooth", "ios-cellular-data"],
  afterImageContent: {
    heading: "How Airplane Mode Works",
    paragraphs: [
      "Airplane Mode simultaneously disables the cellular, Wi-Fi, and Bluetooth radios to comply with regulations that restrict wireless transmissions during flights.",
      "After enabling it, Wi-Fi and Bluetooth can each be switched back on independently, since many environments—like flights with Wi-Fi service—only require cellular to stay off.",
    ],
    steps: [
      "Open Settings and toggle Airplane Mode, or use Control Center",
      "Confirm cellular, Wi-Fi, and Bluetooth icons show as disconnected",
      "Re-enable Wi-Fi or Bluetooth individually if needed",
      "Toggle Airplane Mode off to restore all radios",
    ],
  },
},
{
  id: "ios-wifi-calling",
  title: "Wi-Fi Calling",
  icon: Phone,
  platform: "ios",
  category: "connectivity-network",
  controlType: "action",
  heading: "Make and Receive Calls Over Wi-Fi",
  description: "Wi-Fi Calling routes phone calls and texts through a connected Wi-Fi network when cellular coverage is weak or unavailable, and can register your number so other Apple devices signed into the same account can also make calls.",
  details: [
    "Requires carrier support and a one-time activation per line",
    "Automatically falls back to cellular when Wi-Fi signal is poor mid-call",
    "Emergency address must be set for accurate location during emergency calls over Wi-Fi",
    "Can extend calling to iPad and Mac via 'Calls on Other Devices'",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT203032",
  whyItMatters: "Wi-Fi Calling solves one of the most common frustrations with mobile service: dead zones inside buildings with thick walls or in basements where cellular signal doesn't reach but Wi-Fi does. For international travelers, it can also allow calls over a local Wi-Fi network without triggering expensive roaming charges, depending on carrier policy. Setting an accurate emergency address is a genuinely important safety detail, since Wi-Fi calls don't carry the same automatic location data cellular towers provide.",
  bestPractices: [
    "Keep the emergency address updated whenever you relocate, especially for a home Wi-Fi network",
    "Enable Wi-Fi Calling before traveling to areas with unreliable cellular coverage",
    "Check carrier-specific roaming charges before relying on it internationally",
    "Enable Calls on Other Devices if you often work at a Mac or iPad without your phone nearby",
  ],
  commonIssues: [
    { issue: "Wi-Fi Calling toggle is missing", fix: "Confirm the carrier supports it and the account line has it activated; some carriers require an initial setup step" },
    { issue: "Calls drop when switching between Wi-Fi and cellular", fix: "This can happen at the handoff point; ensure both Wi-Fi and cellular signal are reasonably strong" },
    { issue: "Emergency calls show the wrong address", fix: "Update the registered address under Settings > Phone > Wi-Fi Calling" },
  ],
  faqs: [
    { q: "Does Wi-Fi Calling use cellular minutes?", a: "No, calls route over Wi-Fi and typically don't count against cellular minutes, though carrier policies vary." },
    { q: "Can I use Wi-Fi Calling abroad to avoid roaming?", a: "Some carriers support this, but check specific international Wi-Fi Calling policies first." },
    { q: "Does it work without a SIM?", a: "It generally requires an active line with carrier support, even though the call itself routes over Wi-Fi." },
  ],
  tipsAndTricks: [
    "Test Wi-Fi Calling at home before you need it in a genuine coverage gap",
    "Pair with Calls on Other Devices to answer calls hands-free from a Mac while working",
  ],
  relatedSettingIds: ["ios-cellular-data", "ios-wifi", "ios-vpn"],
  afterImageContent: {
    heading: "How Wi-Fi Calling Works",
    paragraphs: [
      "When enabled, iPhone prioritizes an available Wi-Fi network for voice calls and texts instead of the cellular network, provided the carrier supports the feature.",
      "If Wi-Fi signal weakens mid-call, iPhone can hand the call off to cellular automatically to avoid dropping it, when supported.",
    ],
    steps: [
      "Open Settings → Phone → Wi-Fi Calling",
      "Toggle Wi-Fi Calling on This iPhone",
      "Enter or confirm your emergency address",
      "Enable Add Wi-Fi Calling for Other Devices if desired",
      "Test a call while connected to Wi-Fi to confirm it's working",
    ],
  },
},
{
  id: "ios-icloud-private-relay",
  title: "iCloud Private Relay",
  icon: ShieldCheck,
  platform: "ios",
  category: "connectivity-network",
  controlType: "action",
  heading: "Hide Browsing Traffic and IP Address in Safari",
  description: "iCloud Private Relay encrypts Safari's outgoing traffic and routes it through two separate relays so no single party—including Apple or your network provider—can see both your identity and the websites you visit.",
  details: [
    "Requires an active iCloud+ subscription to use",
    "Can mask your general location by keeping it broad (city/region) or maintaining current precise location",
    "Can be toggled off per network, useful for networks that block relay traffic",
    "Works only for Safari browsing traffic and some system network requests, not all apps",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT212614",
  whyItMatters: "Private Relay addresses a specific privacy gap: even with HTTPS encrypting page content, your network provider and the destination site can each still see who you are and where you're browsing from. By splitting that information across two independent relays, neither party gets the complete picture, which meaningfully raises the bar against tracking and profiling based on IP address and browsing history. It's part of a broader shift toward built-in privacy tooling rather than relying on third-party VPNs for everyday browsing.",
  bestPractices: [
    "Keep Private Relay enabled by default for everyday Safari browsing",
    "Disable it temporarily on networks (like some corporate or school Wi-Fi) that block relay traffic",
    "Choose 'Maintain General Location' unless a specific site needs precise location for functionality",
    "Don't rely on it as a full VPN replacement, since it only covers Safari and limited system traffic",
  ],
  commonIssues: [
    { issue: "A website won't load with Private Relay on", fix: "Some networks or sites block relay traffic; disable it for that specific network under Wi-Fi settings" },
    { issue: "Private Relay option is missing", fix: "Confirm you have an active iCloud+ subscription, required for the feature" },
    { issue: "Location-based content seems inaccurate", fix: "Switch from 'Maintain General Location' to precise location if a site needs it, understanding the privacy tradeoff" },
  ],
  faqs: [
    { q: "Does Private Relay work like a VPN?", a: "It's similar in that it masks your IP, but it only covers Safari and select system traffic, not all apps." },
    { q: "Do I need iCloud+ to use it?", a: "Yes, Private Relay is included with any paid iCloud+ storage plan." },
    { q: "Can websites still track me with Private Relay on?", a: "It reduces IP-based tracking, but other tracking methods like cookies or fingerprinting can still work unless separately blocked." },
  ],
  tipsAndTricks: [
    "Combine Private Relay with Safari's Hide My Email for stronger privacy when signing up for services",
    "Turn it off per-network if a banking or corporate site behaves oddly, rather than disabling it globally",
  ],
  relatedSettingIds: ["ios-vpn", "ios-safari-settings", "ios-icloud-account"],
  afterImageContent: {
    heading: "How iCloud Private Relay Works",
    paragraphs: [
      "When Safari makes a request, Private Relay encrypts the URL and sends it through Apple's relay, which knows your identity but not the destination.",
      "A second, partner-operated relay then decrypts just enough to route the request to the destination site, seeing the destination but not your identity, splitting the information between two parties.",
    ],
    steps: [
      "Open Settings → tap your name → iCloud",
      "Tap Private Relay",
      "Toggle Private Relay on",
      "Choose your IP address location preference",
      "Browse in Safari to confirm the feature is active",
    ],
  },
},
{
  id: "ios-low-data-mode",
  title: "Low Data Mode",
  icon: Activity,
  platform: "ios",
  category: "connectivity-network",
  controlType: "action",
  heading: "Reduce Background Data Usage on Wi-Fi or Cellular",
  description: "Low Data Mode reduces background app refresh, automatic downloads, and streaming quality on a chosen Wi-Fi or cellular network, helping conserve data on metered or limited connections.",
  details: [
    "Configured separately for each Wi-Fi network and for cellular data",
    "Pauses automatic updates, iCloud Photos backups, and background app refresh on the affected network",
    "Streaming apps may lower default video/audio quality automatically",
    "Doesn't block manual downloads or active app use, only background activity",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/welcome/ios",
  whyItMatters: "Low Data Mode is especially useful for people on capped mobile hotspots, international roaming, or slow/expensive Wi-Fi networks like those found in some hotels or rural areas, where background syncing can silently consume a meaningful chunk of a limited data allowance. Because it's set per network rather than globally, a home Wi-Fi network can stay unrestricted while a mobile hotspot or roaming connection is protected, avoiding the need to remember to toggle it manually every time you change networks.",
  bestPractices: [
    "Enable it specifically for metered hotspot or guest Wi-Fi networks rather than your home network",
    "Turn it on for cellular data while traveling internationally to control roaming costs",
    "Expect streaming quality to drop automatically—manually raise it if quality matters more than data savings",
    "Review which background tasks you're comfortable pausing (like Photos backup) before relying on it long-term",
  ],
  commonIssues: [
    { issue: "Photos aren't backing up to iCloud", fix: "Check whether Low Data Mode is enabled on the current network, which pauses iCloud Photos sync" },
    { issue: "Streaming video looks lower quality than usual", fix: "This is expected behavior; disable Low Data Mode for that network if quality is a priority" },
    { issue: "Setting doesn't seem to apply", fix: "Confirm it was enabled for the specific network currently connected, since it's set per network, not globally" },
  ],
  faqs: [
    { q: "Does Low Data Mode block all downloads?", a: "No, it limits background and automatic downloads while still allowing manual downloads and active app use." },
    { q: "Can I set it for cellular and Wi-Fi differently?", a: "Yes, cellular Low Data Mode is configured separately from each individual Wi-Fi network's setting." },
    { q: "Will it affect call quality?", a: "It shouldn't meaningfully affect voice calls, which use relatively little data." },
  ],
  tipsAndTricks: [
    "Combine with Personal Hotspot's Maximize Compatibility off setting for the best data efficiency when tethering",
    "Check individual app settings for additional data-saving options like reduced streaming quality",
  ],
  relatedSettingIds: ["ios-cellular-data", "ios-wifi", "ios-personal-hotspot"],
  afterImageContent: {
    heading: "How Low Data Mode Works",
    paragraphs: [
      "When active on a network, iOS deprioritizes non-essential background data tasks such as automatic app updates, photo backups, and background refresh.",
      "Apps that stream media, like video or music services, can detect Low Data Mode and automatically default to a lower-bandwidth quality setting.",
    ],
    steps: [
      "Open Settings → Wi-Fi → tap the (i) next to a network, then toggle Low Data Mode",
      "For cellular, open Settings → Cellular → Cellular Data Options → toggle Low Data Mode",
      "Connect to the network to confirm reduced background activity",
      "Disable it for networks where full performance is preferred",
    ],
  },
},
{
  id: "ios-carplay",
  title: "CarPlay",
  icon: Car,
  platform: "ios",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Connect iPhone to Your Car's Display",
  description: "CarPlay settings let you pair a vehicle, arrange which apps appear on the CarPlay screen, configure Siri and notification behavior while driving, and control automatic connection when you get in the car.",
  details: [
    "Supports both wired (USB) and wireless CarPlay depending on the vehicle",
    "App icon layout on the CarPlay screen can be customized independently of the iPhone Home Screen",
    "Notifications while driving can be limited to reduce distraction",
    "Multiple paired vehicles can each retain their own CarPlay settings",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT204025",
  whyItMatters: "CarPlay puts navigation, messaging, calls, and music behind a simplified, larger-touch-target interface designed specifically to reduce distraction while driving, replacing the need to interact with the smaller iPhone screen at all. Its settings determine which apps are safe and quick to access at a glance, which matters directly for road safety. As more vehicles ship with CarPlay as a standard feature, understanding its Settings app configuration—rather than only the in-car interface—helps with app arrangement and notification tuning before ever getting in the car.",
  bestPractices: [
    "Arrange the most-used apps (Maps, Music, Phone) prominently on the CarPlay Home Screen",
    "Limit notifications shown while CarPlay is active to reduce distraction",
    "Enable wireless CarPlay if your vehicle supports it for cable-free connection",
    "Review Siri settings so voice commands work reliably hands-free while driving",
  ],
  commonIssues: [
    { issue: "iPhone won't connect to CarPlay", fix: "Check the USB cable/port, or re-pair wireless CarPlay under Settings > General > CarPlay" },
    { issue: "CarPlay app layout keeps resetting", fix: "Rearrange manually and avoid resetting network/device settings, which can revert CarPlay preferences" },
    { issue: "A specific app doesn't appear on CarPlay", fix: "Confirm the app supports CarPlay and hasn't been hidden under Settings > General > CarPlay > [Car Name]" },
  ],
  faqs: [
    { q: "Does CarPlay require a data connection?", a: "Some features like Maps traffic data need connectivity, but basic music playback and calls can work without it." },
    { q: "Can I use CarPlay wirelessly?", a: "Yes, if both the vehicle and iPhone support wireless CarPlay, no cable is required." },
    { q: "Will CarPlay drain my battery faster?", a: "Wired CarPlay typically charges the phone while in use; wireless CarPlay may use more battery without a cable connected." },
  ],
  tipsAndTricks: [
    "Use 'Hey Siri' or the CarPlay Siri button to keep hands on the wheel while sending messages or getting directions",
    "Set a Driving Focus to automatically silence non-urgent notifications when CarPlay connects",
  ],
  relatedSettingIds: ["ios-bluetooth", "ios-siri-search", "ios-focus"],
  afterImageContent: {
    heading: "How CarPlay Works",
    paragraphs: [
      "CarPlay mirrors a simplified, driving-optimized interface from iPhone onto a compatible vehicle's built-in display, either over USB or wirelessly.",
      "Supported apps register with CarPlay to appear on the in-car screen, while system settings control layout, notifications, and Siri behavior specific to each paired vehicle.",
    ],
    steps: [
      "Connect iPhone to the vehicle via USB, or pair wirelessly if supported",
      "Follow on-screen prompts on the car's display to complete setup",
      "Open Settings → General → CarPlay to manage paired cars",
      "Tap a vehicle name to rearrange apps and adjust preferences",
      "Get in the car to confirm automatic connection works as expected",
    ],
  },
},
{
  id: "ios-magsafe-charging",
  title: "MagSafe & Charging Accessories",
  icon: BatteryCharging,
  platform: "ios",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Manage MagSafe and Wireless Charging Behavior",
  description: "MagSafe and wireless charging settings show connected chargers and battery accessories, support Optimized Battery Charging to protect long-term battery health, and can trigger automatic behaviors when a MagSafe accessory attaches.",
  details: [
    "Optimized Battery Charging learns your routine to slow charging past 80% until needed",
    "Connected MagSafe battery packs and cases show charge level on the Lock Screen and widgets",
    "Some MagSafe accessories can trigger a Focus mode or Shortcut automatically when attached",
    "Clean Energy Charging can prioritize charging times using cleaner regional energy where available",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT210401",
  whyItMatters: "Battery longevity is one of the most common practical concerns iPhone owners have, and charging behavior—how often the battery sits at 100%, how it heats during fast wireless charging—has a measurable effect on long-term capacity. MagSafe's magnetic alignment also made a new category of accessories possible, from battery packs to car mounts and wallets, and having the system recognize and report on them centrally makes it easier to monitor charge levels without opening each accessory's own app.",
  bestPractices: [
    "Keep Optimized Battery Charging enabled to reduce long-term battery wear",
    "Use official or MFi-certified MagSafe accessories for reliable alignment and charging speed",
    "Remove thick cases that aren't MagSafe-compatible, which can weaken magnetic alignment and slow charging",
    "Check attached accessory battery levels via widgets rather than removing the accessory to check",
  ],
  commonIssues: [
    { issue: "MagSafe charging is slower than expected", fix: "Confirm the charger is a genuine MagSafe or MFi-certified accessory and check for a case interfering with alignment" },
    { issue: "A MagSafe accessory isn't recognized", fix: "Detach and reattach it, ensuring correct magnetic alignment with the back of the iPhone" },
    { issue: "Optimized Battery Charging seems to hold charge at 80% too long", fix: "This is expected behavior based on your usage pattern; charge manually to 100% before trips if needed" },
  ],
  faqs: [
    { q: "Do I need a MagSafe case to use MagSafe accessories?", a: "No, MagSafe works directly with iPhone's built-in magnets, though a MagSafe-compatible case helps maintain alignment." },
    { q: "Can I use MagSafe and wired charging at the same time?", a: "Yes, but it typically isn't necessary since either method alone fully charges the device." },
    { q: "Does MagSafe charge slower than a cable?", a: "Yes, wireless charging is generally slower than a wired connection, though still convenient for topping up." },
  ],
  tipsAndTricks: [
    "Use a MagSafe car mount with an automation to launch CarPlay or Maps when attached",
    "Check Battery settings for Optimized Charging history to see how it's adapting to your routine",
  ],
  relatedSettingIds: ["ios-airpods-settings", "ios-bluetooth-accessories"],
  afterImageContent: {
    heading: "How MagSafe & Charging Accessories Work",
    paragraphs: [
      "MagSafe uses a ring of magnets aligned with wireless charging coils on the back of iPhone, letting compatible accessories snap into place for reliable charging or secure attachment.",
      "Optimized Battery Charging uses on-device machine learning to understand your daily charging routine, delaying the final charge to 100% until closer to when you'll unplug.",
    ],
    steps: [
      "Attach a MagSafe charger or accessory to the back of iPhone",
      "Open Settings → Battery → Battery Health & Charging",
      "Toggle Optimized Battery Charging on",
      "Check attached accessory battery levels via the Today View widget",
      "Enable Clean Energy Charging if available in your region",
    ],
  },
},
{
  id: "ios-external-storage-files",
  title: "External Storage (Files App)",
  icon: HardDrive,
  platform: "ios",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Browse USB Drives and Network Shares in Files",
  description: "iPhone can connect to USB flash drives, SD card readers, and network file shares through the Files app, letting you browse, copy, and manage content directly from connected external storage.",
  details: [
    "Supports USB drives and card readers via a USB-C to USB or Lightning adapter",
    "Network shares (SMB) can be added as locations under Files > Browse",
    "External volumes appear as locations alongside iCloud Drive and On My iPhone",
    "Files can be copied between external storage and on-device or iCloud locations",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/welcome/ios",
  whyItMatters: "The Files app's support for external storage turns iPhone into a more capable tool for offloading photos and videos from a camera's SD card, transferring files without relying on cloud sync, or accessing documents stored on a home network drive. This matters most for professionals like photographers and videographers working in the field, or anyone needing to move large files that would be slow or costly to sync through iCloud. It closes a long-standing gap between iPhone and traditional computers for basic file management tasks.",
  bestPractices: [
    "Use a certified USB-C or Lightning adapter to avoid connection reliability issues",
    "Safely eject external drives from the Files app before physically disconnecting",
    "Add frequently used network shares as Favorites in Files for quick access",
    "Copy large media files to on-device storage before extended offline editing sessions",
  ],
  commonIssues: [
    { issue: "A USB drive isn't recognized", fix: "Confirm the adapter and drive are compatible with iPhone's supported formats (e.g., exFAT, FAT32)" },
    { issue: "A network share won't connect", fix: "Verify the server address, credentials, and that the device is on the same network under Files > Browse > Connect to Server" },
    { issue: "Files transfer slowly from external storage", fix: "This can be limited by the adapter or drive speed rather than iPhone itself" },
  ],
  faqs: [
    { q: "What drive formats does iPhone support?", a: "Common formats include exFAT, FAT32, and Apple's own formats; unsupported formats may need reformatting first." },
    { q: "Can I edit documents directly from a USB drive?", a: "Yes, many apps can open and save files directly to a connected external drive through Files." },
    { q: "Does this work with all iPhone models?", a: "Support depends on the connector type (USB-C or Lightning) and the specific adapter used." },
  ],
  tipsAndTricks: [
    "Use the Files app's search to quickly locate content across both external and cloud storage locations",
    "Tag important files in Files for faster retrieval later regardless of storage location",
  ],
  relatedSettingIds: ["ios-icloud-account", "ios-keyboard"],
  afterImageContent: {
    heading: "How External Storage in Files Works",
    paragraphs: [
      "When a USB drive or card reader is connected, iOS mounts it as a browsable volume inside the Files app, alongside iCloud Drive and on-device storage.",
      "Network shares work similarly, connecting over SMB to a server or NAS device so its folders appear as another location within Files.",
    ],
    steps: [
      "Connect a USB drive using a compatible adapter, or open Files → Browse → Connect to Server for a network share",
      "Enter server credentials if prompted",
      "Locate the new volume under Locations in the Files app",
      "Browse, copy, or move files as needed",
      "Eject the volume properly before disconnecting hardware",
    ],
  },
},
{
  id: "ios-airplay-screen-mirroring",
  title: "AirPlay & Screen Mirroring",
  icon: Cast,
  platform: "ios",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Stream Audio and Mirror Your Screen Wirelessly",
  description: "AirPlay settings control which devices can receive streamed audio, video, and mirrored screen content from iPhone, including Apple TVs, HomePods, and AirPlay 2-compatible smart TVs and speakers.",
  details: [
    "Screen Mirroring projects the full iPhone display, including apps without native AirPlay support",
    "AirPlay 2 supports multi-room audio to several speakers simultaneously",
    "Automatically AirPlay to receivers can be restricted to devices on the same network or Everyone nearby",
    "Password protection can be required for AirPlay in supported receiver setups",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT204289",
  whyItMatters: "AirPlay is central to how Apple devices integrate with home entertainment and audio systems, letting content move seamlessly from a phone screen to a television or a set of speakers without cables or third-party apps. Screen Mirroring specifically extends this to any app, including ones without native casting support, which matters for presentations, gaming, or sharing content that wasn't built with AirPlay in mind. Controlling who can AirPlay to your devices also matters for shared or public spaces, preventing unwanted content from appearing on a screen.",
  bestPractices: [
    "Restrict AirPlay receiver access to your own network in shared or public Wi-Fi environments",
    "Use AirPlay 2 multi-room audio to sync music across multiple HomePods or speakers",
    "Use Screen Mirroring for presentations when an app lacks native AirPlay output",
    "Require a password for AirPlay on receivers used in shared households or offices",
  ],
  commonIssues: [
    { issue: "AirPlay device doesn't appear in the list", fix: "Confirm both devices are on the same Wi-Fi network and the receiver isn't in a restricted-access mode" },
    { issue: "Screen Mirroring lags or drops", fix: "Move closer to the Wi-Fi router or reduce network congestion from other streaming devices" },
    { issue: "Audio plays on the wrong speaker", fix: "Reselect the correct output device from Control Center's AirPlay menu" },
  ],
  faqs: [
    { q: "Does AirPlay require Wi-Fi?", a: "Yes, both devices generally need to be on the same Wi-Fi network, though peer-to-peer AirPlay works in some cases without a shared network." },
    { q: "Can I stream to multiple speakers at once?", a: "Yes, AirPlay 2 supports simultaneous multi-room playback to several compatible speakers." },
    { q: "Is Screen Mirroring the same as casting?", a: "It's Apple's equivalent, projecting the entire screen rather than a single app's dedicated video stream." },
  ],
  tipsAndTricks: [
    "Use Control Center's AirPlay icon for the fastest way to switch audio or video output",
    "Group HomePods into a stereo pair or room-based set for richer multi-room sound",
  ],
  relatedSettingIds: ["ios-bluetooth", "ios-continuity-handoff"],
  afterImageContent: {
    heading: "How AirPlay & Screen Mirroring Work",
    paragraphs: [
      "AirPlay streams audio or video wirelessly over Wi-Fi to compatible receivers, decoding and playing the content on the receiving device rather than just displaying a static mirror.",
      "Screen Mirroring instead transmits a live video feed of the entire iPhone display, useful for apps that don't support AirPlay natively.",
    ],
    steps: [
      "Open Control Center and tap the Screen Mirroring or AirPlay icon",
      "Select the target device from the list",
      "Enter a password if the receiver requires one",
      "Adjust receiver access under Settings → General → AirPlay & Handoff",
      "Tap Stop Mirroring or disconnect from Control Center when finished",
    ],
  },
},
{
  id: "ios-true-tone",
  title: "True Tone",
  icon: Sun,
  platform: "ios",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Adapt Display Color to Ambient Lighting",
  description: "True Tone uses ambient light sensors to automatically adjust the display's white balance and intensity to match surrounding lighting conditions, keeping colors looking natural under different light sources.",
  details: [
    "Available on iPhones with a True Tone-capable display",
    "Adjusts warmth and brightness balance continuously as lighting changes",
    "Can be toggled quickly from Control Center's brightness slider options",
    "Independent from Night Shift, which shifts color specifically in the evening",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/welcome/ios",
  whyItMatters: "True Tone reduces the jarring color shift that happens when moving between different lighting environments, like stepping from fluorescent office lighting into daylight, by continuously adjusting the display to look natural rather than static. For photographers and designers doing color-sensitive work, however, True Tone can actually introduce inconsistency, since it intentionally alters perceived color rather than rendering a fixed reference. Knowing when to disable it matters as much as knowing when to leave it on.",
  bestPractices: [
    "Leave True Tone on for general everyday use to reduce eye strain from harsh lighting transitions",
    "Disable it temporarily when doing precise color-matching work like photo editing",
    "Combine with auto-brightness for the most seamless adaptive display experience",
    "Check True Tone status if colors look different than expected in a specific app",
  ],
  commonIssues: [
    { issue: "Screen colors look inconsistent across locations", fix: "This is True Tone working as intended; disable it under Settings > Display & Brightness if consistency matters more" },
    { issue: "True Tone toggle is missing", fix: "Confirm the device model supports True Tone, as older or lower-cost models may lack the sensor" },
    { issue: "Colors look too warm indoors", fix: "This is expected behavior under warm artificial lighting; turn off True Tone if a cooler tone is preferred" },
  ],
  faqs: [
    { q: "Is True Tone the same as Night Shift?", a: "No, True Tone adapts to ambient light in real time, while Night Shift shifts warmer only in the evening on a schedule." },
    { q: "Does True Tone affect battery life?", a: "Its impact is minimal since it primarily adjusts color processing rather than significantly changing brightness." },
    { q: "Can I toggle True Tone quickly?", a: "Yes, press and hold the brightness slider in Control Center to reveal a quick True Tone toggle." },
  ],
  tipsAndTricks: [
    "Turn off True Tone before calibrating colors for professional photo or video editing",
    "Use Control Center's long-press brightness menu for one-tap access instead of Settings",
  ],
  relatedSettingIds: ["ios-display-brightness", "ios-night-shift"],
  afterImageContent: {
    heading: "How True Tone Works",
    paragraphs: [
      "True Tone uses ambient light sensors near the front camera to continuously measure the color temperature and brightness of the surrounding environment.",
      "The display then adjusts its white balance in real time to match, aiming to make white appear consistently white regardless of the ambient lighting.",
    ],
    steps: [
      "Open Settings → Display & Brightness",
      "Toggle True Tone on or off",
      "Alternatively, long-press the brightness slider in Control Center",
      "Tap the True Tone icon to toggle it quickly",
    ],
  },
},
{
  id: "ios-night-shift",
  title: "Night Shift",
  icon: Moon,
  platform: "ios",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Shift Display Colors Warmer After Dark",
  description: "Night Shift automatically shifts the iPhone display to warmer colors on a schedule or from sunset to sunrise, reducing blue light exposure that can interfere with sleep when using the device at night.",
  details: [
    "Schedule can follow Sunset to Sunrise automatically or a custom fixed time range",
    "Warmth level is adjustable along a slider from slightly warm to very warm",
    "Can be toggled instantly from Control Center's brightness menu",
    "Applies system-wide across the display, not per-app",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT207513",
  whyItMatters: "Night Shift addresses growing awareness of how blue light exposure in the evening can suppress melatonin production and disrupt sleep patterns, making it one of the more health-oriented display settings on iPhone. Automating it to Sunset to Sunrise removes the need to remember to turn it on manually, which matters because the people most likely to benefit are also the ones using their phone late at night when they're least likely to think about adjusting settings. It's a low-effort habit change with a plausible benefit for sleep hygiene.",
  bestPractices: [
    "Set the schedule to Sunset to Sunrise for automatic, location-based timing",
    "Increase warmth in the evening hours closer to bedtime for a stronger effect",
    "Combine with Dark Mode for a more comprehensive nighttime viewing experience",
    "Disable temporarily if doing color-accurate work in the evening",
  ],
  commonIssues: [
    { issue: "Night Shift doesn't turn on automatically", fix: "Confirm Location Services is enabled so Sunset to Sunrise scheduling can calculate local times" },
    { issue: "Screen looks too yellow/orange", fix: "Lower the warmth level using the slider under Settings > Display & Brightness > Night Shift" },
    { issue: "Night Shift disables unexpectedly", fix: "Check if Custom Schedule times need adjusting, or if Low Power Mode is interacting with display settings" },
  ],
  faqs: [
    { q: "Does Night Shift replace Dark Mode?", a: "No, they're complementary—Night Shift adjusts color temperature while Dark Mode changes the overall interface color scheme." },
    { q: "Can I manually override the schedule?", a: "Yes, use the Control Center toggle to turn it on or off outside the scheduled window until the next automatic change." },
    { q: "Does Night Shift affect photos or videos taken?", a: "No, it only affects on-screen display rendering, not captured content." },
  ],
  tipsAndTricks: [
    "Use the Control Center brightness long-press for a quick manual Night Shift toggle",
    "Pair with a wind-down Focus mode for a fuller evening routine",
  ],
  relatedSettingIds: ["ios-display-brightness", "ios-true-tone", "ios-dark-mode"],
  afterImageContent: {
    heading: "How Night Shift Works",
    paragraphs: [
      "Night Shift uses the device's clock and, if enabled, its location to determine local sunset and sunrise times, automatically shifting the display's colors warmer during that window.",
      "The warmth intensity is adjustable, letting users choose a subtle or pronounced color shift based on personal preference.",
    ],
    steps: [
      "Open Settings → Display & Brightness → Night Shift",
      "Toggle Scheduled on and choose Sunset to Sunrise or a custom time",
      "Adjust the Color Temperature slider",
      "Use Control Center's brightness menu for quick manual toggling",
    ],
  },
},
{
  id: "ios-dark-mode",
  title: "Dark Mode",
  icon: Contrast,
  platform: "ios",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Switch Between Light and Dark Appearance",
  description: "Dark Mode changes the system interface and supported apps to a dark color scheme, and can be set to switch automatically at sunset and sunrise or on a custom schedule.",
  details: [
    "Applies to system apps, Home Screen, and any third-party apps that support Dark Mode",
    "Automatic scheduling can follow Sunset to Sunrise or a fixed custom time range",
    "Can be toggled instantly from Control Center's brightness menu",
    "Wallpaper can be set to change automatically between light and dark variants",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/welcome/ios",
  whyItMatters: "Dark Mode has become one of the most widely adopted display preferences, valued both for reduced eye strain in low-light environments and for potential battery savings on OLED displays, where darker pixels use less power. It also has an accessibility dimension for users sensitive to bright screens or with certain light sensitivity conditions. Because appearance choice now often follows time of day automatically, it reduces the friction of manually switching modes throughout a normal daily routine.",
  bestPractices: [
    "Set Automatic scheduling to Sunset to Sunrise for a hands-off day/night appearance switch",
    "Pair with Night Shift for a fuller nighttime viewing setup",
    "Choose dark or light wallpaper variants that complement the current appearance mode",
    "Check third-party apps individually, since not all fully support Dark Mode styling",
  ],
  commonIssues: [
    { issue: "An app doesn't switch to Dark Mode", fix: "Check that app's own in-app appearance setting, since not all apps follow the system-wide setting" },
    { issue: "Dark Mode doesn't switch automatically", fix: "Confirm Automatic is enabled under Settings > Display & Brightness and Location Services is available for sunset/sunrise timing" },
    { issue: "Wallpaper doesn't change with appearance mode", fix: "Choose a wallpaper option that explicitly supports Light/Dark variants when setting it" },
  ],
  faqs: [
    { q: "Does Dark Mode save battery?", a: "On OLED displays, dark pixels use less power, so it can provide modest battery savings, especially at higher brightness." },
    { q: "Can I set Dark Mode for specific apps only?", a: "The system setting is global, but many apps offer their own independent light/dark override within the app." },
    { q: "Is Dark Mode the same as Night Shift?", a: "No, Dark Mode changes interface colors, while Night Shift adjusts the warmth of the display's color temperature." },
  ],
  tipsAndTricks: [
    "Use a long-press on the Control Center brightness slider for a one-tap Dark/Light toggle",
    "Choose a Dynamic or Dark-specific wallpaper to make the transition feel more deliberate",
  ],
  relatedSettingIds: ["ios-display-brightness", "ios-night-shift", "ios-true-tone"],
  afterImageContent: {
    heading: "How Dark Mode Works",
    paragraphs: [
      "Dark Mode swaps the system's light interface elements for dark equivalents across supported apps, menus, and system screens.",
      "When set to Automatic, iOS uses the time of day, or sunset/sunrise if location is available, to switch appearance without manual input.",
    ],
    steps: [
      "Open Settings → Display & Brightness",
      "Choose Light, Dark, or Automatic",
      "If Automatic, tap Options to set Sunset to Sunrise or a custom schedule",
      "Adjust wallpaper for Light/Dark variants if desired",
    ],
  },
},
{
  id: "ios-auto-lock",
  title: "Auto-Lock",
  icon: Clock,
  platform: "ios",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Set How Quickly the Screen Locks",
  description: "Auto-Lock determines how long iPhone waits without any touch input before dimming and locking the screen, balancing convenience against battery life and security.",
  details: [
    "Options typically range from 30 seconds to 5 minutes, plus Never",
    "Interacts with Attention Aware Features, which can keep the screen on longer while you're looking at it",
    "Locking triggers Face ID/Touch ID or passcode requirement for the next unlock, per Sign-In settings",
    "Low Power Mode can influence default screen timeout behavior",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/welcome/ios",
  whyItMatters: "Auto-Lock is a quiet but constant tradeoff between security, battery life, and convenience—too short and the screen locks mid-task annoyingly, too long and the device stays unlocked and visible longer than necessary, both draining battery and creating a privacy exposure window if left unattended. In shared or public spaces, a short Auto-Lock time reduces the chance of someone else viewing notifications or content on an unattended device. It's one of the simplest settings with an outsized effect on daily battery performance.",
  bestPractices: [
    "Choose a shorter Auto-Lock time (30 seconds–1 minute) in public or shared environments for better privacy",
    "Use Never only when the device is stationary and charging, such as during a presentation or as a kiosk",
    "Combine with Attention Aware Features so the screen doesn't dim while actively reading",
    "Reconsider a longer timeout if you find yourself frequently unlocking mid-task",
  ],
  commonIssues: [
    { issue: "Screen locks too quickly while reading", fix: "Increase the Auto-Lock duration under Settings > Display & Brightness > Auto-Lock, or enable Attention Aware Features" },
    { issue: "Auto-Lock option is grayed out", fix: "Check whether Low Power Mode or a Screen Time restriction is overriding the setting" },
    { issue: "Battery drains faster after changing Auto-Lock", fix: "A longer timeout keeps the display on more, increasing power use; shorten it if battery life matters more" },
  ],
  faqs: [
    { q: "Does Auto-Lock affect Face ID timing?", a: "No, Face ID recognition speed is separate; Auto-Lock only controls when the screen dims and locks from inactivity." },
    { q: "Can Auto-Lock be set to Never?", a: "Yes, though it's generally discouraged for battery and security reasons except in specific stationary use cases." },
    { q: "Does Attention Aware Features override Auto-Lock?", a: "It can delay dimming while it detects you're looking at the screen, on supported Face ID models." },
  ],
  tipsAndTricks: [
    "Use a shorter Auto-Lock time paired with Face ID for a good balance of security and quick access",
    "Check Screen Time > Always Allowed if Auto-Lock behaves unexpectedly during restricted hours",
  ],
  relatedSettingIds: ["ios-display-brightness", "ios-sign-in-security"],
  afterImageContent: {
    heading: "How Auto-Lock Works",
    paragraphs: [
      "Auto-Lock starts a countdown from the last touch interaction; once the chosen duration elapses without input, the screen dims and then locks.",
      "Attention Aware Features can extend this window on supported models by using the TrueDepth camera to detect whether the user is actively looking at the screen.",
    ],
    steps: [
      "Open Settings → Display & Brightness → Auto-Lock",
      "Choose a duration from the list, or Never",
      "Enable Attention Aware Features under Face ID & Passcode if desired",
      "Test by leaving the screen idle to confirm the timing feels right",
    ],
  },
},
{
  id: "ios-text-size-bold-text",
  title: "Text Size & Bold Text",
  icon: Type,
  platform: "ios",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Increase Text Size and Boldness System-Wide",
  description: "Text Size and Bold Text controls scale font size and weight across the system and supporting apps, making text easier to read without reducing the amount of visible screen content the way zooming would.",
  details: [
    "Dynamic Type slider adjusts text size across all apps that support it",
    "Larger Accessibility Sizes provides an extended range beyond the standard slider",
    "Bold Text increases font weight system-wide for improved contrast and legibility",
    "Works alongside Zoom and Display Zoom for additional visual scaling options",
  ],
  redirectUrl: "https://support.apple.com/accessibility/iphone",
  whyItMatters: "Text legibility is one of the most impactful accessibility adjustments available, benefiting not just users with low vision but anyone reading in bright sunlight, at a distance, or simply preferring larger text for comfort. Because Dynamic Type is a system-wide standard that well-built apps respect, changing it once improves readability consistently across Messages, Mail, Settings, and many third-party apps rather than requiring per-app adjustments. Bold Text adds a complementary contrast boost that particularly helps with thin, light-weight fonts common in modern app design.",
  bestPractices: [
    "Start with the standard Dynamic Type slider before moving into Larger Accessibility Sizes",
    "Enable Bold Text alongside larger sizes for maximum contrast and legibility",
    "Test key apps after changing sizes, since not all apps fully support Dynamic Type",
    "Combine with Display & Brightness zoom options if text size alone isn't sufficient",
  ],
  commonIssues: [
    { issue: "Text doesn't get larger in a specific app", fix: "That app may not support Dynamic Type; check for the app's own internal text size setting" },
    { issue: "Layouts look broken after increasing text size", fix: "Some apps handle very large accessibility sizes poorly; try a smaller increase or report it to the developer" },
    { issue: "Bold Text requires a restart to fully apply", fix: "This is expected—iOS may prompt a Home Screen refresh after toggling Bold Text" },
  ],
  faqs: [
    { q: "Is this the same as zooming the whole screen?", a: "No, Text Size scales font specifically, while Zoom magnifies the entire screen including images and icons." },
    { q: "Does Bold Text affect icon labels?", a: "Yes, it also thickens Home Screen icon labels and other system text for consistency." },
    { q: "Can text size be set differently per app?", a: "No, the system-wide setting applies everywhere apps support it; individual apps may offer separate internal overrides." },
  ],
  tipsAndTricks: [
    "Use Larger Accessibility Sizes for a substantial jump in readability beyond the standard range",
    "Pair with Increase Contrast under Accessibility > Display & Text Size for further legibility gains",
  ],
  relatedSettingIds: ["ios-display-brightness", "ios-accessibility", "ios-captions-subtitles"],
  afterImageContent: {
    heading: "How Text Size & Bold Text Work",
    paragraphs: [
      "Dynamic Type is a system-wide font scaling standard; adjusting the slider tells every supporting app to render its text at the new relative size.",
      "Bold Text applies a heavier font weight across the interface, increasing stroke width for better contrast against backgrounds.",
    ],
    steps: [
      "Open Settings → Accessibility → Display & Text Size",
      "Adjust the Text Size slider, or enable Larger Text for extended sizes",
      "Toggle Bold Text on",
      "Confirm the change (may prompt a brief Home Screen refresh)",
      "Open key apps to verify readability improvements",
    ],
  },
},
{
  id: "ios-attention-aware-features",
  title: "Attention Aware Features",
  icon: Eye,
  platform: "ios",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Let iPhone Detect When You're Looking at It",
  description: "Attention Aware Features use the TrueDepth camera on Face ID-equipped iPhones to keep the screen on and dim alert volume when it detects you're looking at the display, and to keep it unlocked while you're viewing it.",
  details: [
    "Delays Auto-Lock dimming while attention is detected on the screen",
    "Lowers ringer/alert volume automatically once it detects you're looking at the phone during an alert",
    "Requires Face ID hardware; unavailable on Touch ID-only models",
    "Works alongside, not instead of, the standard Auto-Lock timer",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/change-face-id-attention-settings-ios",
  whyItMatters: "Attention Aware Features smooth out one of the more common frustrations with a fixed Auto-Lock timer: the screen dimming or locking while someone is actively reading, simply because a set number of seconds passed without a touch. By using the camera to confirm genuine attention, iPhone can extend usability without requiring a longer, less battery-efficient Auto-Lock timeout for everyone all the time. The alert-volume-lowering behavior is a smaller but genuinely useful courtesy, quieting a loud notification the moment you look at the phone.",
  bestPractices: [
    "Keep Attention Aware Features enabled if you frequently read long content like articles or messages",
    "Understand it works alongside, not as a replacement for, your Auto-Lock timer setting",
    "Disable it only if experiencing noticeable battery impact or camera-related performance concerns",
    "Test in different lighting conditions, since low light can reduce detection reliability",
  ],
  commonIssues: [
    { issue: "Screen still dims while reading", fix: "Ensure Attention Aware Features is enabled under Settings > Face ID & Passcode and the camera has a clear, unobstructed view" },
    { issue: "Feature isn't available", fix: "Confirm the device has Face ID hardware; Touch ID models don't support Attention Aware Features" },
    { issue: "Alert volume doesn't lower as expected", fix: "Confirm you're looking directly at the front camera area when the alert plays" },
  ],
  faqs: [
    { q: "Does this feature record video?", a: "No, it uses the TrueDepth camera for real-time attention detection without recording or storing images." },
    { q: "Can it be used with a screen protector or case?", a: "Generally yes, as long as the front camera area remains unobstructed." },
    { q: "Does it affect battery life noticeably?", a: "Its impact is generally minor since detection uses efficient, low-power camera processing." },
  ],
  tipsAndTricks: [
    "Combine with a longer Auto-Lock timer for the most seamless reading experience without oversized battery cost",
    "Keep the TrueDepth camera area clean for the most reliable attention detection",
  ],
  relatedSettingIds: ["ios-display-brightness", "ios-sign-in-security", "ios-auto-lock"],
  afterImageContent: {
    heading: "How Attention Aware Features Work",
    paragraphs: [
      "The TrueDepth camera system used for Face ID also supports lightweight attention detection, checking whether your eyes are directed at the screen.",
      "When attention is detected, iPhone delays the Auto-Lock dimming countdown and can automatically reduce the volume of an incoming alert.",
    ],
    steps: [
      "Open Settings → Face ID & Passcode",
      "Enter your passcode if prompted",
      "Toggle Attention Aware Features on",
      "Test by reading content near the Auto-Lock timeout to confirm the screen stays active",
    ],
  },
},
{
  id: "ios-home-screen-widgets",
  title: "Home Screen Widgets",
  icon: LayoutGrid,
  platform: "ios",
  category: "personalization",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Add and arrange Home Screen widgets",
  description: "Widgets show live, glanceable information from an app directly on the Home Screen or Today View, in small, medium, large, or Smart Stack sizes.",
  details: [
    "Long-press an empty area of the Home Screen to enter jiggle mode, then tap the + button.",
    "Browse widgets by app or search by name, then choose a size before adding.",
    "Smart Stacks automatically surface the most relevant widget based on time and habits.",
    "Widgets can be placed anywhere on the Home Screen since iOS 14, not just in Today View.",
  ],
  redirectUrl: "https://support.apple.com/en-us/118610",
  whyItMatters: "Widgets reduce how often a person needs to open an app just to check a small piece of information, like weather, battery levels, or the next calendar event. Well-chosen widgets turn the Home Screen into a personalized dashboard rather than just a grid of launch icons. Because widgets update in the background on a schedule set by the system, they also offer a lower-friction alternative to notifications for information that doesn't need to interrupt the user. Thoughtful widget placement is one of the most visible forms of iPhone personalization.",
  bestPractices: [
    "Use Smart Stacks so the system rotates widgets automatically instead of manually swapping them.",
    "Limit large widgets to one or two per screen to avoid crowding out app icons.",
    "Remove widgets for apps that are rarely opened to keep the Home Screen purposeful.",
    "Pair widgets with Focus filters so different widgets show for Work versus Personal contexts.",
  ],
  commonIssues: [
    { issue: "A widget shows stale or blank data.", fix: "Open the source app once so it can refresh in the background, then check that Background App Refresh is enabled for it." },
    { issue: "Can't find a specific widget size.", fix: "Not every app offers every size; scroll through the available sizes shown for that app in the widget gallery." },
    { issue: "Widgets disappear after a restore.", fix: "Widgets tied to third-party apps need those apps reinstalled before the widget can be re-added." },
  ],
  faqs: [
    { q: "Can widgets be interactive?", a: "Yes, since iOS 17 many widgets support small interactions like checking off a to-do item without opening the app." },
    { q: "Do widgets use extra battery?", a: "Widgets refresh on a system-managed schedule designed to minimize battery impact, though very frequent-updating widgets can use more power." },
    { q: "Can I put widgets on the Lock Screen too?", a: "Yes, Lock Screen widgets are added separately through the Lock Screen customization editor." },
  ],
  tipsAndTricks: [
    "Tap and hold a widget directly to get quick edit options without entering jiggle mode.",
    "Stack multiple widgets by dragging one on top of another to save space.",
  ],
  relatedSettingIds: ["ios-home-screen-app-library", "ios-standby-lock-screen", "ios-action-button"],
  afterImageContent: {
    heading: "How Home Screen Widgets Work",
    paragraphs: [
      "Widgets are powered by app extensions that periodically request a timeline of content from the system, which then decides when to redraw the widget to balance freshness against battery life.",
      "Smart Stacks use on-device intelligence to guess which widget in a stack is most useful right now, based on location, time of day, and app usage patterns.",
    ],
    steps: [
      "Long-press an empty spot on the Home Screen until icons jiggle.",
      "Tap the + button in the top corner.",
      "Search for or scroll to the desired app.",
      "Swipe through available sizes and tap Add Widget.",
      "Drag the widget to the preferred position, then tap Done.",
    ],
  },
},
{
  id: "ios-display-zoom",
  title: "Display Zoom",
  icon: ZoomIn,
  platform: "ios",
  category: "personalization",
  controlType: "action",
  heading: "Switch between Standard and Zoomed display views",
  description: "Display Zoom scales the entire interface larger (Zoomed) or shows more content at once (Standard), changing the effective size of icons, text, and controls together.",
  details: [
    "Found in Settings > Display & Brightness > View, below the Text Size controls.",
    "Zoomed enlarges on-screen elements for easier viewing at the cost of visible content per screen.",
    "Standard fits more apps, widgets, and content on screen at native resolution.",
    "Changing this setting requires a brief restart of the Home Screen.",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/customize-the-text-size-and-zoom-setting-iphd6804774e/ios",
  whyItMatters: "Unlike Text Size, which only scales text, Display Zoom scales the entire interface proportionally, making it a good option for anyone who finds icons, buttons, and spacing too small on a larger-screen iPhone. Because it changes layout density system-wide, it directly trades visual comfort for information density, a tradeoff every user weighs differently depending on hand size, eyesight, and how they use their phone. It's especially useful on Plus and Pro Max models where the extra screen real estate can otherwise go unused by people who'd rather have bigger tap targets.",
  bestPractices: [
    "Try Zoomed for a full day before deciding, since some apps rearrange their layout noticeably in this mode.",
    "Pair with a larger Text Size only if Zoomed alone isn't enough, to avoid overly cramped app layouts.",
    "Revisit this setting after buying a new iPhone with a different screen size, since preferences can change with more or less display area.",
  ],
  commonIssues: [
    { issue: "Some apps look cropped or misaligned after switching.", fix: "This is normal for apps not fully optimized for Zoomed mode; switch back to Standard if it's disruptive in a critical app." },
    { issue: "Home Screen icons lost their original grid arrangement after switching.", fix: "Zoomed mode uses a smaller grid, so some icons move into a new page automatically; rearrange as needed." },
  ],
  faqs: [
    { q: "Does Display Zoom affect screenshots or screen recordings?", a: "Screenshots capture the interface as displayed, so Zoomed mode content appears larger in captures too." },
    { q: "Can Display Zoom be set per app?", a: "No, it is a single system-wide display mode." },
  ],
  tipsAndTricks: [
    "Preview both views directly in the settings screen before applying, since a live preview is shown for each option.",
  ],
  relatedSettingIds: ["ios-text-size-bold-text", "ios-home-screen-app-library"],
  afterImageContent: {
    heading: "How Display Zoom Works",
    paragraphs: [
      "Display Zoom renders the interface at a different logical resolution, effectively simulating a smaller-screen device's layout scale on a larger physical panel.",
      "Because the change affects the whole rendering pipeline, the Home Screen must restart to reflow icons, widgets, and app grids.",
    ],
    steps: [
      "Open Settings and tap Display & Brightness.",
      "Scroll to the View section and tap Display Zoom.",
      "Choose Standard or Zoomed and preview the layout.",
      "Tap Set in the top corner and confirm to restart the Home Screen.",
    ],
  },
},
{
  id: "ios-action-button",
  title: "Action Button",
  icon: SlidersHorizontal,
  platform: "ios",
  category: "personalization",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Reprogram the Action Button shortcut",
  description: "On iPhone 15 Pro and later, the Action Button replaces the mute switch and can be assigned to trigger Silent Mode, Camera, Flashlight, a Shortcut, Accessibility features, and more with a press-and-hold.",
  details: [
    "Configured in Settings > Action Button with a horizontal swipe picker to choose the assigned action.",
    "Default assignment is Silent Mode, mirroring the switch it replaced.",
    "Can trigger any personal Shortcut, enabling custom multi-step automations.",
    "Some actions, like Translate or Magnifier, support additional sub-options once selected.",
  ],
  important: "Only available on iPhone 15 Pro, iPhone 15 Pro Max, and later Pro models; standard models still use the physical mute switch.",
  redirectUrl: "https://support.apple.com/guide/iphone/use-and-customize-the-action-button-iphe89d61d66/ios",
  whyItMatters: "The Action Button turns a single physical press into a personal shortcut to whatever a user does most often, whether that's silencing the phone before a meeting, jumping straight into the camera to catch a moment, or running a multi-step Shortcut automation. Because it replaces a switch people already reach for by muscle memory, its customization has an outsized effect on how quickly someone can perform their most common action without unlocking the phone or hunting through Control Center. It's one of the clearest examples of iOS personalization extending to hardware, not just software.",
  bestPractices: [
    "Assign the action that would otherwise take the most taps to reach, such as a frequently used Shortcut.",
    "Reassign it temporarily for specific contexts, like Flashlight while traveling or camping.",
    "Test the press-and-hold duration in a low-stakes moment so it becomes reliable muscle memory.",
  ],
  commonIssues: [
    { issue: "The button doesn't seem to do anything.", fix: "It requires a firm press-and-hold, not a quick tap; a haptic pulse confirms activation." },
    { issue: "A Shortcut assigned to the button no longer runs.", fix: "Open Settings > Action Button and reselect the Shortcut, since it can become unlinked if the Shortcut was deleted and recreated." },
    { issue: "Silent Mode behavior changed after reassigning the button.", fix: "Once reassigned away from Silent Mode, ringer control moves to Control Center or the Sound & Haptics settings." },
  ],
  faqs: [
    { q: "Can the Action Button have more than one function?", a: "Only indirectly, by assigning it to a Shortcut that itself performs multiple actions or offers a menu." },
    { q: "Does it work when the iPhone is locked?", a: "Yes, most assigned actions work directly from the Lock Screen." },
  ],
  tipsAndTricks: [
    "Assign it to a Shortcut that shows a menu of several actions to effectively multiply its functionality.",
    "Use the Accessibility assignment to instantly toggle features like VoiceOver or Magnifier in a pinch.",
  ],
  relatedSettingIds: ["ios-control-center", "ios-home-screen-widgets", "ios-back-tap"],
  afterImageContent: {
    heading: "How the Action Button Works",
    paragraphs: [
      "The Action Button is a solid-state, pressure-sensing button rather than a mechanical switch, allowing it to be reprogrammed entirely in software.",
      "Settings stores a single assigned action, which the system triggers via a haptic-confirmed press-and-hold gesture.",
    ],
    steps: [
      "Open Settings and tap Action Button.",
      "Swipe left or right through the available actions.",
      "Tap any action that offers further options, like choosing a specific Shortcut.",
      "Press and hold the physical Action Button to test the new assignment.",
    ],
  },
},
{
  id: "ios-back-tap",
  title: "Back Tap Gestures",
  icon: Accessibility,
  platform: "ios",
  category: "personalization",
  controlType: "action",
  heading: "Trigger actions by tapping the back of iPhone",
  description: "Back Tap lets a double or triple tap on the back of the iPhone launch an action or Shortcut, without touching the screen or any physical button.",
  details: [
    "Located in Settings > Accessibility > Touch > Back Tap.",
    "Double Tap and Triple Tap can each be assigned a different action independently.",
    "Supports system actions like screenshot, Control Center, and Mute, plus any personal Shortcut.",
    "Uses the accelerometer and gyroscope, so no extra hardware is needed.",
  ],
  redirectUrl: "https://support.apple.com/en-us/111772",
  whyItMatters: "Back Tap adds two more customizable input gestures to iPhone without requiring any new hardware, which is especially valuable on models without an Action Button. It offers a fast way to trigger a screenshot, mute the phone, or run a Shortcut with the device still in a pocket or otherwise not fully in view. Although filed under Accessibility, it is used broadly by people who simply want more physical shortcuts, making it a genuinely useful personalization tool hidden in an unexpected menu.",
  bestPractices: [
    "Assign Double Tap to the single action used most often, since it's easier to trigger reliably than Triple Tap.",
    "Avoid assigning destructive or disruptive actions to Back Tap since accidental taps can happen while the phone is in a bag or pocket.",
    "Pair Back Tap with a Shortcut that includes a confirmation step for anything irreversible.",
  ],
  commonIssues: [
    { issue: "Back Tap doesn't register reliably.", fix: "Tap firmly and centrally on the back of the case; thick or textured cases can dampen the accelerometer signal." },
    { issue: "The gesture fires accidentally.", fix: "Reassign to a lower-risk action, or disable the gesture that keeps triggering unintentionally." },
  ],
  faqs: [
    { q: "Does Back Tap work with a case on?", a: "Yes for most cases, though very thick or padded cases may reduce reliability." },
    { q: "Can Back Tap be used while the screen is off?", a: "Yes, most Back Tap actions work regardless of screen state." },
  ],
  tipsAndTricks: [
    "Assign Triple Tap to something rarely needed, like Reachability, to reduce accidental triggers.",
    "Combine with a Shortcut menu to get more than two effective actions out of the two taps.",
  ],
  relatedSettingIds: ["ios-action-button", "ios-text-size-bold-text"],
  afterImageContent: {
    heading: "How Back Tap Works",
    paragraphs: [
      "Back Tap analyzes motion data from the iPhone's built-in accelerometer to detect the distinct vibration pattern of a tap on the back surface, distinguishing it from normal handling.",
      "Once a tap pattern is recognized as double or triple, the system runs whichever action or Shortcut has been assigned to that gesture.",
    ],
    steps: [
      "Open Settings and tap Accessibility.",
      "Tap Touch, then scroll down and tap Back Tap.",
      "Choose Double Tap or Triple Tap.",
      "Select an action or Shortcut from the list.",
      "Test by tapping firmly on the back of the iPhone.",
    ],
  },
},
{
  id: "ios-tap-raise-to-wake",
  title: "Tap to Wake & Raise to Wake",
  icon: Sun,
  platform: "ios",
  category: "personalization",
  controlType: "action",
  heading: "Control how the screen wakes without a button",
  description: "Raise to Wake turns the screen on when the iPhone is lifted, while Tap to Wake turns it on with a single tap anywhere on the display while it's lying flat.",
  details: [
    "Raise to Wake is toggled in Settings > Display & Brightness.",
    "Tap to Wake is toggled in Settings > Accessibility > Touch.",
    "Both work independently of Face ID or Touch ID and simply illuminate the Lock Screen.",
    "Disabling both means only the side button or an incoming notification will wake the display.",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/wake-iphone-iph1fd7e482f/ios",
  whyItMatters: "These two settings determine how much friction there is before a user even sees their Lock Screen, which matters for quickly checking the time or a notification without pressing anything. Raise to Wake suits people who habitually pick up their phone, while Tap to Wake suits a phone resting flat on a desk or nightstand. Because both settings also affect battery drain from frequent accidental wake-ups, being able to turn either off independently gives users control over the balance between convenience and battery longevity.",
  bestPractices: [
    "Turn off Raise to Wake if the iPhone is often jostled in a bag, since accidental wake-ups drain battery.",
    "Keep Tap to Wake on for a nightstand phone so checking the time doesn't require finding the side button in the dark.",
    "Reassess these settings after switching to a case or mount that changes how often the phone moves.",
  ],
  commonIssues: [
    { issue: "Screen turns on unexpectedly in a pocket, draining battery faster.", fix: "Turn off Raise to Wake in Settings > Display & Brightness." },
    { issue: "Tapping the screen doesn't wake it.", fix: "Enable Tap to Wake in Settings > Accessibility > Touch, since it's off by default on some setups." },
  ],
  faqs: [
    { q: "Do these settings affect Face ID?", a: "No, waking the screen and authenticating with Face ID are separate steps; these settings only control screen illumination." },
    { q: "Does StandBy mode use these settings?", a: "StandBy has its own wake behavior when charging in landscape, independent of these toggles." },
  ],
  tipsAndTricks: [
    "Use Tap to Wake for a quick glance at notifications on a desk without unlocking the phone.",
  ],
  relatedSettingIds: ["ios-standby-lock-screen", "ios-display-zoom"],
  afterImageContent: {
    heading: "How Wake Gestures Work",
    paragraphs: [
      "Raise to Wake uses the accelerometer to detect the specific motion pattern of being picked up and oriented toward a face, then briefly illuminates the Lock Screen.",
      "Tap to Wake relies on the touch controller staying in a low-power listening state even while the display is off, waking the panel the instant a tap is detected.",
    ],
    steps: [
      "Open Settings and tap Display & Brightness for Raise to Wake.",
      "Toggle Raise to Wake on or off.",
      "Open Settings, tap Accessibility, then Touch for Tap to Wake.",
      "Toggle Tap to Wake on or off.",
    ],
  },
},
{
  id: "ios-app-tracking-transparency",
  title: "App Tracking Transparency",
  icon: EyeOff,
  platform: "ios",
  category: "privacy-permissions",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Control which apps can track you across other apps",
  description: "App Tracking Transparency requires apps to ask permission before tracking activity across other companies' apps and websites for advertising or data-sharing purposes.",
  details: [
    "Found in Settings > Privacy & Security > Tracking.",
    "A master toggle, 'Allow Apps to Request to Track,' controls whether the prompt appears at all.",
    "Below the master toggle, every app that has requested tracking permission is listed individually.",
    "Denying tracking doesn't block ads outright, only the ability to link activity across other apps.",
  ],
  redirectUrl: "https://support.apple.com/en-us/102420",
  whyItMatters: "Before this feature, apps could silently share a device identifier with data brokers and ad networks to build a cross-app profile of a person's behavior without any visible consent step. App Tracking Transparency forces a clear, one-time prompt for each app, putting the choice explicitly in the user's hands rather than buried in a terms-of-service agreement. Because it's enforced at the operating system level rather than left to individual apps to self-report, it's one of the most consequential privacy protections Apple has shipped, and it directly shaped how the mobile advertising industry operates.",
  bestPractices: [
    "Review the per-app list periodically, since permissions can be changed after the fact without waiting for a new prompt.",
    "Deny tracking by default for apps with no clear reason to link data across other services.",
    "Turn off the master toggle if you'd rather apps never even ask, though some apps may then restrict certain personalized features.",
  ],
  commonIssues: [
    { issue: "An app never showed the tracking prompt.", fix: "Some apps don't request tracking at all; check Settings > Privacy & Security > Tracking to see if it's simply not listed." },
    { issue: "Ads still appear after denying tracking.", fix: "Denying tracking limits cross-app profiling, but apps can still show non-personalized ads based on context." },
    { issue: "A previously allowed app needs to be revoked.", fix: "Toggle that app off directly in the Tracking list; no need to wait for it to ask again." },
  ],
  faqs: [
    { q: "Does this affect Apple's own apps?", a: "Apple's own advertising in the App Store is controlled by a separate Apple Advertising toggle, not App Tracking Transparency." },
    { q: "Will denying tracking break an app?", a: "Core functionality shouldn't break, though some free apps may show more generic ads as a result." },
  ],
  tipsAndTricks: [
    "Turning off the master 'Allow Apps to Request to Track' toggle answers every prompt as No automatically, saving time.",
  ],
  relatedSettingIds: ["ios-privacy-permissions", "ios-app-privacy-report"],
  afterImageContent: {
    heading: "How App Tracking Transparency Works",
    paragraphs: [
      "When an app wants to link user or device data with data from other companies for tracking, iOS requires it to call Apple's framework, which triggers the standardized system prompt.",
      "The user's choice is stored per app and can be reviewed or changed anytime in the Tracking settings list without needing to reinstall the app.",
    ],
    steps: [
      "Open Settings and tap Privacy & Security.",
      "Tap Tracking.",
      "Toggle Allow Apps to Request to Track on or off.",
      "Review and adjust individual app permissions in the list below.",
    ],
  },
},
{
  id: "ios-safety-check",
  title: "Safety Check",
  icon: ShieldCheck,
  platform: "ios",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Quickly review and reset shared access for personal safety",
  description: "Safety Check lets users see and instantly stop sharing location, passwords, and app access with specific people, useful in situations like leaving a relationship where trust has broken down.",
  details: [
    "Found in Settings > Privacy & Security > Safety Check.",
    "Emergency Reset immediately stops all sharing and resets system privacy permissions in one step.",
    "Manage Sharing & Access provides a guided review of each person and app with access, one at a time.",
    "Shows shared items including location in Find My, shared albums, and Family Sharing access.",
  ],
  important: "Emergency Reset signs the device out of some accounts and resets sharing broadly; review what will be affected before using it in a non-urgent situation.",
  redirectUrl: "https://support.apple.com/guide/personal-safety/safety-check-iphone-ios-16-ips2aad835e1/web",
  whyItMatters: "Safety Check was built specifically for situations involving personal safety risk, such as domestic abuse, where someone may have been coerced into sharing their location or passwords with another person. Rather than requiring the user to hunt through a dozen separate settings screens under stress, it consolidates every sharing relationship into one guided flow that can be reviewed calmly or reset instantly in an emergency. Its existence reflects a recognition that privacy settings aren't just about advertisers, they can be a matter of physical safety.",
  bestPractices: [
    "Use Manage Sharing & Access for a calm, itemized review rather than Emergency Reset when there's no immediate danger.",
    "Follow up by changing the Apple ID password and reviewing trusted devices after any reset.",
    "Revisit Safety Check periodically after any major relationship or living-situation change.",
  ],
  commonIssues: [
    { issue: "Unsure what Emergency Reset actually changes.", fix: "Apple provides a full breakdown of affected settings on screen before confirming; read it fully before proceeding." },
    { issue: "A trusted family member lost access unexpectedly.", fix: "Re-share location or albums individually afterward, since Emergency Reset removes all sharing, not selectively." },
  ],
  faqs: [
    { q: "Does Safety Check work if the phone is being monitored remotely?", a: "Apple recommends using a separate, trusted device to research safety planning if remote monitoring by another person is suspected." },
    { q: "Is Safety Check only for domestic situations?", a: "No, it's also useful generally for anyone doing a routine privacy checkup on who has access to what." },
  ],
  tipsAndTricks: [
    "Review the full list of apps with access, not just people, since some apps request similarly sensitive permissions.",
  ],
  relatedSettingIds: ["ios-find-my", "ios-location-services", "ios-emergency-sos"],
  afterImageContent: {
    heading: "How Safety Check Works",
    paragraphs: [
      "Safety Check aggregates every sharing relationship stored across Find My, iCloud sharing, and app permissions into a single reviewable list.",
      "Emergency Reset revokes these relationships and resets certain system permissions in one action, while Manage Sharing & Access walks through each item individually for a more granular choice.",
    ],
    steps: [
      "Open Settings and tap Privacy & Security.",
      "Tap Safety Check.",
      "Choose Manage Sharing & Access for a guided review, or Emergency Reset for an immediate stop.",
      "Follow the on-screen steps to confirm each change.",
    ],
  },
},
{
  id: "ios-content-privacy-restrictions",
  title: "Content & Privacy Restrictions",
  icon: Users,
  platform: "ios",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Set parental limits on content, purchases, and privacy changes",
  description: "Content & Privacy Restrictions, part of Screen Time, lets a parent or guardian block specific apps, websites, content ratings, and purchase types, and lock down further changes to privacy settings.",
  details: [
    "Found in Settings > Screen Time > Content & Privacy Restrictions.",
    "Covers iTunes & App Store Purchases, Allowed Apps, and Content Restrictions by rating.",
    "A separate Privacy section can lock changes to Location Services, contacts, and other permissions.",
    "Protected by a separate Screen Time passcode, distinct from the device passcode.",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/block-apps-app-downloads-websites-purchases-iph3ff83f3b1/ios",
  whyItMatters: "This setting gives parents a single place to define what a child's iPhone can and can't do, from blocking explicit content and adult websites to preventing in-app purchases that could otherwise result in surprise charges. Beyond content, its Privacy section can also prevent a child from quietly disabling Location Sharing or other safety-relevant settings that a parent depends on. Because it's enforced at the system level rather than through a removable third-party app, it's harder for a tech-savvy child to bypass than many alternatives.",
  bestPractices: [
    "Set the Screen Time passcode to something different from the device passcode so it isn't easily guessed.",
    "Review content ratings periodically as a child gets older rather than setting them once and forgetting them.",
    "Lock the Privacy section for settings like Location Services if location sharing is important for safety.",
  ],
  commonIssues: [
    { issue: "Forgot the Screen Time passcode.", fix: "Reset it using Apple ID account recovery through Settings > Screen Time > Change Screen Time Passcode > Forgot Passcode." },
    { issue: "A needed app is blocked unexpectedly.", fix: "Check Allowed Apps and the age rating threshold in Content Restrictions, and adjust as needed." },
  ],
  faqs: [
    { q: "Can this be managed remotely by a parent?", a: "Yes, if set up through Family Sharing, a parent can manage a child's Screen Time and restrictions from their own device." },
    { q: "Does this block web content in every browser?", a: "Content restrictions apply system-wide to Safari and apps that use Apple's web view, limiting exposure across most browsing." },
  ],
  tipsAndTricks: [
    "Use Communication Limits alongside Content & Privacy Restrictions for a fuller parental controls setup.",
  ],
  relatedSettingIds: ["ios-sensitive-content-warning", "ios-privacy-permissions"],
  afterImageContent: {
    heading: "How Content & Privacy Restrictions Work",
    paragraphs: [
      "Once enabled, the system enforces the chosen restrictions at the operating system level, blocking matching apps, websites, or settings changes before they can occur.",
      "Because restrictions are protected by their own passcode, they remain in effect even if the device passcode is known to the child.",
    ],
    steps: [
      "Open Settings and tap Screen Time.",
      "Tap Content & Privacy Restrictions and toggle it on.",
      "Set or enter the Screen Time passcode.",
      "Configure iTunes & App Store Purchases, Allowed Apps, and Content Restrictions.",
      "Open the Privacy section to lock specific settings from being changed.",
    ],
  },
},
{
  id: "ios-sensitive-content-warning",
  title: "Sensitive Content Warning",
  icon: Lock,
  platform: "ios",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Blur nude images and videos before they're viewed",
  description: "Sensitive Content Warning automatically detects and blurs nudity in photos and videos received in Messages, AirDrop, contact posters, and FaceTime messages before they're shown, on-device and without Apple seeing the content.",
  details: [
    "Found in Settings > Privacy & Security > Sensitive Content Warning.",
    "Detection happens entirely on-device using machine learning, not by uploading content to Apple.",
    "When enabled for a child's account, a warning appears with links to resources before the content can be viewed.",
    "Adults can enable it for themselves as a personal filter, separate from any parental control.",
  ],
  redirectUrl: "https://support.apple.com/en-us/105071",
  whyItMatters: "Unsolicited explicit images are a common and distressing experience, especially for younger users, and this feature interrupts that experience with a warning before the image is even displayed rather than after the fact. Because the detection happens entirely on the device, no image data or analysis result is ever sent to Apple or any third party, preserving privacy while still providing protection. It represents a deliberate design choice to filter harmful content without the invasive tradeoff of cloud-based scanning of private messages.",
  bestPractices: [
    "Enable this for a teen's account in addition to Content & Privacy Restrictions for layered protection.",
    "Consider turning it on for personal accounts too, since it works as a general unwanted-content filter for anyone.",
    "Talk with a child about why the warning exists rather than relying on the feature alone.",
  ],
  commonIssues: [
    { issue: "An image is blurred unnecessarily.", fix: "The warning screen allows viewing anyway after an extra tap, since it's a warning rather than a hard block for adult accounts." },
    { issue: "The setting doesn't appear to be doing anything.", fix: "Confirm it's enabled separately for each relevant account, since it isn't on by default for adults." },
  ],
  faqs: [
    { q: "Does Apple see the images that get flagged?", a: "No, all detection and blurring happens on-device; nothing is uploaded or reported to Apple." },
    { q: "Does this scan photos already stored in the Photos app?", a: "It applies to content received through communication apps like Messages, not to browsing your existing photo library." },
  ],
  tipsAndTricks: [
    "Pair this with Communication Safety features for a more complete protective setup on a child's device.",
  ],
  relatedSettingIds: ["ios-content-privacy-restrictions", "ios-privacy-permissions"],
  afterImageContent: {
    heading: "How Sensitive Content Warning Works",
    paragraphs: [
      "On-device machine learning analyzes incoming images and videos in supported apps for nudity before they're rendered on screen.",
      "If flagged, the content is blurred and covered with a warning screen that requires an extra confirmation step to view.",
    ],
    steps: [
      "Open Settings and tap Privacy & Security.",
      "Tap Sensitive Content Warning.",
      "Toggle it on for the relevant account.",
      "Test by reviewing how flagged content appears in Messages.",
    ],
  },
},
{
  id: "ios-app-privacy-report",
  title: "App Privacy Report",
  icon: PieChart,
  platform: "ios",
  category: "privacy-permissions",
  controlType: "action",
  heading: "See how often apps use your permissions and reach the network",
  description: "App Privacy Report shows a detailed log of how frequently each app has used permissions like location, camera, and microphone over the past seven days, plus which domains it has contacted.",
  details: [
    "Found in Settings > Privacy & Security > App Privacy Report.",
    "Breaks down data and sensor access by app, including how many times each permission was used.",
    "Lists network domains contacted by each app and by website content within apps.",
    "Data stays on-device and can be cleared at any time.",
  ],
  redirectUrl: "https://support.apple.com/en-us/102188",
  whyItMatters: "Granting a permission once doesn't reveal how often an app actually uses it afterward, and App Privacy Report closes that visibility gap by logging real usage over time. Seeing that a rarely used app has queried location dozens of times in a week, or contacted unfamiliar third-party domains, gives users concrete evidence to decide whether to revoke access or delete the app entirely. It turns privacy permissions from a one-time decision into an ongoing, auditable record, which is a meaningfully stronger form of transparency than a static permissions list.",
  bestPractices: [
    "Check the report periodically rather than only once, since app behavior can change after updates.",
    "Pay particular attention to apps contacting many unfamiliar third-party domains.",
    "Cross-reference frequent permission use with whether the app was actually open at the time.",
  ],
  commonIssues: [
    { issue: "The report is empty or has limited data.", fix: "It only starts logging once enabled, so allow at least a day of normal usage before reviewing." },
    { issue: "An app shows unexpectedly high access frequency.", fix: "Tap into the app's detail view to see the timing, then revoke the specific permission in Settings if it seems excessive." },
  ],
  faqs: [
    { q: "Does this report get sent to Apple?", a: "No, the report is generated and stored entirely on the device." },
    { q: "Can this data be exported or shared?", a: "Yes, the report can be shared as a file, for example to share with a developer when reporting a concern." },
  ],
  tipsAndTricks: [
    "Use the domain list to spot third-party analytics or ad networks embedded in apps you didn't expect.",
  ],
  relatedSettingIds: ["ios-app-tracking-transparency", "ios-privacy-permissions"],
  afterImageContent: {
    heading: "How App Privacy Report Works",
    paragraphs: [
      "Once enabled, iOS logs every instance an app accesses a sensitive permission or contacts a network domain, building a rolling seven-day history.",
      "The report groups this activity by app and by data type, making patterns of frequent or unusual access easy to spot.",
    ],
    steps: [
      "Open Settings and tap Privacy & Security.",
      "Tap App Privacy Report and turn it on if not already enabled.",
      "Review the Data & Sensor Access and App Network Activity sections.",
      "Tap any app for a detailed history of its access.",
    ],
  },
},
{
  id: "ios-finder-itunes-backup",
  title: "Back Up via Finder or iTunes",
  icon: HardDrive,
  platform: "ios",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Create a local backup using a Mac or PC",
  description: "iPhone can be backed up to a computer's local storage using Finder on macOS or iTunes on Windows, as an alternative or supplement to iCloud Backup.",
  details: [
    "On a Mac with macOS Catalina or later, backups are managed through Finder rather than iTunes.",
    "On Windows or older macOS, backups are created through iTunes.",
    "Encrypted local backups also store saved passwords, Health data, and Wi-Fi settings, unlike standard backups.",
    "Local backups don't count against iCloud storage and can be much faster to create and restore.",
  ],
  redirectUrl: "https://support.apple.com/en-us/108796",
  whyItMatters: "A local backup provides a complete, offline copy of the iPhone that doesn't depend on internet speed or iCloud storage limits, which matters when migrating to a new device quickly or when iCloud storage is too small to hold a full backup. Enabling encryption on a local backup unlocks categories of data, like saved Wi-Fi passwords and Health records, that standard iCloud backups don't fully capture in the same way. For anyone who regularly connects their iPhone to a computer, it's a faster and more complete alternative to cloud-only backup strategies.",
  bestPractices: [
    "Enable 'Encrypt local backup' to include passwords and Health data, and to protect the backup with a password.",
    "Store the backup encryption password somewhere safe, since it cannot be recovered by Apple if lost.",
    "Keep both a local and an iCloud backup for redundancy rather than relying on just one method.",
  ],
  commonIssues: [
    { issue: "Forgot the local backup encryption password.", fix: "There is no recovery option from Apple; the only fix is to reset the option and create a new encrypted backup with a password you'll remember." },
    { issue: "Backup fails partway through.", fix: "Check available storage on the computer and try a different USB cable or port, as connection issues commonly interrupt backups." },
    { issue: "The computer isn't recognizing the iPhone.", fix: "Unlock the iPhone and tap Trust on the prompt asking whether to trust this computer." },
  ],
  faqs: [
    { q: "Can I have both iCloud and local backups?", a: "Yes, the two are independent and can be used together for extra redundancy." },
    { q: "Does a local backup include app data?", a: "Yes, most app data is included, similar to an iCloud backup." },
  ],
  tipsAndTricks: [
    "Use Wi-Fi syncing in Finder to trigger automatic local backups whenever the iPhone charges on the same network as the computer.",
  ],
  relatedSettingIds: ["ios-icloud-backup", "ios-quick-start-data-transfer"],
  afterImageContent: {
    heading: "How Computer Backups Work",
    paragraphs: [
      "Finder or iTunes copies the full contents of the iPhone, including app data, settings, and media not already stored in iCloud, to the computer's local disk.",
      "If encryption is enabled, the entire backup is protected with a password chosen by the user, and additional sensitive data categories are included that unencrypted backups omit.",
    ],
    steps: [
      "Connect the iPhone to the computer with a cable.",
      "Open Finder (or iTunes on Windows) and select the iPhone.",
      "Under Backups, choose 'Back up all of the data on your iPhone to this Mac.'",
      "Optionally check 'Encrypt local backup' and set a password.",
      "Click Back Up Now.",
    ],
  },
},
{
  id: "ios-music-podcast-downloads",
  title: "Music & Podcast Downloads",
  icon: Headphones,
  platform: "ios",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Manage offline downloads for Music and Podcasts",
  description: "Songs, albums, and podcast episodes downloaded for offline listening take up local storage separate from Photos and app data, and can be managed or automatically cleared to save space.",
  details: [
    "In the Music app, Settings > Music controls cellular download behavior and automatic downloads.",
    "In the Podcasts app, Settings > Podcasts controls episode limits and automatic deletion after playing.",
    "Downloaded items appear under Settings > General > iPhone Storage, listed by app.",
    "Individual downloaded songs or episodes can be removed without deleting them from the library entirely.",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/add-music-and-listen-offline-iph0cff2d191/ios",
  whyItMatters: "Offline music and podcast libraries can quietly consume several gigabytes of storage, especially for people who download entire albums or long-running podcast back catalogs for travel or commuting. Because downloads accumulate silently in the background with auto-download settings enabled, storage can fill up without an obvious single cause, making this a common but overlooked source of a full iPhone. Understanding and managing these settings gives back meaningful storage without losing access to content, since it typically remains available for re-download when connected.",
  bestPractices: [
    "Enable automatic episode deletion in Podcasts so listened episodes don't linger indefinitely.",
    "Limit Music's automatic downloads if storage is tight, downloading only what's needed before a trip.",
    "Check iPhone Storage periodically to see exactly how much space Music and Podcasts are using.",
  ],
  commonIssues: [
    { issue: "Downloaded songs disappeared unexpectedly.", fix: "Check if 'Optimize Storage' is enabled in Music settings, which automatically removes older downloads when space is low." },
    { issue: "Podcasts keeps re-downloading episodes already listened to.", fix: "Adjust the Podcasts settings to limit automatic downloads to only unplayed episodes." },
  ],
  faqs: [
    { q: "Does removing a download delete it from the library?", a: "No, it only removes the offline copy; the song or episode remains accessible when streaming." },
    { q: "Can downloads be limited to Wi-Fi only?", a: "Yes, both apps have a setting to restrict downloads to Wi-Fi and avoid using cellular data." },
  ],
  tipsAndTricks: [
    "Use iPhone Storage's per-app breakdown to quickly identify whether Music or Podcasts is the bigger space user.",
  ],
  relatedSettingIds: ["ios-iphone-storage", "ios-offload-unused-apps"],
  afterImageContent: {
    heading: "How Offline Downloads Are Managed",
    paragraphs: [
      "Downloaded audio files are stored locally on the device so they can play without a network connection, separate from the streaming cache.",
      "Each app applies its own rules for automatic downloading and cleanup, which can be tuned independently to balance convenience against storage use.",
    ],
    steps: [
      "Open the Music or Podcasts app.",
      "Go to its in-app Settings menu.",
      "Adjust automatic download and cleanup options.",
      "Check Settings > General > iPhone Storage to confirm space recovered.",
    ],
  },
},
{
  id: "ios-messages-keep-storage",
  title: "Keep Messages Duration",
  icon: Archive,
  platform: "ios",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Set how long Messages keeps conversation history",
  description: "The Keep Messages setting controls whether Messages retains conversations forever or automatically deletes messages, photos, and attachments after 30 days or one year, directly affecting how much storage Messages consumes.",
  details: [
    "Found in Settings > Messages > Keep Messages.",
    "Options are 30 Days, 1 Year, and Forever.",
    "Switching to a shorter duration prompts an immediate deletion of older messages matching the new limit.",
    "Attachments like photos and videos in long conversation threads are often the largest contributor to Messages storage.",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/manage-storage-on-iphone-iph47c931112/ios",
  whyItMatters: "Message threads, especially group chats with lots of photos and videos, can silently become one of the largest consumers of storage on an iPhone over months or years of use. Setting a shorter retention window automatically reclaims that space on an ongoing basis rather than requiring manual cleanup, which is particularly useful for people who don't need a permanent archive of every conversation. On the other hand, choosing Forever preserves sentimental or important message history indefinitely, so the setting is really a tradeoff between storage efficiency and long-term record-keeping.",
  bestPractices: [
    "Choose 30 Days if storage is consistently tight and older conversations aren't important to keep.",
    "Back up important conversations elsewhere before shortening the retention period, since deletion is immediate and permanent.",
    "Review individual large attachments in Settings > General > iPhone Storage > Messages before changing the global setting.",
  ],
  commonIssues: [
    { issue: "Old but important messages disappeared after changing this setting.", fix: "Once deleted by the retention policy, messages generally cannot be recovered unless they exist in a separate backup." },
    { issue: "Messages storage is still large despite a short retention period.", fix: "Attachments synced via iCloud Messages may still count elsewhere; check iCloud storage as well as local device storage." },
  ],
  faqs: [
    { q: "Does this affect messages already backed up to iCloud?", a: "If iCloud Messages sync is on, the retention policy applies across all synced devices, not just the one it was changed on." },
    { q: "Can specific conversations be exempted from auto-deletion?", a: "No, the Keep Messages setting applies globally, though individual messages can be manually pinned or saved elsewhere." },
  ],
  tipsAndTricks: [
    "Use Settings > General > iPhone Storage > Messages to review which conversations are using the most space before changing retention.",
  ],
  relatedSettingIds: ["ios-iphone-storage", "ios-icloud-storage-manage"],
  afterImageContent: {
    heading: "How Message Retention Works",
    paragraphs: [
      "Messages continuously checks the age of stored conversations against the selected retention window, automatically removing anything older once a device is idle or during routine maintenance.",
      "Attachments are removed along with their associated messages, which is typically what recovers the most storage space.",
    ],
    steps: [
      "Open Settings and tap Messages.",
      "Scroll to Keep Messages.",
      "Choose 30 Days, 1 Year, or Forever.",
      "Confirm the deletion prompt if shortening the current duration.",
    ],
  },
},
{
  id: "ios-icloud-plus-plan",
  title: "iCloud+ Storage Plan",
  icon: Cloud,
  platform: "ios",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Upgrade or change your iCloud storage subscription",
  description: "iCloud+ is Apple's paid storage subscription, offering tiers beyond the free 5 GB along with extra features like Private Relay, Hide My Email, and HomeKit Secure Video support.",
  details: [
    "Found in Settings > [your name] > iCloud > Manage Account Storage, or Settings > [your name] > Subscriptions.",
    "Paid tiers commonly include 50 GB, 200 GB, and 2 TB, with larger shared plans available.",
    "Storage can be shared with family members through Family Sharing on 200 GB plans and above.",
    "Downgrading is possible anytime, but data exceeding the new limit becomes read-only until reduced.",
  ],
  redirectUrl: "https://support.apple.com/en-us/108349",
  whyItMatters: "The free 5 GB iCloud tier fills up quickly for anyone using iCloud Photos, device backups, and app data syncing simultaneously, making an iCloud+ plan effectively necessary for most active iPhone users. Because storage is billed as a subscription rather than a one-time purchase, choosing the right tier avoids both the frustration of a perpetually full account and the waste of overpaying for unused capacity. Family Sharing on higher tiers also means one subscription can back an entire household, which is often more efficient than each person buying separate storage.",
  bestPractices: [
    "Check current usage in Manage Account Storage before choosing a tier to avoid under- or over-buying.",
    "Use Family Sharing on a 200 GB or larger plan if multiple people in a household need extra iCloud storage.",
    "Reduce data usage first, such as clearing large backups, before assuming a bigger plan is the only option.",
  ],
  commonIssues: [
    { issue: "iCloud storage is full despite a paid plan.", fix: "Review Manage Account Storage to see which category, such as backups or Photos, is consuming the most space, and clean it up or upgrade further." },
    { issue: "Data became read-only after downgrading.", fix: "Delete or move enough data to fit within the new, smaller tier to restore full write access." },
  ],
  faqs: [
    { q: "Can iCloud+ be canceled anytime?", a: "Yes, though data exceeding the free 5 GB limit will stop syncing new content until it's reduced or a paid tier is restored." },
    { q: "Does iCloud+ include features beyond storage?", a: "Yes, tiers unlock Private Relay, Hide My Email, Custom Email Domain, and HomeKit Secure Video, depending on the plan." },
  ],
  tipsAndTricks: [
    "Check whether an existing Apple One subscription already includes iCloud+ storage before buying it separately.",
  ],
  relatedSettingIds: ["ios-icloud-storage-manage", "ios-icloud-backup"],
  afterImageContent: {
    heading: "How iCloud+ Plans Work",
    paragraphs: [
      "iCloud+ is billed on a recurring subscription tied to the Apple ID, with storage shared across all of a user's devices signed into that account.",
      "Upgrading takes effect immediately, while downgrading applies once confirmed but restricts write access to any data beyond the new limit.",
    ],
    steps: [
      "Open Settings and tap your name at the top.",
      "Tap iCloud, then Manage Account Storage or Upgrade to iCloud+.",
      "Review current usage and available plans.",
      "Select a new plan and confirm payment.",
    ],
  },
},
{
  id: "ios-quick-start-data-transfer",
  title: "Quick Start Device Transfer",
  icon: Share2,
  platform: "ios",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Move data directly from an old iPhone to a new one",
  description: "Quick Start uses a direct device-to-device connection to transfer settings, apps, and data from an old iPhone to a new one during setup, without necessarily relying on an iCloud or computer backup.",
  details: [
    "Triggered automatically by placing a new iPhone near an already signed-in old iPhone during setup.",
    "Can transfer directly over a peer-to-peer connection or by first creating a temporary encrypted backup.",
    "A wired connection using a cable can speed up the transfer significantly over Wi-Fi alone.",
    "The old iPhone remains usable and signed in during most of the process.",
  ],
  redirectUrl: "https://support.apple.com/en-us/102659",
  whyItMatters: "Setting up a new iPhone from scratch and manually reinstalling every app and reconfiguring every setting can take hours; Quick Start collapses that into a largely automatic process during initial setup. Because it can transfer data directly between devices rather than requiring a full round trip through iCloud, it's often faster and doesn't require enough free iCloud storage to hold a complete backup. This makes device upgrades far less disruptive and is a major reason iPhone owners feel comfortable upgrading devices even with large photo libraries and many installed apps.",
  bestPractices: [
    "Keep both iPhones charged and near each other throughout the entire transfer process.",
    "Use a wired connection for large data libraries to significantly reduce transfer time.",
    "Keep the old iPhone signed in and connected to Wi-Fi until the transfer fully completes.",
  ],
  commonIssues: [
    { issue: "Quick Start doesn't detect the old iPhone.", fix: "Ensure Bluetooth is on for both devices and they're positioned within about a foot of each other." },
    { issue: "Transfer stalls partway through.", fix: "Confirm both devices remain on Wi-Fi and are not entering low-power or Auto-Lock states during the process." },
    { issue: "Some apps' data didn't transfer.", fix: "A few apps require signing back in manually after transfer rather than transferring session data automatically." },
  ],
  faqs: [
    { q: "Does Quick Start require an iCloud backup?", a: "No, it can transfer directly device-to-device, though it may create a temporary local backup as part of the process." },
    { q: "Can Quick Start be used later, not just during initial setup?", a: "It's primarily designed for first-time setup of a new or reset device." },
  ],
  tipsAndTricks: [
    "Start the transfer on Wi-Fi and plug in a cable if offered mid-process to speed up the remaining transfer.",
  ],
  relatedSettingIds: ["ios-icloud-backup", "ios-finder-itunes-backup"],
  afterImageContent: {
    heading: "How Quick Start Transfer Works",
    paragraphs: [
      "The two devices establish a secure, encrypted connection using Bluetooth and Wi-Fi, verified visually through an animation shown on the old device's screen.",
      "Data is then streamed directly between devices, or via a temporary encrypted backup, restoring apps, settings, and content onto the new iPhone.",
    ],
    steps: [
      "Turn on the new iPhone next to the unlocked old iPhone.",
      "On the old iPhone, tap Continue when the Quick Start prompt appears.",
      "Scan the animation shown on the new iPhone using the old iPhone's camera.",
      "Follow prompts to transfer settings and data, optionally connecting a cable.",
      "Wait for the transfer to finish before separating the two devices.",
    ],
  },
},
{
  id: "ios-model-serial-imei",
  title: "Model, Serial Number & IMEI",
  icon: Info,
  platform: "ios",
  category: "system-info",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Look up your iPhone's model, serial number, and IMEI",
  description: "Settings > General > About lists the exact model name and number, serial number, and IMEI/MEID identifiers needed for warranty checks, carrier activation, and insurance claims.",
  details: [
    "Found in Settings > General > About.",
    "IMEI (or MEID/EID for some configurations) uniquely identifies the device on cellular networks.",
    "The serial number is also printed on the original packaging and, on some models, engraved on the SIM tray.",
    "Tapping and holding on the info can copy it to the clipboard for pasting elsewhere.",
  ],
  redirectUrl: "https://support.apple.com/en-us/108037",
  whyItMatters: "These identifiers are required for nearly every official interaction involving the device, from checking AppleCare warranty status and carrier unlock eligibility to filing an insurance claim or reporting a phone stolen. Because they're unique to each physical device, they can't be substituted with an Apple ID or phone number, which makes knowing where to find them quickly valuable in time-sensitive situations like loss or theft. Having this information also lets a user independently verify a device's model and specifications when buying or selling a used iPhone.",
  bestPractices: [
    "Record the serial number and IMEI somewhere separate from the phone itself, like a password manager, in case the device is lost or stolen.",
    "Cross-check the serial number against Apple's coverage checker before assuming AppleCare status.",
    "Use the exact model number, not just the model name, when ordering official Apple repair parts or accessories.",
  ],
  commonIssues: [
    { issue: "Carrier or insurer asks for IMEI but the phone is missing.", fix: "Check the original packaging box, a prior purchase receipt, or an Apple ID device list from Settings on another signed-in device." },
    { issue: "Model number doesn't match the expected iPhone name.", fix: "Apple uses region- and carrier-specific model numbers; look up the number on Apple's identification page to confirm it matches the expected model." },
  ],
  faqs: [
    { q: "Where else can IMEI be found besides Settings?", a: "It's also visible on the SIM tray of many models, the original box, and by dialing *#06# on the Phone app." },
    { q: "Is the serial number the same as the IMEI?", a: "No, they are different identifiers; the serial number identifies the specific unit, while IMEI identifies it on cellular networks." },
  ],
  tipsAndTricks: [
    "Long-press any value on the About screen to quickly copy it without retyping.",
  ],
  relatedSettingIds: ["ios-general-about", "ios-carrier-info"],
  afterImageContent: {
    heading: "How Device Identifiers Work",
    paragraphs: [
      "The serial number is assigned during manufacturing and uniquely identifies the physical unit for warranty and service purposes.",
      "The IMEI or MEID is a telecom industry standard identifier used by carriers to recognize and authorize a device on their network.",
    ],
    steps: [
      "Open Settings and tap General.",
      "Tap About.",
      "Scroll to view Serial Number, IMEI, and related fields.",
      "Tap and hold any value to copy it.",
    ],
  },
},
{
  id: "ios-certificate-trust-settings",
  title: "Certificate Trust Settings",
  icon: KeyRound,
  platform: "ios",
  category: "system-info",
  controlType: "action",
  heading: "Manage trust for manually installed certificates",
  description: "Certificate Trust Settings lets users enable or disable full trust for root certificates that were manually installed via a configuration profile, separate from Apple's built-in trusted certificate list.",
  details: [
    "Found in Settings > General > About > Certificate Trust Settings.",
    "Only appears once at least one certificate profile has been manually installed.",
    "Toggling trust for a certificate allows it to validate secure websites and connections as if it were a built-in trusted authority.",
    "Distinct from viewing or removing the underlying profile itself, which is managed separately.",
  ],
  redirectUrl: "https://support.apple.com/en-us/102390",
  whyItMatters: "Manually trusted root certificates are commonly required for connecting to corporate networks, school Wi-Fi with content filtering, or testing tools that inspect network traffic, but a fully trusted malicious certificate could intercept supposedly secure traffic without obvious warning signs. This settings screen is the explicit, visible checkpoint where a user (or an IT administrator) grants that elevated trust, rather than it happening silently as part of profile installation. Understanding this screen matters for anyone troubleshooting unexpected certificate warnings or verifying that a device hasn't been configured to trust an unfamiliar authority.",
  bestPractices: [
    "Only enable full trust for certificates from a source you explicitly recognize, like your employer's IT department.",
    "Periodically review this list, since installed profiles can otherwise be forgotten over time.",
    "Remove the entire configuration profile, not just the trust toggle, once a certificate is no longer needed.",
  ],
  commonIssues: [
    { issue: "A website shows a certificate warning unexpectedly.", fix: "Check whether an installed profile's certificate was recently disabled or expired, which can cause secure sites to fail validation." },
    { issue: "This screen doesn't appear in Settings.", fix: "It only shows up after at least one certificate has been manually installed via a profile; it isn't visible on a device with none installed." },
  ],
  faqs: [
    { q: "Does this affect Apple's default trusted certificates?", a: "No, it only concerns certificates added manually via profiles, not the built-in list Apple maintains and updates automatically." },
    { q: "Can enabling trust here be dangerous?", a: "Yes, a fully trusted malicious certificate could intercept encrypted traffic, so only trust certificates from sources you're confident in." },
  ],
  tipsAndTricks: [
    "Check Settings > General > VPN & Device Management to see and remove the profile a certificate came from.",
  ],
  relatedSettingIds: ["ios-general-about", "ios-vpn-device-management"],
  afterImageContent: {
    heading: "How Certificate Trust Works",
    paragraphs: [
      "Installing a configuration profile can add a root certificate to the device, but iOS keeps it untrusted for secure connections by default until explicitly enabled here.",
      "Toggling a certificate on grants it the same validation authority as Apple's built-in trusted roots, allowing it to vouch for the identity of servers during secure connections.",
    ],
    steps: [
      "Open Settings and tap General.",
      "Tap About, then scroll to Certificate Trust Settings.",
      "Review the list of manually installed certificates.",
      "Toggle full trust on or off for each certificate as needed.",
    ],
  },
},
{
  id: "ios-vpn-device-management",
  title: "VPN & Device Management",
  icon: Router,
  platform: "ios",
  category: "system-info",
  controlType: "action",
  heading: "View installed VPN profiles and MDM enrollment",
  description: "This screen lists any VPN configuration profiles and shows whether the iPhone is enrolled in a Mobile Device Management (MDM) system, typically used by employers or schools to manage company- or school-owned devices.",
  details: [
    "Found in Settings > General > VPN & Device Management.",
    "Shows installed configuration profiles, including VPN, email, and Wi-Fi settings pushed by an organization.",
    "If enrolled in MDM, displays the managing organization's name and what it can control or view.",
    "Only appears with content once a profile or MDM enrollment exists on the device.",
  ],
  redirectUrl: "https://support.apple.com/guide/mdm/mdmb78836926/web",
  whyItMatters: "For anyone using a work or school-issued iPhone, or a personal iPhone enrolled in a company's Bring Your Own Device program, this screen is the clearest window into what an outside organization can actually see and control on the device. Understanding what MDM enrollment grants, such as remote wipe capability or app restrictions, versus what it typically doesn't, like reading personal messages, helps set realistic expectations about workplace device privacy. It's also the place to remove old VPN or configuration profiles left behind after changing jobs or schools.",
  bestPractices: [
    "Review this screen after starting or leaving a job to confirm whether an old management profile still exists.",
    "Ask your IT department directly what an MDM profile can access rather than assuming based on rumor.",
    "Remove personal VPN profiles here once they're no longer needed to reduce unnecessary configuration.",
  ],
  commonIssues: [
    { issue: "Certain apps or settings are unexpectedly restricted.", fix: "Check this screen for an MDM profile that may be enforcing restrictions set by an organization." },
    { issue: "A VPN profile no longer connects.", fix: "Remove the outdated profile here and reinstall a current one from the VPN provider or IT department." },
  ],
  faqs: [
    { q: "Can an employer see personal photos or messages through MDM?", a: "Standard MDM configurations typically cannot access personal content like photos or messages on a personally owned device, though specific capabilities depend on the enrollment type and organization's policies." },
    { q: "How is an MDM profile removed?", a: "Personally installed profiles can usually be removed here, though organization-installed ones on managed devices may require IT to remove them remotely." },
  ],
  tipsAndTricks: [
    "Tap into a profile's details to see exactly which settings and permissions it configures before deciding whether to remove it.",
  ],
  relatedSettingIds: ["ios-certificate-trust-settings", "ios-general-about"],
  afterImageContent: {
    heading: "How VPN & Device Management Works",
    paragraphs: [
      "Configuration profiles bundle settings such as VPN credentials, Wi-Fi passwords, or security policies, and can be installed manually or pushed automatically by an MDM system.",
      "MDM enrollment establishes an ongoing management relationship, allowing an organization to enforce policies or remotely manage aspects of the device depending on the enrollment type.",
    ],
    steps: [
      "Open Settings and tap General.",
      "Tap VPN & Device Management.",
      "Review any listed VPN configurations or management profiles.",
      "Tap a profile for details, or remove it if no longer needed.",
    ],
  },
},
{
  id: "ios-device-name",
  title: "iPhone Device Name",
  icon: FileText,
  platform: "ios",
  category: "system-info",
  controlType: "action",
  heading: "Change how your iPhone identifies itself to other devices",
  description: "The device name is what appears to others over AirDrop, Bluetooth pairing, and on the local Wi-Fi network, and can be personalized separately from the Apple ID name.",
  details: [
    "Found in Settings > General > About > Name.",
    "Defaults to a name based on the Apple ID or the phrase 'iPhone' during initial setup.",
    "Visible to nearby people during AirDrop transfers and to other devices during Bluetooth pairing.",
    "Also appears in Wi-Fi router device lists and in Find My for locating this specific device among others on the account.",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/change-the-name-of-your-iphone-iphf256af64f/ios",
  whyItMatters: "A generic device name like 'iPhone' becomes ambiguous the moment a household or workplace has more than one, making it hard to tell devices apart in AirDrop sheets, paired Bluetooth lists, or Find My. A distinctive but non-identifying name, avoiding a full real name for strangers to see over AirDrop, strikes a balance between usability among people you know and privacy from strangers nearby. It's a small setting, but one that affects a surprisingly wide range of everyday interactions across Apple's ecosystem.",
  bestPractices: [
    "Choose a name that distinguishes the device without including a full real name, especially for AirDrop use in public.",
    "Update the name after buying a used iPhone so it doesn't still reflect the previous owner's naming choice.",
    "Keep names consistent across a household's devices, like 'Alex's iPhone,' to make sharing and pairing easier to navigate.",
  ],
  commonIssues: [
    { issue: "The old owner's name still shows after a factory reset.", fix: "Rename the device manually in Settings > General > About > Name after setup, since a reset doesn't always change this." },
    { issue: "Multiple devices show as just 'iPhone' when sharing.", fix: "Rename each device individually to something unique to avoid confusion during AirDrop or Bluetooth pairing." },
  ],
  faqs: [
    { q: "Does changing the device name affect the Apple ID?", a: "No, they are independent; changing one doesn't change the other." },
    { q: "Is the device name visible to everyone nearby at all times?", a: "It's only broadcast during active discovery processes like an open AirDrop sheet or Bluetooth pairing mode, not continuously." },
  ],
  tipsAndTricks: [
    "Renaming can also be done through the Files app or Finder/iTunes when the device is connected to a computer.",
  ],
  relatedSettingIds: ["ios-general-about", "ios-control-center"],
  afterImageContent: {
    heading: "How Device Naming Works",
    paragraphs: [
      "The device name is stored locally and broadcast during discovery protocols such as AirDrop, Bluetooth, and Wi-Fi network browsing so nearby devices can identify it.",
      "Changing it takes effect immediately across all services that reference the name, without requiring a restart.",
    ],
    steps: [
      "Open Settings and tap General.",
      "Tap About, then tap Name.",
      "Clear the existing name and type a new one.",
      "Tap Done to save.",
    ],
  },
},
{
  id: "ios-rapid-security-response",
  title: "Rapid Security Responses",
  icon: ShieldCheck,
  platform: "ios",
  category: "system-updates",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Control fast-turnaround security patches between iOS versions",
  description: "Rapid Security Responses deliver urgent security fixes between full iOS releases, installing quickly and, unlike major updates, without requiring a full device restart in most cases.",
  details: [
    "Controlled by 'Security Responses & System Files' under Settings > General > Software Update > Automatic Updates.",
    "Applies narrowly targeted security patches rather than new features or a full OS version change.",
    "Can be removed individually from Settings > General > About > iOS Version if it causes a compatibility problem.",
    "Appears with a letter suffix on the iOS version number, such as appending a letter after the version.",
  ],
  redirectUrl: "https://support.apple.com/en-us/102657",
  whyItMatters: "Traditional iOS updates bundle security fixes together with new features and can take time to develop, test, and distribute, leaving a window where a critical vulnerability might remain unpatched. Rapid Security Responses were created specifically to close that gap, shipping urgent fixes, particularly for actively exploited vulnerabilities, in a lightweight package that installs faster and doesn't require the same lengthy download and restart as a full OS update. Keeping this setting enabled meaningfully reduces exposure time to known security threats compared to waiting for the next scheduled major or minor iOS release.",
  bestPractices: [
    "Leave Security Responses & System Files enabled unless a specific compatibility issue arises.",
    "Install prompted Rapid Security Responses promptly, since they typically address actively exploited vulnerabilities.",
    "If an issue does occur after installing one, remove just that response rather than disabling future ones entirely.",
  ],
  commonIssues: [
    { issue: "A website or app broke after a Rapid Security Response installed.", fix: "Go to Settings > General > About > iOS Version and tap Remove Security Response, then check for a proper fix in a later update." },
    { issue: "The toggle for Security Responses & System Files is missing.", fix: "It requires Automatic Updates to be enabled first, since it's a sub-option beneath it." },
  ],
  faqs: [
    { q: "Do Rapid Security Responses require a restart?", a: "Most install without a full restart, though some may still prompt one depending on the fix." },
    { q: "Are these the same as a full iOS update?", a: "No, they're smaller, faster, security-focused patches distinct from full numbered iOS releases." },
  ],
  tipsAndTricks: [
    "Check Settings > General > About > iOS Version to see the exact letter-suffixed build currently installed.",
  ],
  updateFrequency: "Released as needed, outside the regular iOS update schedule",
  relatedSettingIds: ["ios-software-update", "ios-automatic-updates"],
  afterImageContent: {
    heading: "How Rapid Security Responses Work",
    paragraphs: [
      "Apple develops these responses independently of full iOS releases, targeting specific, urgent vulnerabilities that need to reach devices faster than the standard update cycle allows.",
      "Because they're smaller and more narrowly scoped than full updates, they can be installed and, if necessary, individually removed without affecting the underlying iOS version.",
    ],
    steps: [
      "Open Settings and tap General.",
      "Tap Software Update, then Automatic Updates.",
      "Confirm Security Responses & System Files is toggled on.",
      "Install any prompted response when it appears.",
    ],
  },
},
{
  id: "ios-carrier-settings-update",
  title: "Carrier Settings Update",
  icon: Signal,
  platform: "ios",
  category: "system-updates",
  controlType: "action",
  heading: "Update carrier network configuration separately from iOS",
  description: "Carrier Settings Updates are small packages issued by a mobile carrier to improve network performance, enable new features like VoLTE or Wi-Fi Calling, and fix connectivity bugs, independent of iOS software updates.",
  details: [
    "Checked automatically by inserting a SIM or connecting to the carrier's network, and can be checked manually in Settings > General > About.",
    "If an update is available, a prompt appears offering to install it.",
    "Distinct from an iOS software update, and typically much smaller in size.",
    "Occurs each time a new SIM from a different carrier is inserted.",
  ],
  redirectUrl: "https://support.apple.com/en-us/109324",
  whyItMatters: "Carriers frequently adjust their networks, and a carrier settings update ensures the iPhone's radio configuration stays aligned with those changes, which can directly affect call quality, data speeds, and access to features like Wi-Fi Calling or 5G in specific areas. Because this is managed by the carrier rather than Apple, it happens on its own schedule outside of major iOS releases, meaning a fully updated iOS version doesn't guarantee the latest carrier settings are installed. Checking for it manually is a quick, often-overlooked troubleshooting step when experiencing unexplained cellular connectivity issues.",
  bestPractices: [
    "Check for a carrier settings update whenever experiencing unusual signal or call quality problems.",
    "Always check after switching to a new SIM card or carrier, since the update is carrier-specific.",
    "Restart the iPhone after installing a carrier settings update if a feature still doesn't seem to work.",
  ],
  commonIssues: [
    { issue: "No update prompt appears despite known carrier network changes.", fix: "Ensure the device has an active SIM, cellular signal, and is connected to Wi-Fi, then check Settings > General > About manually." },
    { issue: "Wi-Fi Calling or VoLTE isn't available after switching carriers.", fix: "Confirm a carrier settings update has been installed, since these features often depend on it." },
  ],
  faqs: [
    { q: "Is a carrier settings update the same as an iOS update?", a: "No, it's a separate, smaller package specific to cellular network configuration, managed by the carrier rather than Apple." },
    { q: "Does this update cost anything?", a: "No, carrier settings updates are free and typically small enough to download over cellular data." },
  ],
  tipsAndTricks: [
    "If in doubt, simply reopening Settings > General > About triggers a fresh check for an available update.",
  ],
  updateFrequency: "As released by the carrier, checked automatically or manually",
  relatedSettingIds: ["ios-carrier-info", "ios-software-update"],
  afterImageContent: {
    heading: "How Carrier Settings Updates Work",
    paragraphs: [
      "Carriers publish small configuration packages that adjust network parameters, feature flags, and APNs used by the iPhone's cellular radio.",
      "The device checks for these automatically under normal network conditions and prompts the user to install when one is found.",
    ],
    steps: [
      "Ensure the iPhone has cellular signal and a Wi-Fi or cellular data connection.",
      "Open Settings and tap General.",
      "Tap About and wait briefly for an update prompt to appear if one is available.",
      "Tap Update if prompted, and restart the device if recommended.",
    ],
  },
},
{
  id: "ios-app-store-auto-app-updates",
  title: "App Store Automatic App Updates",
  icon: Store,
  platform: "ios",
  category: "system-updates",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Control whether apps update themselves automatically",
  description: "Separate from iOS software updates, the App Store has its own setting for automatically installing new versions of installed apps as developers release them.",
  details: [
    "Found in Settings > App Store > App Updates toggle.",
    "When enabled, apps update quietly in the background, typically over Wi-Fi.",
    "When disabled, updates must be installed manually from the Updates tab in the App Store app.",
    "Individual app updates can still be paused or managed even with the global toggle on.",
  ],
  redirectUrl: "https://support.apple.com/guide/iphone/update-apps-iph98709f167/ios",
  whyItMatters: "App-level updates are released far more frequently than iOS itself, often multiple times a month across a typical app library, so this setting has a much more constant effect on the device than iOS update settings. Automatic updates keep apps patched against bugs and security issues without any effort, but they can also change an app's interface or behavior unexpectedly right before it's needed for something important. Understanding this setting, distinct from the iOS-level Automatic Updates setting, is key to controlling how much the apps on the phone change on their own over time.",
  bestPractices: [
    "Keep automatic app updates enabled for security-sensitive apps like banking or password managers.",
    "Disable it temporarily before a big event, like travel, if a critical app's stability shouldn't change unexpectedly.",
    "Periodically check the Updates tab manually even with auto-updates on, since not every update installs immediately.",
  ],
  commonIssues: [
    { issue: "An app changed its interface unexpectedly.", fix: "Check the App Store's Updates or Purchase History to confirm an automatic update installed, and review the app's release notes." },
    { issue: "Updates aren't installing automatically despite the toggle being on.", fix: "Confirm Wi-Fi is connected and Low Power Mode isn't restricting background activity, since both can delay automatic updates." },
  ],
  faqs: [
    { q: "Is this the same as the iOS Automatic Updates setting?", a: "No, this controls individual app updates within the App Store, while iOS Automatic Updates controls operating system updates." },
    { q: "Can automatic updates use cellular data?", a: "Yes, if allowed under Settings > App Store > Cellular Data or Wi-Fi & Cellular Data settings." },
  ],
  tipsAndTricks: [
    "Long-press the App Store icon and check the Updates section anytime for a manual, on-demand list.",
  ],
  relatedSettingIds: ["ios-automatic-updates", "ios-offload-unused-apps"],
  afterImageContent: {
    heading: "How App Store Auto-Updates Work",
    paragraphs: [
      "The App Store periodically checks each installed app's developer-published version against the version installed on the device.",
      "When a newer version is found and automatic updates are enabled, it queues and installs the update in the background, generally prioritizing Wi-Fi to limit cellular data use.",
    ],
    steps: [
      "Open Settings and tap App Store.",
      "Toggle App Updates on or off.",
      "Open the App Store app and check the Updates section to review or manually trigger pending updates.",
    ],
  },
},
{
  id: "ios-update-via-finder-computer",
  title: "Update iPhone via Computer",
  icon: RefreshCw,
  platform: "ios",
  category: "system-updates",
  controlType: "action",
  heading: "Install an iOS update using Finder or iTunes",
  description: "As an alternative to updating over the air, iPhone can be updated by connecting it to a Mac with Finder or a Windows PC with iTunes, which downloads and installs the update via a wired or Wi-Fi connection to the computer.",
  details: [
    "Requires a cable connection or previously enabled Wi-Fi syncing with the computer.",
    "Useful when on-device storage is too limited to download an update directly.",
    "The computer downloads the update file separately, which can be faster on a fast broadband connection.",
    "Available for both minor and major iOS version updates, as well as full restores.",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/update-back-up-and-restore-your-device-mchla3c8ed03/mac",
  whyItMatters: "Not everyone has enough free storage on their iPhone to download a large iOS update directly, and updating through a computer avoids that limitation since the update file is staged on the computer's storage instead. It's also a reliable fallback when a device is stuck in a boot loop or won't update normally over Wi-Fi, since Finder and iTunes can push updates or full restores even when the device isn't fully responsive. For IT departments and power users managing multiple devices, it also offers a more controlled and scriptable update process than waiting for each device to update on its own.",
  bestPractices: [
    "Back up the iPhone before updating through a computer, especially if attempting a restore rather than just an update.",
    "Use a reliable cable and USB port to avoid an interrupted transfer mid-update.",
    "Ensure Finder or iTunes is fully up to date before attempting to update an iPhone through it.",
  ],
  commonIssues: [
    { issue: "The computer doesn't recognize the connected iPhone.", fix: "Unlock the iPhone, tap Trust on the prompt, and try a different cable or USB port if it still isn't detected." },
    { issue: "The update download fails or times out.", fix: "Check the computer's internet connection and available disk space, then retry." },
  ],
  faqs: [
    { q: "Does updating via computer erase the iPhone?", a: "A standard Update keeps data intact; only choosing Restore erases the device." },
    { q: "Is this faster than updating over Wi-Fi directly on the iPhone?", a: "It can be, especially with a fast broadband connection or when on-device storage is limited." },
  ],
  tipsAndTricks: [
    "Enable Wi-Fi syncing in Finder in advance so future updates don't require a cable at all.",
  ],
  relatedSettingIds: ["ios-icloud-backup", "ios-finder-itunes-backup"],
  afterImageContent: {
    heading: "How Computer-Based Updates Work",
    paragraphs: [
      "Finder or iTunes downloads the official update package from Apple's servers directly to the computer, verifying its integrity before transferring it to the connected iPhone.",
      "The iPhone then installs the update using the same process as an over-the-air update, restarting once complete.",
    ],
    steps: [
      "Connect the iPhone to the computer with a cable.",
      "Open Finder (or iTunes) and select the iPhone.",
      "Click General, then Check for Update.",
      "Click Update and follow the on-screen prompts.",
    ],
  },
},
{
  id: "ios-security-only-updates-legacy-devices",
  title: "Security-Only Updates for Older Devices",
  icon: History,
  platform: "ios",
  category: "system-updates",
  controlType: "action",
  heading: "Understand updates for iPhones that can't run the latest iOS",
  description: "Apple sometimes continues issuing security-focused updates for older iPhone models that can no longer run the newest major iOS version, keeping them protected without adding new features.",
  details: [
    "Appears in Settings > General > Software Update as an update to the last major iOS version supported by that specific device.",
    "Does not include new features introduced in the current major iOS release for newer devices.",
    "Availability and duration of security-only support varies by model and is decided by Apple on a case-by-case basis.",
    "Distinct from Rapid Security Responses, which target devices already on the newest iOS version.",
  ],
  redirectUrl: "https://support.apple.com/en-us/126776",
  whyItMatters: "As iPhone hardware ages, it eventually can't support the processing or feature requirements of the newest iOS release, but that doesn't mean the device should be left permanently exposed to newly discovered vulnerabilities. Apple has periodically extended security-only patches to older, otherwise unsupported major iOS versions, giving owners of legacy devices a meaningful way to stay protected against known threats even without new features. Understanding that a device showing 'no updates available' isn't necessarily fully secure, and checking for these legacy patches specifically, matters for anyone continuing to use an older iPhone.",
  bestPractices: [
    "Install any available security-only update promptly, even on an older device kept for basic use.",
    "Check Settings > General > Software Update periodically, since legacy support isn't guaranteed or always obvious.",
    "Consider replacing a device that's stopped receiving even security-only updates, since it will accumulate unpatched vulnerabilities over time.",
  ],
  commonIssues: [
    { issue: "An old iPhone shows no updates but seems out of date.", fix: "Confirm whether Apple has ended all support for that specific model, which happens eventually even for security-only patches." },
    { issue: "Unsure whether an installed update included security fixes.", fix: "Check the update's release notes in Settings > General > Software Update or Apple's security release notes page." },
  ],
  faqs: [
    { q: "Do all older iPhones get security-only updates?", a: "No, Apple decides this on a case-by-case basis and it isn't guaranteed for every unsupported model indefinitely." },
    { q: "Are security-only updates the same size as full iOS updates?", a: "They're typically smaller since they don't include new features, though size varies by the specific fixes included." },
  ],
  tipsAndTricks: [
    "Check Settings > General > About > iOS Version after installing to confirm exactly what was applied.",
  ],
  relatedSettingIds: ["ios-software-update", "ios-update-history"],
  afterImageContent: {
    heading: "How Legacy Security Updates Work",
    paragraphs: [
      "When a critical vulnerability affects a wide range of devices, Apple can choose to backport a fix to the last major iOS version still supported by older hardware, rather than leaving those devices unpatched.",
      "These updates install through the same Software Update mechanism as any other iOS update, just targeting an earlier OS branch appropriate for the device.",
    ],
    steps: [
      "Open Settings and tap General.",
      "Tap Software Update.",
      "Review any available update, checking whether it's a full version or a security-only patch.",
      "Tap Download and Install if available.",
    ],
  },
},
{
  id: "ios-force-restart-shut-down",
  title: "Force Restart & Shut Down",
  icon: RotateCcw,
  platform: "ios",
  category: "troubleshooting-diagnostics",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Manually restart or power off an unresponsive iPhone",
  description: "A force restart or full shut down can resolve a frozen or unresponsive iPhone using a physical button sequence, without needing to reach Settings at all.",
  details: [
    "Shut Down can also be triggered in Settings > General > Shut Down as a software-based alternative.",
    "Force restart button sequences differ by model, generally involving the volume and side buttons.",
    "A force restart does not erase any data; it simply power-cycles the device.",
    "Shutting down fully, then powering back on, can resolve issues a force restart alone doesn't fix.",
  ],
  redirectUrl: "https://support.apple.com/en-us/118259",
  whyItMatters: "When an iPhone freezes, becomes unresponsive to touch, or an app appears permanently stuck, a force restart is often the fastest and safest first troubleshooting step before considering anything more drastic like a reset or restore. Because the exact button combination varies across iPhone generations, from a single held button on older models to a specific press-and-release sequence on Face ID models, knowing the correct sequence for a specific device avoids fumbling during a stressful moment. It's a completely data-safe action, making it the natural starting point before escalating to Recovery Mode or DFU Mode.",
  bestPractices: [
    "Try a standard restart from Settings or the power-off slider first, reserving a force restart for when the device is truly unresponsive.",
    "Learn the specific button sequence for your iPhone model in advance, since it differs from other models.",
    "Escalate to Recovery Mode only if a force restart doesn't resolve the freeze or if the device won't turn on at all.",
  ],
  commonIssues: [
    { issue: "Not sure which button sequence applies to a specific iPhone.", fix: "Face ID models use a quick press of volume up, then volume down, then a held press of the side button; models with a Home button typically hold Home and the side/top button together." },
    { issue: "The screen stays black even after a force restart.", fix: "Plug the iPhone into power for at least 30 minutes in case the battery was fully depleted, then try again." },
  ],
  faqs: [
    { q: "Does a force restart delete anything?", a: "No, it's equivalent to a hard power cycle and doesn't affect any stored data." },
    { q: "Is force restarting a phone regularly bad for it?", a: "No, it's a normal recovery action, though it shouldn't be needed frequently under normal circumstances." },
  ],
  tipsAndTricks: [
    "If Settings is accessible, a standard Shut Down and manual power-on is a gentler equivalent worth trying first.",
  ],
  relatedSettingIds: ["ios-recovery-mode-restore", "ios-dfu-mode-restore"],
  afterImageContent: {
    heading: "How Force Restart Works",
    paragraphs: [
      "A force restart interrupts the device's current state entirely at the hardware level and reboots the operating system from scratch, similar to unplugging and replugging a computer.",
      "Because it doesn't touch stored data or software installation, it's considered a safe first troubleshooting step for freezes or unresponsive apps.",
    ],
    steps: [
      "On Face ID models, quickly press and release Volume Up, then Volume Down.",
      "Press and hold the Side button until the Apple logo appears.",
      "Release the button and wait for the device to fully restart.",
      "If it still won't respond, connect it to power and try again after 30 minutes.",
    ],
  },
},
{
  id: "ios-erase-all-content-settings",
  title: "Erase All Content and Settings",
  icon: HardDrive,
  platform: "ios",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Fully wipe the iPhone back to factory condition",
  description: "Erase All Content and Settings permanently deletes everything on the iPhone, including apps, photos, settings, and accounts, restoring it to an out-of-box state, distinct from resetting individual settings categories.",
  details: [
    "Found in Settings > General > Transfer or Reset iPhone > Erase All Content and Settings.",
    "Requires the device passcode and Apple ID password to confirm before erasing.",
    "Automatically removes the device from Find My and deactivates Activation Lock upon completion when signed out properly.",
    "Distinct from Reset options, which reset only specific categories like network or keyboard settings without deleting personal data.",
  ],
  important: "This action is irreversible without a prior backup; ensure an up-to-date iCloud or computer backup exists before proceeding.",
  redirectUrl: "https://support.apple.com/guide/iphone/erase-all-content-and-settings-iph7a2a9399b/ios",
  whyItMatters: "This is the appropriate step before selling, trading in, or giving away an iPhone, since it removes every trace of personal data, accounts, and files rather than just resetting configuration preferences. It's also a legitimate troubleshooting step of last resort for persistent software issues that survive a restart, reset, or even a reinstalled update. Because it's irreversible without a backup, understanding exactly what it does, and how it differs from the narrower Reset options, prevents accidental data loss from choosing the wrong menu item.",
  bestPractices: [
    "Create a fresh backup immediately before erasing, whether to iCloud or a computer.",
    "Sign out of Find My and the Apple ID beforehand if planning to transfer the device to someone else, to fully remove Activation Lock.",
    "Only use this for a full wipe; use the narrower Reset options if only specific settings need to be cleared.",
  ],
  commonIssues: [
    { issue: "The next owner can't activate the iPhone after receiving it.", fix: "The previous owner needs to remove it from their Find My device list, or the erase process needs to be completed with full Apple ID sign-out beforehand." },
    { issue: "Erasing seems stuck or is taking a long time.", fix: "Keep the device connected to power and Wi-Fi and avoid interrupting it, since a full erase of large storage can take some time." },
  ],
  faqs: [
    { q: "Does this remove the device from Find My automatically?", a: "Yes, when the process completes normally while properly signed into Apple ID, it also disables Activation Lock." },
    { q: "Can data be recovered after this is used?", a: "Generally no, without a backup made beforehand; the erase process is designed to be unrecoverable." },
  ],
  tipsAndTricks: [
    "Check Settings > General > iPhone Storage beforehand to make sure nothing important is unsynced before erasing.",
  ],
  relatedSettingIds: ["ios-reset-iphone", "ios-icloud-backup"],
  afterImageContent: {
    heading: "How Erase All Content and Settings Works",
    paragraphs: [
      "The erase process cryptographically discards the encryption keys protecting stored data, rendering all content on the device permanently unreadable, then reinstalls a clean version of iOS.",
      "As part of the process, the device is signed out of iCloud and Find My, removing Activation Lock so it can be set up by a new user.",
    ],
    steps: [
      "Open Settings and tap General.",
      "Tap Transfer or Reset iPhone.",
      "Tap Erase All Content and Settings.",
      "Enter the device passcode and Apple ID password when prompted.",
      "Confirm to begin the erase process.",
    ],
  },
},
{
  id: "ios-dfu-mode-restore",
  title: "DFU Mode Restore",
  icon: FlaskConical,
  platform: "ios",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Use the deepest-level restore mode for severe issues",
  description: "Device Firmware Update (DFU) Mode is the lowest-level restore state available on iPhone, used when the device won't respond to a force restart or standard Recovery Mode, typically requiring a computer with Finder or iTunes.",
  details: [
    "Entered through a specific button sequence that varies by model, performed while connected to a computer.",
    "Unlike Recovery Mode, DFU Mode loads no part of iOS at all, only the lowest-level boot firmware.",
    "The screen stays completely black in true DFU Mode, unlike Recovery Mode's connect-to-computer screen.",
    "Typically used by advanced troubleshooting steps, jailbreak tooling, or Apple Support-guided repairs.",
  ],
  important: "DFU Mode is an advanced recovery tool; entering it incorrectly usually just requires retrying, but a restore performed in this mode will erase the device.",
  redirectUrl: "https://support.apple.com/en-us/118106",
  whyItMatters: "DFU Mode exists as the last resort below Recovery Mode, capable of restoring a device even when it's in a state too broken for the normal recovery screen to load. It's the mode Apple Support or authorized technicians often use when diagnosing whether a persistent problem is software-related or points to a hardware failure, since a device that still responds to DFU Mode but won't restore properly may indicate a hardware issue. For everyday troubleshooting it's rarely needed, but knowing it exists, and that it's distinct from a simpler force restart or Recovery Mode restore, helps set realistic expectations when a device is severely unresponsive.",
  bestPractices: [
    "Try a force restart and Recovery Mode restore first, reserving DFU Mode for when both have failed.",
    "Back up the device beforehand if at all possible, since a DFU restore erases all data.",
    "Follow exact timing for the button sequence carefully, since entering DFU Mode is more precise than Recovery Mode.",
  ],
  commonIssues: [
    { issue: "The screen shows the Apple logo instead of staying black.", fix: "The button sequence was held too long; release and start over, aiming for a fully black screen before Finder or iTunes detects the device." },
    { issue: "The computer doesn't detect the device in DFU Mode.", fix: "Try a different cable or USB port, and confirm Finder or iTunes is fully updated." },
  ],
  faqs: [
    { q: "Is DFU Mode the same as Recovery Mode?", a: "No, DFU Mode is a lower-level state that loads no iOS software at all, while Recovery Mode still loads a minimal recovery interface." },
    { q: "Does entering DFU Mode itself erase data?", a: "No, entering the mode alone doesn't erase anything; only choosing to restore while in that mode does." },
  ],
  tipsAndTricks: [
    "If the Apple logo or a 'connect to computer' image appears, DFU Mode wasn't entered correctly and the sequence should be repeated.",
  ],
  relatedSettingIds: ["ios-recovery-mode-restore", "ios-force-restart-shut-down"],
  afterImageContent: {
    heading: "How DFU Mode Works",
    paragraphs: [
      "DFU Mode allows the device to communicate with a computer at the lowest firmware level, before any part of iOS itself has loaded, which is why it can recover a device that Recovery Mode cannot.",
      "Once detected in this state, Finder or iTunes can push a complete, fresh copy of iOS to the device, effectively rebuilding it from the firmware level up.",
    ],
    steps: [
      "Connect the iPhone to a computer with Finder or iTunes open.",
      "Follow the model-specific button sequence to enter DFU Mode, ending with a fully black screen.",
      "Confirm the computer detects a device in recovery or DFU state.",
      "Choose Restore in Finder or iTunes to reinstall iOS.",
    ],
  },
},
{
  id: "ios-overheating-temperature-troubleshoot",
  title: "Temperature Warnings & Overheating",
  icon: Activity,
  platform: "ios",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Respond to iPhone temperature warnings",
  description: "iPhone displays an on-screen warning and can temporarily limit performance, charging, or camera flash when it gets too hot or too cold, protecting the battery and internal components until it returns to a safe operating range.",
  details: [
    "Warning appears automatically as a full-screen alert when the device detects an unsafe temperature.",
    "Certain features, like fast charging or camera flash, may pause automatically during a temperature warning.",
    "The device works to cool itself passively; there is no manual override setting to bypass the protection.",
    "Battery health and performance data related to thermal events can be viewed in Settings > Battery.",
  ],
  redirectUrl: "https://support.apple.com/en-us/118431",
  whyItMatters: "Lithium-ion batteries and internal electronics can be permanently damaged by sustained exposure to extreme heat or cold, so this protection exists specifically to prevent long-term hardware harm rather than being an arbitrary inconvenience. Common triggers, like leaving a phone on a car dashboard in direct sun or using intensive apps like gaming or navigation while charging in a hot environment, are avoidable once understood. Recognizing the warning as a protective response rather than a malfunction helps users respond appropriately, typically by simply moving the device to a more moderate environment rather than assuming it's broken.",
  bestPractices: [
    "Move the iPhone out of direct sunlight or a hot car immediately if a temperature warning appears.",
    "Remove a thick case temporarily if the device is struggling to cool down, since some cases trap heat.",
    "Avoid charging while using demanding apps in already-warm conditions, since combined heat sources compound the issue faster.",
  ],
  commonIssues: [
    { issue: "The phone won't charge past a certain point in the heat.", fix: "This is intentional thermal protection; allow the device to cool in a shaded, moderate-temperature area before charging resumes fully." },
    { issue: "Performance feels sluggish after a heat warning.", fix: "This is temporary thermal throttling; performance returns to normal once the device cools back to a safe range." },
    { issue: "The camera flash won't work.", fix: "Flash is disabled during some temperature warnings; wait for the device to cool and try again." },
  ],
  faqs: [
    { q: "Can repeated overheating damage the battery permanently?", a: "Yes, repeated extreme heat exposure can accelerate long-term battery capacity loss, which is why the protection intervenes proactively." },
    { q: "Is cold weather also a risk?", a: "Yes, extreme cold can temporarily reduce battery performance and trigger a similar protective warning." },
  ],
  tipsAndTricks: [
    "Check Settings > Battery > Battery Health & Charging periodically if overheating happens often, to rule out a battery health issue as a contributing factor.",
  ],
  relatedSettingIds: ["ios-battery-health-troubleshoot", "ios-battery"],
  afterImageContent: {
    heading: "How Temperature Protection Works",
    paragraphs: [
      "Internal sensors continuously monitor the device's temperature, and the system automatically adjusts charging speed, performance, and certain features when readings approach unsafe thresholds.",
      "This is a fully automatic protective behavior; there is no setting to disable it, since it exists to prevent permanent hardware damage.",
    ],
    steps: [
      "If a temperature warning appears, move the iPhone to a cooler or warmer, more moderate environment as appropriate.",
      "Remove the case if the device seems to be struggling to dissipate heat.",
      "Avoid charging or heavy app use until the warning clears.",
      "Check Settings > Battery afterward if concerned about lasting effects.",
    ],
  },
},
{
  id: "ios-wifi-bluetooth-connectivity-troubleshoot",
  title: "Wi-Fi & Bluetooth Connectivity Troubleshooting",
  icon: Wifi,
  platform: "ios",
  category: "troubleshooting-diagnostics",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Resolve common wireless connection problems",
  description: "A structured set of steps, including toggling Airplane Mode, forgetting a network, and resetting network settings, can resolve most Wi-Fi and Bluetooth connectivity issues on iPhone.",
  details: [
    "Basic first step: toggle Airplane Mode on and off from Control Center to reset both radios quickly.",
    "Forget a problematic Wi-Fi network under Settings > Wi-Fi > (i) icon > Forget This Network, then rejoin.",
    "Unpair a misbehaving Bluetooth accessory under Settings > Bluetooth > (i) icon > Forget This Device.",
    "Reset Network Settings under Settings > General > Transfer or Reset iPhone as a broader last resort.",
  ],
  redirectUrl: "https://support.apple.com/en-us/111786",
  whyItMatters: "Wireless connectivity issues are among the most common iPhone problems, and they can stem from a wide range of causes, from a corrupted saved network profile to router-side settings to a Bluetooth pairing gone stale. A structured troubleshooting order, starting with the least disruptive fix like Airplane Mode toggling and escalating only if needed to a full network settings reset, resolves the vast majority of cases without unnecessary data loss. Because Reset Network Settings also erases saved Wi-Fi passwords, VPN configurations, and cellular settings, understanding when it's actually necessary versus when a smaller step would suffice avoids unneeded extra reconfiguration work.",
  bestPractices: [
    "Start with the least invasive fix, like Airplane Mode toggling or forgetting a single network, before resetting all network settings.",
    "Restart the router as well as the iPhone when a single device's Wi-Fi issue might actually be network-wide.",
    "Note down important Wi-Fi passwords before using Reset Network Settings, since it clears all saved networks.",
  ],
  commonIssues: [
    { issue: "iPhone connects to Wi-Fi but has no internet access.", fix: "Forget the network and rejoin, and restart the router if other devices are also affected." },
    { issue: "A Bluetooth accessory keeps disconnecting.", fix: "Forget the device in Bluetooth settings, restart both devices, then re-pair from scratch." },
    { issue: "Wi-Fi is completely missing or greyed out.", fix: "Restart the iPhone first; if the option remains unavailable, this may indicate a hardware issue requiring service." },
  ],
  faqs: [
    { q: "Does Reset Network Settings delete personal data like photos?", a: "No, it only clears network-related settings such as Wi-Fi passwords, cellular settings, and VPN configurations." },
    { q: "Should Wi-Fi and Bluetooth be reset separately?", a: "They can be treated independently for isolated issues, but Reset Network Settings clears both at once as a broader fix." },
  ],
  tipsAndTricks: [
    "Try connecting to a different Wi-Fi network entirely to determine whether the issue is with the iPhone or the specific network.",
  ],
  relatedSettingIds: ["ios-reset-iphone", "ios-control-center"],
  afterImageContent: {
    heading: "How Wireless Troubleshooting Works",
    paragraphs: [
      "Toggling Airplane Mode fully power-cycles the Wi-Fi and Bluetooth radios, clearing many transient connection glitches without touching any saved settings.",
      "Forgetting a network or device removes its saved configuration entirely, forcing a clean reconnection that often resolves corrupted or outdated saved profiles.",
    ],
    steps: [
      "Open Control Center and toggle Airplane Mode on, wait a few seconds, then off.",
      "If the issue persists, open Settings > Wi-Fi, tap the (i) next to the network, and choose Forget This Network.",
      "Rejoin the network by entering the password again.",
      "For Bluetooth, forget and re-pair the affected accessory under Settings > Bluetooth.",
      "As a last resort, use Reset Network Settings under General > Transfer or Reset iPhone.",
    ],
  },
},{
  id: "ios-airtag-pairing",
  title: "AirTag & Item Trackers",
  icon: MapPin,
  platform: "ios",
  category: "devices-peripherals",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Pair and manage AirTags and other item trackers",
  description:
    "Pairing an AirTag or supported third-party item tracker links it to your Apple ID so you can see its location, rename it, and get separation alerts if you leave it behind, all managed from the Find My app's Items tab.",
  details: [
    "Pair a new AirTag by holding it near the iPhone and following the prompt",
    "Name and assign an emoji to each tracked item for quick identification",
    "Enable 'Notify When Left Behind' for separation alerts",
    "Share an AirTag with family members so multiple people can locate the same item",
  ],
  important: "AirTags are designed with safety features that alert nearby iPhone and Android users if an unknown tracker appears to be traveling with them, to deter covert tracking.",
  redirectUrl: "https://support.apple.com/en-us/HT212227",
  whyItMatters:
    "Item trackers meaningfully reduce the anxiety and cost of lost luggage, keys, or bags by tying physical objects into the same Find My network used for devices, with separation alerts catching a forgotten item before you've walked too far away to easily notice. Because pairing happens through this settings surface rather than a separate app, it stays consistent with how Apple devices are already managed. Understanding the safety alert system also matters, since users occasionally get an unfamiliar-tracker notification and need to know what it means and how to respond.",
  bestPractices: [
    "Enable 'Notify When Left Behind' for anything you'd be upset to lose, like keys or a wallet.",
    "Name items clearly and specifically rather than leaving default names, especially if you pair more than one.",
    "Share frequently-used shared items, like a shared bag or vehicle tracker, with relevant family members.",
  ],
  commonIssues: [
    { issue: "An AirTag won't pair.", fix: "Make sure Bluetooth and Location Services are on, then hold the AirTag close to the top of the iPhone and wait for the pairing prompt." },
    { issue: "Received an 'unknown accessory detected' alert while traveling with someone else's bag.", fix: "This is the anti-stalking safety feature; tap the alert to see the tracker's location history and instructions for disabling it if it isn't yours." },
  ],
  faqs: [
    { q: "Can I track a non-Apple item tracker the same way?", a: "Yes, supported third-party trackers that use the Find My network appear in the same Items tab." },
    { q: "Does someone need to be nearby for me to find my AirTag?", a: "No, the Find My network uses nearby Apple devices anonymously to relay location, so no direct connection to you is needed." },
  ],
  tipsAndTricks: [
    "Enable Precision Finding on supported iPhone models for an on-screen arrow and distance readout when very close to a lost item.",
  ],
  relatedSettingIds: ["ios-find-my", "ios-bluetooth", "ios-location-services"],
  afterImageContent: {
    heading: "How AirTag Pairing Works",
    paragraphs: [
      "AirTags broadcast a secure Bluetooth signal that nearby Apple devices relay anonymously through the Find My network to report the item's location back to its owner.",
      "Pairing links the AirTag's identity to your Apple ID, and item location updates appear in the Find My app's Items tab.",
    ],
    steps: [
      "Open the Find My app and go to the Items tab",
      "Tap the + button and select Add Item",
      "Hold the AirTag near the top of your iPhone",
      "Follow the on-screen prompts to name it and finish pairing",
    ],
  },
},
{
  id: "ios-contact-poster",
  title: "Contact Poster",
  icon: Users,
  platform: "ios",
  category: "personalization",
  controlType: "action",
  heading: "Customize how you appear on other people's incoming calls",
  description:
    "Contact Poster lets you design a full-screen photo, Memoji, or typography treatment that appears on the recipient's screen when you call them, replacing the plain name-and-number caller ID.",
  details: [
    "Choose a photo, Memoji, or a text-only design with custom fonts and colors",
    "Adjust photo filters and layout directly in the editor",
    "Poster syncs automatically to your Contact Card so it can also appear elsewhere, like Messages",
    "Recipients need a reasonably recent iOS version to see the full poster instead of a plain caller ID",
  ],
  redirectUrl: "https://support.apple.com/en-us/108241",
  whyItMatters:
    "Contact Poster is a personalization feature that changes how you appear to others rather than how your own phone looks, which is a distinct category worth understanding separately from wallpaper or icon customization. Since it's tied to your Contact Card, updating it once keeps it consistent everywhere your identity is shown to contacts. It's a lightweight way to add personality to phone calls, though it depends on the other person's device supporting the feature to display properly.",
  bestPractices: [
    "Pick a design with enough contrast for the name text to stay legible over the photo or color background.",
    "Update your poster after a significant photo change so it doesn't feel outdated.",
    "Preview how it looks by asking a contact with a recent iPhone to call you and check the display.",
  ],
  commonIssues: [
    { issue: "A recipient still sees a plain caller ID instead of your poster.", fix: "Their device likely doesn't support Contact Posters, or hasn't been updated to a compatible iOS version; the feature gracefully falls back to standard caller ID." },
    { issue: "The poster doesn't update after editing.", fix: "Confirm the change was saved to your Contact Card in the Contacts app, since Contact Poster is generated from that same card." },
  ],
  faqs: [
    { q: "Do Android users see my Contact Poster?", a: "No, Android devices display a standard caller ID rather than the full poster design." },
    { q: "Can I set a different poster for different contacts?", a: "No, you have one Contact Poster that's shown consistently to everyone who calls or is called by you." },
  ],
  tipsAndTricks: [
    "Use a Memoji-based design if you'd rather not use a real photo but still want more personality than plain text.",
  ],
  relatedSettingIds: ["ios-wallpaper", "ios-home-screen-app-library", "ios-icloud-account"],
  afterImageContent: {
    heading: "How Contact Poster Works",
    paragraphs: [
      "Contact Poster is generated from your personal Contact Card and automatically shared with contacts when you call them, similar to how a profile photo syncs across apps.",
      "The design is stored once and reused across calling and messaging contexts rather than being set per conversation.",
    ],
    steps: [
      "Open the Phone app and tap your contact card at the top of Favorites or Contacts",
      "Tap Contact Photo & Poster",
      "Choose a photo, Memoji, or a Monogram/typography style",
      "Adjust the layout and tap Continue, then Done to save",
    ],
  },
},
];
