import {
  commands,
  Diagnostic,
  Disposable,
  ExtensionContext,
  languages,
  Range,
  TextDocument,
  TextEditorEdit,
  window,
  workspace
} from 'vscode';

import {
  getImportFromMessage,
  getRelativePackagePath,
  isSupportedLanguage
} from './utils';

import {
  COMMAND_NAME,
  CONFIG_OPTIONS,
  ESLINT_ERROR_MESSAGE,
  EXTENSION_NAME
} from './constants';

export const activate = (context: ExtensionContext) => {
  const fileSystemListener = new FileSystemListener();
  let disposable = commands.registerCommand(COMMAND_NAME, () => {
    const editor = window.activeTextEditor;
    if (editor?.document) fileSystemListener.onSaveFile(editor.document);
  });

  context.subscriptions.push(fileSystemListener);
  context.subscriptions.push(disposable);
};

export function deactivate() {}

class FileSystemListener {
  private _disposable: Disposable;

  constructor() {
    const editor = window.activeTextEditor;
    const subscriptions: Disposable[] = [];
    const config = workspace.getConfiguration(EXTENSION_NAME);
    // TODO: Support formatOnSave
    if (config.has(CONFIG_OPTIONS.FIX_ON_SAVE)) {
      if (isSupportedLanguage(window.activeTextEditor?.document.languageId)) {
        workspace.onWillSaveTextDocument(
          (e) => {
            if (!editor || e.document !== editor.document) return;
            e.waitUntil(this.onSaveFile(e.document));
          },
          this,
          subscriptions
        );
      }
    }
    this._disposable = Disposable.from.apply(this, subscriptions);
  }

  public onSaveFile(doc: TextDocument): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const errors = languages.getDiagnostics(doc.uri);
      if (!errors) return reject({ message: 'no errors found' });

      const monorepoErrors = errors.filter((error) =>
        error.message.includes(ESLINT_ERROR_MESSAGE)
      ) as Diagnostic[];
      if (monorepoErrors) {
        return resolve(this.fixImportMonorepoError(monorepoErrors, doc));
      }
    });
  }

  private fixImportMonorepoError = (
    errors: Diagnostic[],
    doc: TextDocument
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const editor = window.activeTextEditor;

      editor?.edit((builder: TextEditorEdit) => {
        errors.forEach((error: Diagnostic) => {
          const {
            range: { end, start },
            message
          } = error;

          const packageImport = getImportFromMessage(message);

          if (!packageImport)
            return reject({
              message: 'could not retrieve pacakage from import'
            });

          const relativePackagePath = getRelativePackagePath(
            doc.lineAt(start.line).text,
            packageImport
          );

          if (!relativePackagePath)
            reject({ message: 'could not find relative package path' });
          const replacement = `'${packageImport}${relativePackagePath}'`;
          // TODO: Allow prettier to organize imports before rebuilding editor
          return builder.replace(new Range(start, end), replacement);
        });
      });
      return resolve(true);
    });
  };

  public dispose() {
    this._disposable.dispose();
  }
}
