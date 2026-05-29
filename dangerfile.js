const { danger, fail, warn, message } = require("danger");
const pr = danger.github.pr;
const modifiedFiles = danger.git.modified_files;
const createdFiles = danger.git.created_files;
const allChangedFiles = [...modifiedFiles, ...createdFiles];
// Accept alphanumeric team IDs and optional numeric ticket suffix:
// [9DWW]-title, [A2Y7]-title, or [TP-42]-title
const taskIdPattern = /^\[[A-Z0-9]+(?:-\d+)?\]\s*-\s*.+/;

if (!taskIdPattern.test(pr.title)) {
  fail(
    "**Invalid or missing Task ID in PR title.**\n\n" +
      "PR title must follow one of these formats:\n" +
      "- `[ALPHANUMERIC_ID]-your-title`\n" +
      "- `[TEAM-123]-your-title`\n\n" +
      "Valid: `[9DWW]-critical task enforcement`, `[A2Y7]-system health check`, `[TP-42]-add login page`\n" +
      "Invalid: `9DWW-critical task enforcement`, `[9DWW] critical task enforcement`, `#42 update`"
  );
}

if (!pr.body || pr.body.trim().length < 30) {
  fail(
    "**PR description is missing or too short.**\n\n" +
      "Every PR must include:\n" +
      "- What was done\n" +
      "- How it was tested\n\n" +
      "A one-liner is not enough."
  );
}

const body = (pr.body || "").toLowerCase();
const haswhatSection = /what.*done|changes|summary|description/i.test(pr.body);
const hasTestSection = /test(ed|ing|s)?|how.*test|verified/i.test(pr.body);

if (!haswhatSection) {
  warn(
    "**PR description is missing a 'What was done' section.**\n\n" +
      "Add a brief summary of the changes you made."
  );
}

if (!hasTestSection) {
  warn(
    "**PR description is missing testing steps.**\n\n" +
      "Describe how you tested this change. Manual steps, test commands, or screenshots all count."
  );
}
const uiFilePatterns = [
  /\.(jsx|tsx)$/,
  /\.(css|scss|sass|less)$/,
  /\/components\//,
  /\/pages\//,
  /\/views\//,
];

const hasUIChanges = allChangedFiles.some((f) =>
  uiFilePatterns.some((p) => p.test(f))
);

const hasScreenshot =
  /!\[.*\]\(.*\)|<img/i.test(pr.body) ||
  /screenshot|screen shot|preview|before.*after/i.test(pr.body);

if (hasUIChanges && !hasScreenshot) {
  warn(
    "**UI files were changed but no screenshots were provided.**\n\n" +
      "Changed UI files:\n" +
      allChangedFiles
        .filter((f) => uiFilePatterns.some((p) => p.test(f)))
        .map((f) => `- \`${f}\``)
        .join("\n") +
      "\n\nPlease attach before/after screenshots or a screen recording."
  );
}
// No enforced protected-target flow — repository uses `master` as primary branch

const LINES_CHANGED_LIMIT = 2000;
const linesChanged =
  (danger.github.pr.additions || 0) + (danger.github.pr.deletions || 0);

if (linesChanged > LINES_CHANGED_LIMIT) {
  warn(
    `**This PR is very large (${linesChanged} lines changed).**\n\n` +
      "PRs over 2000 lines are significantly harder to review and more likely to introduce bugs.\n" +
      "Consider splitting it into smaller, focused PRs if possible."
  );
}

const isDraft = pr.draft;
const hasWIPInTitle = /\bWIP\b|work.in.progress|\[WIP\]/i.test(pr.title);

if (isDraft || hasWIPInTitle) {
  fail(
    "**This PR is marked as a Work In Progress.**\n\n" +
      "Remove the WIP label and mark it ready for review before submitting."
  );
}


const sensitiveFiles = [
  ".env",
  "dangerfile.js",
  ".github/workflows",
];

const touchedSensitive = allChangedFiles.filter((f) =>
  sensitiveFiles.some((s) => f.includes(s))
);

if (touchedSensitive.length > 0) {
  warn(
    "**Sensitive files were modified:**\n\n" +
      touchedSensitive.map((f) => `- \`${f}\``).join("\n") +
      "\n\nMake sure these changes are intentional and reviewed carefully."
  );
}

message(
  "🔍 **Danger JS review complete.**\n\n" +
    "Failures must be resolved before merge. Warnings are advisory but should be addressed."
);