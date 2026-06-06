import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const loadModule = async (relativePath) => {
  const moduleUrl = pathToFileURL(path.join(projectRoot, relativePath)).href;
  const module = await import(moduleUrl);
  return module.default || module;
};

const findMissingKeys = (baseValue, candidateValue, prefix = '') => {
  if (Array.isArray(baseValue)) {
    return Array.isArray(candidateValue) ? [] : [prefix];
  }

  if (baseValue && typeof baseValue === 'object') {
    if (!candidateValue || typeof candidateValue !== 'object' || Array.isArray(candidateValue)) {
      return [prefix];
    }

    return Object.keys(baseValue).flatMap((key) =>
      findMissingKeys(
        baseValue[key],
        candidateValue[key],
        prefix ? `${prefix}.${key}` : key
      )
    );
  }

  return candidateValue === undefined ? [prefix] : [];
};

const main = async () => {
  const [{ LANGUAGE_OPTIONS, TRANSLATIONS }, englishPack] = await Promise.all([
    loadModule('src/i18n/index.js'),
    loadModule('src/i18n/translations/en.js'),
  ]);

  const visibleLanguages = LANGUAGE_OPTIONS.filter((option) => option.value !== 'system').map(
    (option) => option.value
  );

  let failures = 0;

  for (const languageCode of visibleLanguages) {
    if (!Object.prototype.hasOwnProperty.call(TRANSLATIONS, languageCode)) {
      console.error(`Missing translation pack for exposed language "${languageCode}".`);
      failures += 1;
      continue;
    }

    const missingKeys = findMissingKeys(englishPack, TRANSLATIONS[languageCode]);

    if (missingKeys.length > 0) {
      console.error(
        `Translation coverage failed for "${languageCode}" with ${missingKeys.length} missing keys.`
      );
      console.error(missingKeys.slice(0, 50).join('\n'));
      failures += 1;
      continue;
    }

    console.log(`translation:${languageCode}:ok`);
  }

  if (failures > 0) {
    process.exit(1);
  }
};

main().catch((error) => {
  console.error('Translation validation failed unexpectedly:', error);
  process.exit(1);
});
