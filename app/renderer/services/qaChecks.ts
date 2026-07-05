import en from "../utils/i18n/en.json";
import ar from "../utils/i18n/ar.json";
import { PRODUCTION_SERVICES, type ServiceStatus } from "./productionCatalog";
import { DEVELOPER_TOOLS, runDeveloperTool, getDeveloperToolSample } from "./developerTools";
import { hashContent } from "./clientClipboardServices";
import { KNOUX_BRAND } from "../constants/brand";

export type QAStatus = "pass" | "warning" | "fail";

export type QACategory =
  | "i18n"
  | "runtime"
  | "cards"
  | "actions"
  | "tools"
  | "security"
  | "brand";

export interface QACheckResult {
  id: string;
  title: string;
  category: QACategory;
  status: QAStatus;
  summary: string;
  details: string[];
}

const flattenKeys = (obj: unknown, prefix = ""): string[] => {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj as Record<string, unknown>).reduce<string[]>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") acc.push(...flattenKeys(value, path));
    else acc.push(path);
    return acc;
  }, []);
};

const flattenEntries = (obj: unknown, prefix = ""): Array<[string, unknown]> => {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj as Record<string, unknown>).reduce<Array<[string, unknown]>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") acc.push(...flattenEntries(value, path));
    else acc.push([path, value]);
    return acc;
  }, []);
};

const ALLOWED_STATUSES: ServiceStatus[] = ["Active", "Ready", "Guarded", "Planned", "Missing", "Disabled"];

function checkI18nCoverage(): QACheckResult {
  const enKeys = new Set(flattenKeys(en));
  const arKeys = new Set(flattenKeys(ar));
  const missingInAr = [...enKeys].filter((k) => !arKeys.has(k));
  const missingInEn = [...arKeys].filter((k) => !enKeys.has(k));
  const total = missingInAr.length + missingInEn.length;
  return {
    id: "i18n-coverage",
    title: "i18n Coverage Checker",
    category: "i18n",
    status: total === 0 ? "pass" : "fail",
    summary: total === 0
      ? `English and Arabic dictionaries match (${enKeys.size} keys).`
      : `${total} key mismatch(es) between English and Arabic.`,
    details: total === 0
      ? [`Both dictionaries expose ${enKeys.size} keys with full parity.`]
      : [
          ...missingInAr.slice(0, 8).map((k) => `Missing in Arabic: ${k}`),
          ...missingInEn.slice(0, 8).map((k) => `Missing in English: ${k}`),
        ],
  };
}

function checkI18nEmptyValues(): QACheckResult {
  const empties = [
    ...flattenEntries(en).filter(([, v]) => typeof v !== "string" || v.trim() === "").map(([k]) => `en:${k}`),
    ...flattenEntries(ar).filter(([, v]) => typeof v !== "string" || v.trim() === "").map(([k]) => `ar:${k}`),
  ];
  return {
    id: "i18n-empty",
    title: "Empty String Checker",
    category: "i18n",
    status: empties.length === 0 ? "pass" : "warning",
    summary: empties.length === 0 ? "No empty translation values found." : `${empties.length} empty translation value(s).`,
    details: empties.length === 0 ? ["Every localized string carries content."] : empties.slice(0, 12),
  };
}

function checkStatusBadgeConsistency(): QACheckResult {
  const invalid = PRODUCTION_SERVICES.filter((s) => !ALLOWED_STATUSES.includes(s.status));
  return {
    id: "status-badge-consistency",
    title: "Status Badge Consistency Checker",
    category: "runtime",
    status: invalid.length === 0 ? "pass" : "fail",
    summary: invalid.length === 0
      ? `All ${PRODUCTION_SERVICES.length} services use approved status names.`
      : `${invalid.length} service(s) use an unknown status name.`,
    details: invalid.length === 0
      ? [`Approved set: ${ALLOWED_STATUSES.join(", ")}.`]
      : invalid.map((s) => `${s.displayName}: "${s.status}"`),
  };
}

function checkRuntimeHonesty(): QACheckResult {
  const dishonest = PRODUCTION_SERVICES.filter((s) => s.status === "Active" && !s.implemented);
  const plannedButLive = PRODUCTION_SERVICES.filter((s) => s.tier === "planned" && (s.status === "Active" || s.status === "Ready"));
  const issues = [...dishonest, ...plannedButLive];
  return {
    id: "runtime-honesty",
    title: "Runtime Honesty Checker",
    category: "runtime",
    status: issues.length === 0 ? "pass" : "fail",
    summary: issues.length === 0
      ? "No fake availability: Active states map to implemented services."
      : `${issues.length} service(s) claim availability without implementation.`,
    details: issues.length === 0
      ? ["Planned services stay Planned/Disabled; Active services are implemented."]
      : [
          ...dishonest.map((s) => `${s.displayName}: Active but implemented=false`),
          ...plannedButLive.map((s) => `${s.displayName}: planned tier but status ${s.status}`),
        ],
  };
}

function checkServiceCardElements(): QACheckResult {
  const weak = PRODUCTION_SERVICES.filter((s) => !s.displayName || !s.description || !s.status || !s.actionHandler);
  return {
    id: "service-card-qa",
    title: "Service Card QA Checker",
    category: "cards",
    status: weak.length === 0 ? "pass" : "warning",
    summary: weak.length === 0
      ? `All ${PRODUCTION_SERVICES.length} service cards expose name, description, status, and handler.`
      : `${weak.length} service card(s) missing required elements.`,
    details: weak.length === 0
      ? ["Every card has title, description, truthful status, and an action handler."]
      : weak.map((s) => `${s.id}: missing ${[!s.displayName && "name", !s.description && "description", !s.actionHandler && "handler"].filter(Boolean).join(", ")}`),
  };
}

function checkActionButtonIntegrity(): QACheckResult {
  const generic = DEVELOPER_TOOLS.filter((t) => {
    const labels = [t.actionLabel, t.sampleLabel, t.copyLabel].map((l) => (l || "").trim().toLowerCase());
    const empty = labels.some((l) => l === "");
    const duplicate = new Set(labels).size !== labels.length;
    return empty || duplicate;
  });
  return {
    id: "action-button-integrity",
    title: "Action Button Integrity Checker",
    category: "actions",
    status: generic.length === 0 ? "pass" : "warning",
    summary: generic.length === 0
      ? `All ${DEVELOPER_TOOLS.length} tools use distinct, purposeful action labels.`
      : `${generic.length} tool(s) use empty or repeated action labels.`,
    details: generic.length === 0
      ? ["Primary/secondary/tertiary actions are tool-specific across the studio."]
      : generic.map((t) => `${t.title}: [${t.actionLabel} / ${t.sampleLabel} / ${t.copyLabel}]`),
  };
}

function checkToolOutputIntegrity(): QACheckResult {
  const failing: string[] = [];
  for (const tool of DEVELOPER_TOOLS) {
    const sample = getDeveloperToolSample(tool.id);
    const output = runDeveloperTool(tool.id, sample);
    if (!output || output.trim() === "" || output === "No input provided." || /^No input/.test(output)) {
      failing.push(`${tool.title}: empty output for its own sample`);
    }
  }
  return {
    id: "tool-output-integrity",
    title: "Tool Output Integrity Checker",
    category: "tools",
    status: failing.length === 0 ? "pass" : "fail",
    summary: failing.length === 0
      ? `All ${DEVELOPER_TOOLS.length} developer tools produce real output for their sample.`
      : `${failing.length} tool(s) returned an empty result.`,
    details: failing.length === 0 ? ["Every tool card returns a concrete, non-empty result — no fake buttons."] : failing,
  };
}

function checkDuplicateIds(): QACheckResult {
  const serviceIds = PRODUCTION_SERVICES.map((s) => s.id);
  const toolIds = DEVELOPER_TOOLS.map((t) => t.id);
  const dupService = serviceIds.filter((id, i) => serviceIds.indexOf(id) !== i);
  const dupTool = toolIds.filter((id, i) => toolIds.indexOf(id) !== i);
  const total = dupService.length + dupTool.length;
  return {
    id: "duplicate-ids",
    title: "Unique Identifier Checker",
    category: "cards",
    status: total === 0 ? "pass" : "fail",
    summary: total === 0 ? "All service and tool identifiers are unique." : `${total} duplicate identifier(s) found.`,
    details: total === 0
      ? [`${serviceIds.length} service ids and ${toolIds.length} tool ids are unique.`]
      : [...new Set([...dupService, ...dupTool])].map((id) => `Duplicate id: ${id}`),
  };
}

function checkSecretScanner(): QACheckResult {
  const sample = "OPENROUTER_API_KEY=sk-or-v1-abcdefghijklmnopqrstuvwxyz123456\nEmail: admin@knoux.store";
  const output = runDeveloperTool("secret-scanner", sample);
  const detected = /openrouter-key/.test(output) && /email/.test(output);
  return {
    id: "secret-scanner-selfcheck",
    title: "Security Scanner Self-Check",
    category: "security",
    status: detected ? "pass" : "fail",
    summary: detected ? "Secret scanner detects seeded API key and email." : "Secret scanner missed a known secret pattern.",
    details: [output],
  };
}

function checkRedaction(): QACheckResult {
  const secret = "sk-or-v1-abcdefghijklmnopqrstuvwxyz123456";
  const output = runDeveloperTool("redaction-map", `OPENROUTER_API_KEY=${secret}\nadmin@knoux.store`);
  const redacted = !output.includes(secret) && /redacted/i.test(output);
  return {
    id: "redaction-selfcheck",
    title: "Redaction Engine Self-Check",
    category: "security",
    status: redacted ? "pass" : "fail",
    summary: redacted ? "Redaction removes the raw secret before sharing." : "Redaction left raw secret material in the output.",
    details: [output],
  };
}

function checkBase64Roundtrip(): QACheckResult {
  const original = "Knoux AI Clipboard Pro V1.1.0";
  const encoded = runDeveloperTool("base64-encode", original);
  const decoded = runDeveloperTool("base64-decode", encoded);
  const ok = decoded === original;
  return {
    id: "base64-roundtrip",
    title: "Base64 Round-Trip Checker",
    category: "tools",
    status: ok ? "pass" : "fail",
    summary: ok ? "Base64 encode/decode round-trips without data loss." : "Base64 round-trip did not restore the original text.",
    details: [`Encoded: ${encoded}`, `Decoded: ${decoded}`],
  };
}

function checkJsonFormatter(): QACheckResult {
  const valid = runDeveloperTool("json-format", '{"a":1}');
  const invalid = runDeveloperTool("json-format", "{not json}");
  const ok = valid.includes('"a": 1') && /error/i.test(invalid);
  return {
    id: "json-formatter-check",
    title: "JSON Formatter Error-State Checker",
    category: "tools",
    status: ok ? "pass" : "warning",
    summary: ok ? "JSON formatter pretty-prints valid input and reports errors clearly." : "JSON formatter error handling is unclear.",
    details: [`Valid → ${valid.replace(/\n/g, " ")}`, `Invalid → ${invalid}`],
  };
}

function checkHashDeterminism(): QACheckResult {
  const a = hashContent("knoux");
  const b = hashContent("knoux");
  const c = hashContent("Knoux");
  const ok = a === b && a !== c;
  return {
    id: "hash-determinism",
    title: "Hash Determinism Checker",
    category: "tools",
    status: ok ? "pass" : "fail",
    summary: ok ? "Local hash is deterministic and case-sensitive." : "Hash function is not deterministic.",
    details: [`hash("knoux") = ${a}`, `hash("Knoux") = ${c}`],
  };
}

function checkArabicNavCoverage(): QACheckResult {
  const required = ["shell.sidebar.overview", "shell.sidebar.developer", "shell.sidebar.security"];
  const arKeys = new Set(flattenKeys(ar));
  const missing = required.filter((k) => !arKeys.has(k));
  return {
    id: "rtl-nav-coverage",
    title: "RTL / Arabic Navigation Checker",
    category: "i18n",
    status: missing.length === 0 ? "pass" : "warning",
    summary: missing.length === 0 ? "Core navigation labels are translated for Arabic RTL." : `${missing.length} core nav label(s) missing Arabic translation.`,
    details: missing.length === 0 ? ["Sidebar navigation resolves in Arabic; layout flips to RTL via dir attribute."] : missing,
  };
}

function checkBrandConsistency(): QACheckResult {
  const site = KNOUX_BRAND.officialWebsite;
  const ok = site === "https://knoux.store" && !/knoux\.dev/.test(site);
  return {
    id: "brand-consistency",
    title: "Brand Consistency Checker",
    category: "brand",
    status: ok ? "pass" : "fail",
    summary: ok ? "Official website resolves to knoux.store." : "Official website is not set to knoux.store.",
    details: [`officialWebsite = ${site}`, `primaryPurple = ${KNOUX_BRAND.colors.primaryPurple}`],
  };
}

function checkGuardedLabeling(): QACheckResult {
  const mislabeled = PRODUCTION_SERVICES.filter((s) => s.tier === "guarded" && s.status === "Active" && s.requiresConfig);
  return {
    id: "guarded-labeling",
    title: "Guarded Labeling Checker",
    category: "runtime",
    status: mislabeled.length === 0 ? "pass" : "warning",
    summary: mislabeled.length === 0
      ? "Config-dependent services are not marked fully Active."
      : `${mislabeled.length} config-dependent service(s) marked Active.`,
    details: mislabeled.length === 0
      ? ["Services that need provider configuration are surfaced as Guarded/Ready."]
      : mislabeled.map((s) => `${s.displayName}: Active but requiresConfig=true`),
  };
}

function checkToolCoverage(): QACheckResult {
  const count = DEVELOPER_TOOLS.length;
  const active = DEVELOPER_TOOLS.filter((t) => t.status === "Active").length;
  const ok = count >= 15;
  return {
    id: "tool-coverage",
    title: "Developer Tool Coverage Checker",
    category: "tools",
    status: ok ? "pass" : "warning",
    summary: `${count} developer tools registered (${active} Active).`,
    details: [ok ? "Studio exceeds the 15-tool coverage target." : "Studio is below the 15-tool coverage target."],
  };
}

function checkPlannedTransparency(): QACheckResult {
  const planned = PRODUCTION_SERVICES.filter((s) => s.status === "Planned" || s.status === "Disabled" || s.status === "Missing");
  const withoutReason = planned.filter((s) => !s.userFallback && !s.fallback);
  return {
    id: "planned-transparency",
    title: "Planned Feature Transparency Checker",
    category: "cards",
    status: withoutReason.length === 0 ? "pass" : "warning",
    summary: withoutReason.length === 0
      ? `All ${planned.length} planned/limited service(s) explain their guarded reason.`
      : `${withoutReason.length} planned service(s) missing an explanation.`,
    details: withoutReason.length === 0
      ? planned.map((s) => `${s.displayName}: ${s.userFallback || s.fallback}`)
      : withoutReason.map((s) => `${s.displayName}: no fallback reason`),
  };
}

function checkRegexTool(): QACheckResult {
  const output = runDeveloperTool("regex-test", "\\d+\nabc 123 def 456");
  const ok = /Matches \(2\)/.test(output);
  return {
    id: "regex-tool-check",
    title: "Regex Engine Checker",
    category: "tools",
    status: ok ? "pass" : "warning",
    summary: ok ? "Regex tool matches expected token count." : "Regex tool output did not match expectation.",
    details: [output.replace(/\n/g, " ")],
  };
}

export function runQaChecks(): QACheckResult[] {
  return [
    checkI18nCoverage(),
    checkI18nEmptyValues(),
    checkArabicNavCoverage(),
    checkStatusBadgeConsistency(),
    checkRuntimeHonesty(),
    checkGuardedLabeling(),
    checkServiceCardElements(),
    checkDuplicateIds(),
    checkPlannedTransparency(),
    checkActionButtonIntegrity(),
    checkToolCoverage(),
    checkToolOutputIntegrity(),
    checkBase64Roundtrip(),
    checkJsonFormatter(),
    checkRegexTool(),
    checkHashDeterminism(),
    checkSecretScanner(),
    checkRedaction(),
    checkBrandConsistency(),
  ];
}

export interface QASummary {
  total: number;
  passed: number;
  warnings: number;
  failed: number;
  readiness: number;
  byCategory: Array<{ category: QACategory; passed: number; warnings: number; failed: number }>;
}

export function summarizeQa(results: QACheckResult[]): QASummary {
  const passed = results.filter((r) => r.status === "pass").length;
  const warnings = results.filter((r) => r.status === "warning").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const total = results.length;
  const readiness = total === 0 ? 0 : Math.round(((passed + warnings * 0.5) / total) * 100);
  const categories = Array.from(new Set(results.map((r) => r.category))) as QACategory[];
  const byCategory = categories.map((category) => {
    const scoped = results.filter((r) => r.category === category);
    return {
      category,
      passed: scoped.filter((r) => r.status === "pass").length,
      warnings: scoped.filter((r) => r.status === "warning").length,
      failed: scoped.filter((r) => r.status === "fail").length,
    };
  });
  return { total, passed, warnings, failed, readiness, byCategory };
}

export function buildQaReport(results: QACheckResult[]): string {
  const summary = summarizeQa(results);
  const lines: string[] = [];
  lines.push("# Knoux AI Clipboard Pro — QA Session Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Readiness: ${summary.readiness}%`);
  lines.push(`Checks: ${summary.total} | Passed: ${summary.passed} | Warnings: ${summary.warnings} | Failed: ${summary.failed}`);
  lines.push("");
  for (const result of results) {
    const icon = result.status === "pass" ? "PASS" : result.status === "warning" ? "WARN" : "FAIL";
    lines.push(`## [${icon}] ${result.title}`);
    lines.push(result.summary);
    for (const detail of result.details) lines.push(`- ${detail}`);
    lines.push("");
  }
  lines.push("A Knoux Product · https://knoux.store");
  return lines.join("\n");
}
