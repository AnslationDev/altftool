export const IAM_POLICY_LIMITS = Object.freeze({
  maxCharacters: 200_000,
  maxStatements: 500,
  maxFindings: 600,
});

export const IAM_POLICY_LIMITATIONS = Object.freeze([
  "This is a local, lexical review of fields in one pasted identity or resource-policy JSON document. It does not call AWS or resolve accounts, roles, SCPs, permission boundaries, other applicable policies, session policies, or live context.",
  "A finding is a review cue, not proof that access is allowed or exploitable. AWS authorization depends on all applicable policies, condition keys, principals, resources, and explicit denies.",
  "The checker does not validate every AWS action, ARN, service-specific condition key, variable, or policy grammar rule.",
]);

const PRIVILEGE_MANAGEMENT_PATTERNS = [
  /^iam:(?:attach|detach).+policy$/i,
  /^iam:(?:put|delete).+policy$/i,
  /^iam:createpolicyversion$/i,
  /^iam:setdefaultpolicyversion$/i,
  /^iam:updateassumerolepolicy$/i,
  /^iam:createaccesskey$/i,
  /^iam:updateloginprofile$/i,
  /^iam:addusertogroup$/i,
  /^iam:create(?:user|role|group)$/i,
  /^sts:assumerole$/i,
];

function stringList(value) {
  if (typeof value === "string") {
    return { values: [value], valid: value.length > 0 };
  }
  if (Array.isArray(value)) {
    return {
      values: value.filter((item) => typeof item === "string"),
      valid:
        value.length > 0 &&
        value.every((item) => typeof item === "string" && item.length > 0),
    };
  }
  return { values: [], valid: false };
}

function nonEmptyObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}

function principalValues(value) {
  if (typeof value === "string") {
    return { values: value ? [value] : [], valid: value.length > 0 };
  }
  if (Array.isArray(value)) {
    return {
      values: value.filter((item) => typeof item === "string"),
      valid:
        value.length > 0 &&
        value.every((item) => typeof item === "string" && item.length > 0),
    };
  }
  if (nonEmptyObject(value)) {
    const nested = Object.values(value).map(principalValues);
    return {
      values: nested.flatMap((entry) => entry.values),
      valid: nested.every((entry) => entry.valid),
    };
  }
  return { values: [], valid: false };
}

function createFinding(severity, code, statement, title, detail) {
  return {
    severity,
    code,
    statement: statement + 1,
    title,
    detail,
  };
}

function hasPrivilegeManagementCue(actions) {
  return actions.some((action) =>
    PRIVILEGE_MANAGEMENT_PATTERNS.some((pattern) => pattern.test(action)),
  );
}

function assess(counts, valid) {
  if (!valid) {
    return {
      level: "invalid",
      label: "Policy structure needs correction",
      description:
        "The pasted content could not be reviewed as a supported IAM policy JSON structure.",
    };
  }
  if (counts.high > 0) {
    return {
      level: "action",
      label: "High-priority review cues found",
      description:
        "At least one broad or privilege-sensitive Allow pattern deserves contextual review before this policy is used.",
    };
  }
  if (counts.medium > 0 || counts.review > 0) {
    return {
      level: "review",
      label: "Policy needs contextual review",
      description:
        "No high-priority cue was observed, but one or more broad or ambiguous patterns should be checked against intended access.",
    };
  }
  return {
    level: "clear",
    label: "No configured risk cue observed",
    description:
      "The limited rules did not flag this structure. That is not an AWS authorization, least-privilege, or security validation.",
  };
}

export function analyzeIamPolicyText(input) {
  if (typeof input !== "string") {
    throw new TypeError("IAM policy input must be text.");
  }
  if (input.length > IAM_POLICY_LIMITS.maxCharacters) {
    throw new RangeError(
      `Policy exceeds the ${IAM_POLICY_LIMITS.maxCharacters.toLocaleString("en-US")}-character local limit.`,
    );
  }

  const findings = [];
  const observedCounts = { high: 0, medium: 0, review: 0 };
  const findingCodeCounts = {};
  let truncated = false;
  const priority = { review: 1, medium: 2, high: 3 };
  const add = (finding) => {
    observedCounts[finding.severity] += 1;
    findingCodeCounts[finding.code] =
      (findingCodeCounts[finding.code] || 0) + 1;
    if (findings.length < IAM_POLICY_LIMITS.maxFindings) {
      findings.push(finding);
      return;
    }
    truncated = true;
    const replacementIndex = findings.findIndex(
      (stored) => priority[stored.severity] < priority[finding.severity],
    );
    if (replacementIndex >= 0) findings[replacementIndex] = finding;
  };

  let policy;
  try {
    policy = JSON.parse(input);
  } catch {
    const counts = { high: 0, medium: 0, review: 1 };
    return {
      valid: false,
      inputError: "The pasted content is not valid JSON.",
      findings: [
        {
          severity: "review",
          code: "invalid-json",
          statement: null,
          title: "JSON could not be parsed",
          detail:
            "Correct the JSON syntax before evaluating IAM statement structure.",
        },
      ],
      counts,
      stats: {
        charactersInspected: input.length,
        statementsInspected: 0,
        allowStatements: 0,
        denyStatements: 0,
        statementsWithConditions: 0,
      },
      assessment: assess(counts, false),
      truncated: false,
      limitations: [...IAM_POLICY_LIMITATIONS],
    };
  }

  if (!nonEmptyObject(policy)) {
    const counts = { high: 0, medium: 0, review: 1 };
    return {
      valid: false,
      inputError: "The policy root must be a non-empty JSON object.",
      findings: [
        {
          severity: "review",
          code: "invalid-policy-root",
          statement: null,
          title: "Unsupported policy root",
          detail:
            "Use a JSON object with a Statement object or Statement array.",
        },
      ],
      counts,
      stats: {
        charactersInspected: input.length,
        statementsInspected: 0,
        allowStatements: 0,
        denyStatements: 0,
        statementsWithConditions: 0,
      },
      assessment: assess(counts, false),
      truncated: false,
      limitations: [...IAM_POLICY_LIMITATIONS],
    };
  }

  const rawStatements = Array.isArray(policy.Statement)
    ? policy.Statement
    : policy.Statement === undefined
      ? []
      : [policy.Statement];

  if (rawStatements.length === 0) {
    add({
      severity: "review",
      code: "missing-statement",
      statement: null,
      title: "No Statement found",
      detail: "The policy has no statement object to inspect.",
    });
  }
  if (rawStatements.length > IAM_POLICY_LIMITS.maxStatements) {
    throw new RangeError(
      `Policy exceeds the ${IAM_POLICY_LIMITS.maxStatements}-statement local limit.`,
    );
  }

  let allowStatements = 0;
  let denyStatements = 0;
  let statementsWithConditions = 0;

  rawStatements.forEach((statement, index) => {
    if (!nonEmptyObject(statement)) {
      add(
        createFinding(
          "review",
          "invalid-statement",
          index,
          "Statement is not a non-empty object",
          "Each Statement entry should be a JSON object with an Effect and an Action or NotAction.",
        ),
      );
      return;
    }

    const effect = typeof statement.Effect === "string" ? statement.Effect : "";
    const isAllow = effect === "Allow";
    const isDeny = effect === "Deny";
    if (isAllow) allowStatements += 1;
    if (isDeny) denyStatements += 1;
    if (!isAllow && !isDeny) {
      add(
        createFinding(
          "review",
          "invalid-effect",
          index,
          "Effect is missing or unsupported",
          'Effect should be the exact string "Allow" or "Deny".',
        ),
      );
    }

    const action = stringList(statement.Action);
    const notAction = stringList(statement.NotAction);
    const resource = stringList(statement.Resource);
    const notResource = stringList(statement.NotResource);
    const principal = principalValues(statement.Principal);
    const notPrincipal = principalValues(statement.NotPrincipal);

    if (statement.Action !== undefined && !action.valid) {
      add(
        createFinding(
          "review",
          "invalid-action-shape",
          index,
          "Action has an unsupported shape",
          "Action should be a non-empty string or a non-empty array of strings.",
        ),
      );
    }
    if (statement.NotAction !== undefined && !notAction.valid) {
      add(
        createFinding(
          "review",
          "invalid-not-action-shape",
          index,
          "NotAction has an unsupported shape",
          "NotAction should be a non-empty string or a non-empty array of strings.",
        ),
      );
    }
    if (statement.Action === undefined && statement.NotAction === undefined) {
      add(
        createFinding(
          "review",
          "missing-action",
          index,
          "Neither Action nor NotAction is present",
          "Review whether this is a supported IAM statement type and add the intended action selector.",
        ),
      );
    }
    if (statement.Action !== undefined && statement.NotAction !== undefined) {
      add(
        createFinding(
          "review",
          "mixed-action-selectors",
          index,
          "Action and NotAction are both present",
          "Review the statement grammar and keep only the intended action selector.",
        ),
      );
    }

    if (isAllow && notAction.values.length > 0) {
      add(
        createFinding(
          "high",
          "allow-not-action",
          index,
          "Allow uses NotAction",
          "An Allow with exclusions can cover a much broader action set than a short list suggests.",
        ),
      );
    }

    if (statement.Principal !== undefined && !principal.valid) {
      add(
        createFinding(
          "review",
          "invalid-principal-shape",
          index,
          "Principal has an unsupported shape",
          "Principal should be a non-empty string, array of strings, or object whose values use those forms.",
        ),
      );
    }
    if (statement.NotPrincipal !== undefined && !notPrincipal.valid) {
      add(
        createFinding(
          "review",
          "invalid-not-principal-shape",
          index,
          "NotPrincipal has an unsupported shape",
          "NotPrincipal should be a non-empty string, array of strings, or object whose values use those forms.",
        ),
      );
    }
    if (
      statement.Principal !== undefined &&
      statement.NotPrincipal !== undefined
    ) {
      add(
        createFinding(
          "review",
          "mixed-principal-selectors",
          index,
          "Principal and NotPrincipal are both present",
          "Review the statement grammar and keep only the intended principal selector.",
        ),
      );
    }
    if (isAllow && principal.values.includes("*")) {
      add(
        createFinding(
          "high",
          "allow-all-principals",
          index,
          "Allow applies to every principal",
          "A wildcard Principal can make a resource or trust policy broadly reachable unless effective conditions and surrounding controls narrow it.",
        ),
      );
    }
    if (isAllow && notPrincipal.values.length > 0) {
      add(
        createFinding(
          "high",
          "allow-not-principal",
          index,
          "Allow uses NotPrincipal",
          "An Allow with principal exclusions can cover a much broader identity set than expected.",
        ),
      );
    }

    if (isAllow && action.values.includes("*")) {
      add(
        createFinding(
          "high",
          "allow-all-actions",
          index,
          "Allow covers every action",
          'Action "*" is a broad authorization cue that needs resource, condition, boundary, and account-context review.',
        ),
      );
    } else if (
      isAllow &&
      action.values.some((value) => /^[^:*]+:\*$/.test(value))
    ) {
      add(
        createFinding(
          "high",
          "allow-service-wildcard",
          index,
          "Allow covers every action in a service",
          "A service-wide wildcard may include privilege-management or future actions.",
        ),
      );
    } else if (
      isAllow &&
      action.values.some((value) => value.includes("*") || value.includes("?"))
    ) {
      add(
        createFinding(
          "medium",
          "allow-action-pattern",
          index,
          "Allow uses an action pattern",
          "Confirm that the wildcard pattern cannot match actions outside the intended operation set.",
        ),
      );
    }

    const hasPassRole = action.values.some(
      (value) => value.toLowerCase() === "iam:passrole",
    );
    const hasPrivilegeCue = hasPrivilegeManagementCue(action.values);
    if (isAllow && hasPassRole) {
      add(
        createFinding(
          "high",
          "allow-pass-role",
          index,
          "Allow includes iam:PassRole",
          "Review the target roles, services, conditions, and the caller's other permissions; PassRole can be security-sensitive.",
        ),
      );
    }
    if (isAllow && hasPrivilegeCue) {
      add(
        createFinding(
          "high",
          "allow-privilege-management",
          index,
          "Privilege-management action observed",
          "The action list contains a role, identity, policy, access-key, or role-assumption management cue.",
        ),
      );
    }

    if (statement.Resource !== undefined && !resource.valid) {
      add(
        createFinding(
          "review",
          "invalid-resource-shape",
          index,
          "Resource has an unsupported shape",
          "Resource should be a non-empty string or a non-empty array of strings.",
        ),
      );
    }
    if (statement.NotResource !== undefined && !notResource.valid) {
      add(
        createFinding(
          "review",
          "invalid-not-resource-shape",
          index,
          "NotResource has an unsupported shape",
          "NotResource should be a non-empty string or a non-empty array of strings.",
        ),
      );
    }
    if (
      statement.Resource !== undefined &&
      statement.NotResource !== undefined
    ) {
      add(
        createFinding(
          "review",
          "mixed-resource-selectors",
          index,
          "Resource and NotResource are both present",
          "Review the statement grammar and keep only the intended resource selector.",
        ),
      );
    }
    if (isAllow && notResource.values.length > 0) {
      add(
        createFinding(
          "high",
          "allow-not-resource",
          index,
          "Allow uses NotResource",
          "An Allow with resource exclusions can cover a much broader resource set than expected.",
        ),
      );
    }
    if (isAllow && resource.values.includes("*")) {
      add(
        createFinding(
          hasPassRole || hasPrivilegeCue ? "high" : "medium",
          "allow-all-resources",
          index,
          "Allow applies to every resource",
          'Resource "*" needs service-specific review because some actions support narrower resource constraints and some do not.',
        ),
      );
    }

    const hasCondition = nonEmptyObject(statement.Condition);
    if (hasCondition) statementsWithConditions += 1;
    if (
      statement.Condition !== undefined &&
      statement.Condition !== null &&
      !hasCondition
    ) {
      add(
        createFinding(
          "review",
          "empty-or-invalid-condition",
          index,
          "Condition is empty or unsupported",
          "Review the condition operator and key structure; this checker does not validate service-specific condition semantics.",
        ),
      );
    }
    if (isAllow && (hasPassRole || hasPrivilegeCue) && !hasCondition) {
      add(
        createFinding(
          "medium",
          "sensitive-action-without-condition",
          index,
          "No condition accompanies a sensitive action cue",
          "Consider whether service, source, tag, account, or other contextual constraints are appropriate for the intended workflow.",
        ),
      );
    }
  });

  const counts = observedCounts;
  const valid = rawStatements.length > 0 && counts.review === 0;

  return {
    valid,
    inputError: null,
    findings,
    counts,
    stats: {
      charactersInspected: input.length,
      statementsInspected: rawStatements.length,
      allowStatements,
      denyStatements,
      statementsWithConditions,
    },
    assessment: assess(counts, valid),
    truncated,
    findingCodeCounts,
    limitations: [...IAM_POLICY_LIMITATIONS],
  };
}

export function buildIamPolicyReport(result) {
  return {
    tool: "AWS IAM Policy Validator",
    scope: "Counts-only local lexical review",
    assessment: result.assessment.level,
    counts: { ...result.counts },
    stats: { ...result.stats },
    findingCodes:
      result.findingCodeCounts ||
      result.findings.reduce((accumulator, finding) => {
        accumulator[finding.code] = (accumulator[finding.code] || 0) + 1;
        return accumulator;
      }, {}),
    truncated: Boolean(result.truncated),
    limitations: [...IAM_POLICY_LIMITATIONS],
  };
}
