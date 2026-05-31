const normalizeText = (value) => String(value || '').trim();

export const slugifyHeading = (heading) =>
  normalizeText(heading)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const buildMarkdownSection = (heading, body) =>
  `## ${normalizeText(heading)}\n\n${normalizeText(body)}`.trim();

export const buildMarkdownDocument = ({ title = 'MineShield Report', sections = [] } = {}) => {
  const lines = [`# ${normalizeText(title)}`];

  sections.forEach((section) => {
    if (!section) {
      return;
    }

    lines.push(buildMarkdownSection(section.heading, section.body));
  });

  return lines.join('\n\n');
};

export const buildDocumentIndex = (sections = []) =>
  sections
    .map((section) => ({
      heading: normalizeText(section?.heading),
      slug: slugifyHeading(section?.heading),
    }))
    .filter((section) => section.heading);

export default {
  buildDocumentIndex,
  buildMarkdownDocument,
  buildMarkdownSection,
  slugifyHeading,
};
