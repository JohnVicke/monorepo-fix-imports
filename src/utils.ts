const supportedLangs = [
  'typescript',
  'typescriptreact',
  'javascript',
  'javascriptreact'
];

export const isSupportedLanguage = (languageId?: string) => {
  if (!languageId) return false;
  return supportedLangs.includes(languageId);
};

export const getImportFromMessage = (message: string) => {
  const patt = /'((?:\\.|[^'])*)'|"((?:\\.|[^"])*)"/gim;
  const matches = patt.exec(message);
  if (!matches) return;
  return matches[1];
};

export const getStartIndex = (line: string, packageImport: string): number => {
  const matchWord = packageImport.slice(
    packageImport.lastIndexOf('/'),
    packageImport.length
  );
  return line.indexOf(matchWord) + matchWord.length;
};

export const getRelativePackagePath = (line: string, packageImport: string) => {
  console.log({ line: line, package: packageImport });
  const start = getStartIndex(line, packageImport);
  const end = line.lastIndexOf("'");
  return line.slice(start, end);
};
