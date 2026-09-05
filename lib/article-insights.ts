type ArticleInsightInput = {
  title: string;
  summary: string;
  tags: string[];
};

export type ArticleHeading = {level: 2|3; text: string};

const cleanText = (value: string) => value.replace(/\s+/g, ' ').trim();

const withoutAttribution = (value: string) =>
  value
    .replace(/\s*(?:GTOWizard|GTO Wizard)(?:\s*,\s*(?:GTOWizard|GTO Wizard))*\s*$/i, '')
    .trim();

const splitSentences = (value: string) =>
  value.match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/g)?.map(cleanText).filter(Boolean) ?? [];

const shorten = (value: string, maxLength = 180) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).replace(/[\s、。,.!?！？]+$/g, '')}…`;
};

/**
 * Builds a concise outline fallback from the source summary.
 * The source feed only stores an excerpt, so it stays grounded in that
 * excerpt instead of inventing headings that are not present.
 */
function buildArticleOutline({title, summary, tags}: ArticleInsightInput) {
  const sourceText = withoutAttribution(cleanText(summary));
  const sentences = splitSentences(sourceText);
  const points = sentences
    .filter(sentence => sentence.length >= 18)
    .slice(0, 3)
    .map(sentence => shorten(sentence));

  if (points.length > 0) return points;

  const fallback = sourceText || `${title}の概要と実践ポイントを紹介します。`;
  const tagHint = tags.length > 0 ? `（${tags.join('・')}）` : '';
  return [shorten(`${fallback}${tagHint}`)];
}

export function cleanArticleSummary(summary: string) {
  return withoutAttribution(cleanText(summary));
}

export function buildFallbackHeadings(input: ArticleInsightInput): ArticleHeading[] {
  return buildArticleOutline(input).map(text => ({level: 2, text}));
}
