// Workspace Registry — type definitions (JSDoc; this is a .js project).
//
// The hierarchy is: Workspace → Project → Application → Module → Section → Feature.
// Applications are FULLY dynamic: each project declares whatever applications it
// has (Admin Panel, Public Website, Mobile App, API, Chrome Extension, Desktop,
// Backend Services, …). Nothing here hardcodes any application name.

/**
 * @typedef {"workspace"|"project"|"application"|"module"|"section"|"feature"} WorkspaceLevel
 */

/**
 * A feature — the deepest addressable node (optional).
 * @typedef {Object} FeatureDef
 * @property {string} key                 stable slug
 * @property {string} [label]             human label (defaults to titleized key)
 * @property {Object} [meta]              free-form metadata for consumers
 */

/**
 * A section groups features inside a module (optional).
 * @typedef {Object} SectionDef
 * @property {string} key
 * @property {string} [label]
 * @property {Object} [meta]
 * @property {FeatureDef[]|Object.<string,FeatureDef>} [features]
 */

/**
 * A module inside an application.
 * @typedef {Object} ModuleDef
 * @property {string} key
 * @property {string} [label]
 * @property {Object} [meta]
 * @property {SectionDef[]|Object.<string,SectionDef>} [sections]
 */

/**
 * An application inside a project. Its `id` and `label` are defined by the
 * project — the registry never assumes a set of applications.
 * @typedef {Object} ApplicationDef
 * @property {string} id
 * @property {string} [label]
 * @property {boolean} [default]          the project's primary application
 * @property {Object} [meta]
 * @property {ModuleDef[]|Object.<string,ModuleDef>} [modules]
 */

/**
 * A project registration.
 * @typedef {Object} ProjectDef
 * @property {string} id
 * @property {string} [name]
 * @property {Object} [meta]
 * @property {ApplicationDef[]|Object.<string,ApplicationDef>} [applications]
 */

/**
 * A normalized node stored in the registry.
 * @typedef {Object} WorkspaceNode
 * @property {WorkspaceLevel} level
 * @property {string} id                  segment slug (project id / app id / module key / …)
 * @property {string} label
 * @property {string} hierarchyPath       e.g. "altftool/admin-panel/tools/image-tools"
 * @property {string|null} parentPath
 * @property {string} projectId
 * @property {string|null} applicationId
 * @property {string|null} moduleKey
 * @property {string|null} section
 * @property {string|null} feature
 * @property {string[]} childPaths
 * @property {Object} meta
 */

export const WORKSPACE_LEVELS = ["workspace", "project", "application", "module", "section", "feature"];
export const DEFAULT_WORKSPACE_ID = "anslation";
export const DEFAULT_WORKSPACE_LABEL = "Anslation";
