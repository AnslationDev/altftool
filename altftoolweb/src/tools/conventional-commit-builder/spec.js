// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "conventional-commit-builder",
  "title": "Conventional Commit Builder",
  "description": "A tool to help developers create conventional commits with standardized formatting",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "code",
  "iconColor": "text-emerald-600",
  "fields": [
    {
      "key": "commit_type",
      "label": "Commit Type",
      "type": "select",
      "default": "feat",
      "choices": [
        {
          "value": "feat",
          "label": "New Feature"
        },
        {
          "value": "fix",
          "label": "Bug Fix"
        },
        {
          "value": "docs",
          "label": "Documentation"
        },
        {
          "value": "style",
          "label": "Code Style"
        },
        {
          "value": "refactor",
          "label": "Code Refactoring"
        },
        {
          "value": "perf",
          "label": "Performance Improvement"
        },
        {
          "value": "test",
          "label": "Test Addition"
        },
        {
          "value": "build",
          "label": "Build System"
        },
        {
          "value": "ci",
          "label": "Continuous Integration"
        },
        {
          "value": "chore",
          "label": "Miscellaneous"
        }
      ]
    },
    {
      "key": "commit_scope",
      "label": "Commit Scope",
      "type": "text",
      "default": ""
    },
    {
      "key": "commit_subject",
      "label": "Commit Subject",
      "type": "text",
      "default": ""
    },
    {
      "key": "commit_body",
      "label": "Commit Body",
      "type": "textarea",
      "default": ""
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "commit_type": "feat",
        "commit_scope": "login",
        "commit_subject": "add login button",
        "commit_body": "Added a new login button to the homepage"
      }
    }
  ],
  "note": "Please follow conventional commit guidelines"
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const type = values.commit_type;
      const scope = values.commit_scope ? `(${values.commit_scope})` : '';
      const subject = values.commit_subject;
      const body = values.commit_body ? `

${values.commit_body}` : '';
      const commitMessage = `${type}${scope}: ${subject}${body}`;
      return {
         result: commitMessage,
         rows: [['Type', type], ['Scope', values.commit_scope || ''], ['Subject', subject], ['Body', values.commit_body || '']]
      };
   },
};

export default spec;
