const UUID_URN_PATTERN =
  /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function encodePurlPart(value) {
  return encodeURIComponent(value).replace(
    /[!'()*]/gu,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function npmPurl(name, version) {
  if (!name || !version) return "";
  if (name.startsWith("@")) {
    const [scope, packageName] = name.split("/");
    if (!scope || !packageName) return "";
    return `pkg:npm/${encodePurlPart(scope)}/${encodePurlPart(packageName)}@${encodePurlPart(version)}`;
  }
  return `pkg:npm/${encodePurlPart(name)}@${encodePurlPart(version)}`;
}

function cleanRefPart(value) {
  return encodeURIComponent(String(value || "unknown")).slice(0, 500);
}

function componentRef(component, index) {
  return `npm:${cleanRefPart(component.name)}@${cleanRefPart(
    component.version || component.declaredRange || "unresolved",
  )}:${index + 1}`;
}

function optionalVersion(target, version) {
  if (version) target.version = version;
  return target;
}

function componentProperties(component) {
  const properties = [
    { name: "altftool:npm:relationship", value: component.relationship },
    { name: "altftool:npm:scope", value: component.scope },
  ];
  if (component.declaredRange) {
    properties.push({
      name: "altftool:npm:declaredRange",
      value: component.declaredRange,
    });
  }
  for (const declaredRange of component.declaredRanges || []) {
    if (!declaredRange || declaredRange === component.declaredRange) continue;
    properties.push({
      name: "altftool:npm:declaredRange",
      value: declaredRange,
    });
  }
  if ((component.occurrenceCount || 1) > 1) {
    properties.push({
      name: "altftool:npm:occurrenceCount",
      value: String(component.occurrenceCount),
    });
  }
  for (const alias of component.aliases || []) {
    properties.push({
      name: "altftool:npm:installAlias",
      value: alias,
    });
  }
  for (const path of (component.paths || []).slice(0, 20)) {
    properties.push({
      name: "altftool:npm:installPath",
      value: path,
    });
  }
  return properties;
}

function componentLicense(license) {
  return license ? [{ license: { name: license } }] : undefined;
}

export function generateCycloneDxSbom(inventory, options = {}) {
  if (!inventory?.project || !Array.isArray(inventory.components)) {
    throw new TypeError("A parsed dependency inventory is required.");
  }

  const metadataPolicy = options.metadataPolicy || "omit";
  if (!["omit", "provided"].includes(metadataPolicy)) {
    throw new Error("Metadata policy must be omit or provided.");
  }
  if (metadataPolicy === "provided") {
    if (!UUID_URN_PATTERN.test(options.serialNumber || "")) {
      throw new Error("Provided serial number must be an RFC 4122 UUID URN.");
    }
    if (
      typeof options.timestamp !== "string" ||
      !Number.isFinite(Date.parse(options.timestamp))
    ) {
      throw new Error(
        "Provided timestamp must be an ISO-compatible date-time.",
      );
    }
  }

  const rootRef = `npm-root:${cleanRefPart(inventory.project.name)}@${cleanRefPart(
    inventory.project.version || "unresolved",
  )}`;
  const refs = new Map();
  const components = inventory.components.map((component, index) => {
    const bomRef = componentRef(component, index);
    refs.set(component, bomRef);
    const output = {
      "bom-ref": bomRef,
      type: "library",
      name: component.name,
    };
    optionalVersion(output, component.version);
    const purl = npmPurl(component.name, component.version);
    if (purl) output.purl = purl;
    const licenses = componentLicense(component.license);
    if (licenses) output.licenses = licenses;
    output.properties = componentProperties(component);
    return output;
  });

  const metadataComponent = {
    "bom-ref": rootRef,
    type: "application",
    name: inventory.project.name,
  };
  optionalVersion(metadataComponent, inventory.project.version);
  const projectLicenses = componentLicense(inventory.project.license);
  if (projectLicenses) metadataComponent.licenses = projectLicenses;

  const inventoryWarningProperties = (inventory.warnings || []).map(
    (warning) => ({
      name: "altftool:inventoryWarning",
      value: String(warning).slice(0, 1_000),
    }),
  );
  const bom = {
    $schema: "https://cyclonedx.org/schema/bom-1.7.schema.json",
    bomFormat: "CycloneDX",
    specVersion: "1.7",
    version: 1,
    metadata: {
      component: metadataComponent,
      properties: [
        { name: "altftool:sourceKind", value: inventory.sourceKind },
        {
          name: "altftool:inventoryLimitApplied",
          value: String(Boolean(inventory.truncated)),
        },
        {
          name: "altftool:inventoryScope",
          value: "selected npm JSON only; composition incomplete",
        },
        {
          name: "altftool:dependencyEdgeScope",
          value: "root-to-direct edges stated by the selected JSON only",
        },
        {
          name: "altftool:signatureStatus",
          value: "not signed or attested",
        },
        {
          name: "altftool:volatileMetadataPolicy",
          value: metadataPolicy,
        },
        ...inventoryWarningProperties,
      ],
    },
    components,
    dependencies: [
      {
        ref: rootRef,
        dependsOn: inventory.components
          .filter((component) => component.relationship === "direct")
          .map((component) => refs.get(component)),
      },
    ],
    compositions: [
      {
        aggregate: "incomplete",
        assemblies: [rootRef],
        dependencies: [rootRef],
      },
    ],
  };

  if (metadataPolicy === "provided") {
    bom.serialNumber = options.serialNumber;
    bom.metadata.timestamp = new Date(options.timestamp).toISOString();
  }

  return {
    bom,
    summary: {
      components: components.length,
      resolvedVersions: components.filter((component) => component.version)
        .length,
      unresolvedVersions: components.filter((component) => !component.version)
        .length,
      declaredLicenses: components.filter((component) => component.licenses)
        .length,
      directRelationships: bom.dependencies[0].dependsOn.length,
      unknownRelationships: inventory.components.filter(
        (component) => component.relationship === "unknown",
      ).length,
      warnings: [...(inventory.warnings || [])],
      metadataPolicy,
      completeness: "incomplete",
    },
    limitations: [
      "The BOM contains only components visible in the selected npm JSON and marks its composition incomplete.",
      "Nested dependency edges are not reconstructed when the input does not state them unambiguously.",
      "Declared ranges are recorded as properties, not treated as installed versions.",
      "The file is not signed, attested, vulnerability-scanned, or a complete transitive-installation claim.",
    ],
  };
}
