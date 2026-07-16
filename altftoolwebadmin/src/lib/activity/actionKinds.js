// Maps a specific ACTION string (e.g. "BLOG_UPDATE", "ADS_STATUS_CHANGE") to a
// coarse `actionKind` used for icons, grouping, and analytics. Extensible:
// unknown actions fall back to a generic kind, never an error.

const KIND_RULES = [
  [/(_CREATE|_ADD|_DRAFT_CREATE|\.create$|^create)/i, "create"],
  [/(_UPDATE|_EDIT|_APPLY|\.update$|^update|_SAVE)/i, "update"],
  [/(_DELETE|_REMOVE|_BULK_DELETE|\.delete$|^delete)/i, "delete"],
  [/(_PUBLISH|_UNPUBLISH|\.publish$|^publish)/i, "publish"],
  [/(_STATUS|_TOGGLE|_STATUS_CHANGE)/i, "status"],
  [/(_EXPORT|\.export$)/i, "export"],
  [/(_IMPORT|_MIGRAT)/i, "import"],
  [/(LOGIN|SIGN_IN|SESSION|LOGOUT|SIGN_OUT)/i, "auth"],
  [/(_APPROVE|_REJECT|ACCESS_REQUEST)/i, "review"],
  [/(_RUN|_WORKFLOW|_SYNC|_CONNECT|_INDEX)/i, "run"],
];

export function actionKindFor(action) {
  const a = String(action || "");
  for (const [re, kind] of KIND_RULES) {
    if (re.test(a)) return kind;
  }
  return "activity";
}

export const ACTION_KINDS = [
  "create", "update", "delete", "publish", "status",
  "export", "import", "auth", "review", "run", "activity",
];
