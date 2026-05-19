export const SCORE_RULE_CATEGORIES = [
  "tech",
  "performance",
  "seo",
  "design",
  "content",
  "legal",
  "conversion",
] as const;

export const SCORE_RULE_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type ScoreRuleCategory = (typeof SCORE_RULE_CATEGORIES)[number];
export type ScoreRuleSeverity = (typeof SCORE_RULE_SEVERITIES)[number];
