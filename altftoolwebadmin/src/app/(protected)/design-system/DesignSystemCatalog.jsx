"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  Code2,
  Database,
  Mail,
  Palette,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  Alert,
  Badge,
  BrandLogo,
  BrandMark,
  Button,
  Card,
  Cluster,
  EmptyState,
  Field,
  IconButton,
  Input,
  Modal,
  PageShell,
  SearchInput,
  SectionHeader,
  Select,
  Skeleton,
  SkeletonText,
  Spinner,
  Stack,
  StatusBadge,
  Tabs,
  Textarea,
  ThemeModeSelector,
  Toggle,
} from "@altftool/ui";
import { PageHeader } from "@/ansets";
import { useAdminTheme } from "@/context/ThemeContext";

const COLOR_TOKENS = [
  // These deliberately reference the SEMANTIC aliases (defined in globals.css),
  // not the raw --anslation-ds-* primitives — this catalog's job is to document
  // the layer app code is actually supposed to consume (per master.md), and it
  // was previously bypassing that layer on its own showcase page.
  { label: "Page", token: "--page" },
  { label: "Surface", token: "--surface" },
  { label: "Soft", token: "--surface-soft" },
  { label: "Border", token: "--border" },
  { label: "Text", token: "--foreground" },
  { label: "Muted", token: "--muted" },
  { label: "Primary", token: "--primary" },
  { label: "Secondary", token: "--secondary" },
  { label: "Success", token: "--success" },
  { label: "Warning", token: "--warning" },
  { label: "Danger", token: "--danger" },
  { label: "Info", token: "--info" },
];

const TAB_ITEMS = [
  { key: "foundation", label: "Foundation", icon: <Palette /> },
  { key: "components", label: "Components", icon: <Code2 /> },
  { key: "patterns", label: "Patterns", icon: <Database /> },
];

export default function DesignSystemCatalog() {
  const { themeMode, setThemeMode } = useAdminTheme();
  const [activeTab, setActiveTab] = useState("foundation");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <PageShell>
      <Stack gap="lg">
        <PageHeader
          icon={Palette}
          eyebrow="AltF Foundations"
          title="Design System"
          description="Canonical brand, tokens, controls, states, and reusable product patterns."
          actions={
            <>
              <StatusBadge tone="success">Shared</StatusBadge>
              <ThemeModeSelector
                value={themeMode}
                onChange={setThemeMode}
                size="sm"
              />
            </>
          }
        >
          <Tabs
            items={TAB_ITEMS}
            value={activeTab}
            onChange={setActiveTab}
            ariaLabel="Design system sections"
          />
        </PageHeader>

        <div
          role="tabpanel"
          aria-label={TAB_ITEMS.find((item) => item.key === activeTab)?.label}
        >
          <Stack gap="lg">
            {activeTab === "foundation" ? (
              <>
                <section aria-labelledby="brand-section">
                  <SectionHeader
                    id="brand-section"
                    title="Brand"
                    description="One lockup source for public and admin surfaces."
                  />
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <Card className="flex min-h-32 items-center justify-center p-5">
                      <BrandLogo size="lg" />
                    </Card>
                    <Card className="flex min-h-32 items-center justify-center p-5">
                      <BrandLogo size="md" monochrome />
                    </Card>
                    <Card className="flex min-h-32 items-center justify-center p-5">
                      <BrandMark size="xl" />
                    </Card>
                  </div>
                </section>

                <section aria-labelledby="tokens-section">
                  <SectionHeader
                    id="tokens-section"
                    title="Semantic tokens"
                    description="The same token names resolve across light and dark themes."
                  />
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                    {COLOR_TOKENS.map((item) => (
                      <Card key={item.token} className="overflow-hidden">
                        <div
                          className="h-16 border-b border-[var(--border)]"
                          style={{ backgroundColor: `var(${item.token})` }}
                        />
                        <div className="p-3">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {item.label}
                          </p>
                          <code className="mt-1 block truncate text-[11px] text-[var(--muted)]">
                            {item.token}
                          </code>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              </>
            ) : null}

            {activeTab === "components" ? (
              <>
                <section aria-labelledby="actions-section">
                  <SectionHeader
                    id="actions-section"
                    title="Actions"
                    description="Consistent hierarchy and interaction states."
                  />
                  <Card className="mt-4 p-5">
                    <Cluster>
                      <Button>Primary action</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="success">
                        <Check aria-hidden="true" />
                        Success
                      </Button>
                      <Button variant="danger">Delete</Button>
                      <Button loading>Saving</Button>
                      <IconButton aria-label="Notifications">
                        <Bell aria-hidden="true" />
                      </IconButton>
                    </Cluster>
                  </Card>
                </section>

                <section aria-labelledby="forms-section">
                  <SectionHeader
                    id="forms-section"
                    title="Forms"
                    description="Inputs, selection, validation, and binary controls."
                  />
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <Card className="p-5">
                      <Stack>
                        <Field
                          label="Workspace name"
                          htmlFor="catalog-workspace"
                          required
                        >
                          <Input
                            id="catalog-workspace"
                            placeholder="AltFTool workspace"
                          />
                        </Field>
                        <Field label="Search">
                          <SearchInput
                            value={searchValue}
                            onChange={(event) =>
                              setSearchValue(event.target.value)
                            }
                            onClear={() => setSearchValue("")}
                            placeholder="Search components"
                          />
                        </Field>
                        <Field label="Environment">
                          <Select defaultValue="production">
                            <option value="production">Production</option>
                            <option value="preview">Preview</option>
                            <option value="development">Development</option>
                          </Select>
                        </Field>
                      </Stack>
                    </Card>

                    <Card className="p-5">
                      <Stack>
                        <Field label="Release note">
                          <Textarea placeholder="Describe the release" />
                        </Field>
                        <Field
                          label="API endpoint"
                          error="Enter a valid HTTPS URL."
                        >
                          <Input invalid defaultValue="example.test" />
                        </Field>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                              Live updates
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                              Refresh shared status automatically.
                            </p>
                          </div>
                          <Toggle label="Live updates" defaultChecked />
                        </div>
                      </Stack>
                    </Card>
                  </div>
                </section>

                <section aria-labelledby="feedback-section">
                  <SectionHeader
                    id="feedback-section"
                    title="Feedback and status"
                    description="Status colour is reserved for state."
                  />
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <Stack>
                      <Alert tone="info" title="Information">
                        Shared tokens are loaded from the workspace package.
                      </Alert>
                      <Alert tone="success" title="Healthy">
                        Public and admin applications resolve the same
                        foundation.
                      </Alert>
                      <Alert tone="warning" title="Review needed">
                        Migrate local controls before adding new variants.
                      </Alert>
                      <Alert tone="danger" title="Blocked">
                        Hardcoded brand colours fail the architecture check.
                      </Alert>
                    </Stack>
                    <Card className="p-5">
                      <Stack>
                        <Cluster>
                          <Badge>Neutral</Badge>
                          <Badge tone="primary">Primary</Badge>
                          <Badge tone="success">Healthy</Badge>
                          <Badge tone="warning">Warning</Badge>
                          <Badge tone="danger">Error</Badge>
                          <Badge tone="info">Info</Badge>
                        </Cluster>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3">
                            <Spinner />
                            <span className="text-sm text-[var(--muted)]">
                              Loading data
                            </span>
                          </div>
                          <div className="rounded-lg border border-[var(--border)] p-3">
                            <Skeleton className="h-8 w-2/3" />
                            <SkeletonText className="mt-3" lines={2} />
                          </div>
                        </div>
                      </Stack>
                    </Card>
                  </div>
                </section>
              </>
            ) : null}

            {activeTab === "patterns" ? (
              <section aria-labelledby="patterns-section">
                <SectionHeader
                  id="patterns-section"
                  title="Reusable patterns"
                  description="Common product states assembled from primitives."
                />
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <EmptyState
                    variant="dashed"
                    icon={<Search />}
                    title="No results"
                    description="Adjust filters or search another term."
                    action={<Button variant="secondary">Clear filters</Button>}
                  />
                  <EmptyState
                    variant="dashed"
                    icon={<Mail />}
                    title="Inbox clear"
                    description="New support requests will appear here."
                    action={<Button variant="secondary">Refresh</Button>}
                  />
                  <EmptyState
                    variant="dashed"
                    icon={<ShieldCheck />}
                    title="Checks complete"
                    description="No design-system drift was detected."
                    action={
                      <Button onClick={() => setModalOpen(true)}>
                        Open dialog
                        <ArrowRight aria-hidden="true" />
                      </Button>
                    }
                  />
                </div>
              </section>
            ) : null}
          </Stack>
        </div>
      </Stack>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Shared dialog"
        description="Focus, escape handling, backdrop dismissal, and return focus use one implementation."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p className="m-0 text-sm leading-6 text-[var(--muted)]">
          This modal is rendered by the shared overlay primitive.
        </p>
      </Modal>
    </PageShell>
  );
}
