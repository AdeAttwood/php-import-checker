'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log('php-import-checker" is now active!');

    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            return;
        }

        triggerUpdateDecorations();

        var timeout = null;
        function triggerUpdateDecorations() {
            if (timeout) {
                clearTimeout(timeout);
            }
            
            timeout = setTimeout(updateDecorations, 500);
        }

        const unusedNamespaceDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255,0,0, 0.5)',
            light: {
                borderColor: 'darkblue'
            },
            dark: {
                borderColor: 'lightblue'
            }
        });

        let normalDecoration = vscode.window.createTextEditorDecorationType(<vscode.DecorationRenderOptions> {
            textDecoration: 'none; opacity: 1'
        });
        
        function updateDecorations() {
            if (!editor) {
                return;
            }

            const regEx = /use (.*);/g;
            const text = editor.document.getText();
            let smallNumbers: vscode.DecorationOptions[] = [];
            let match = regEx.exec(text);
            
            while (match = regEx.exec(text)) {
                let splitNameSpace = match[1].split('\\');
                let className = splitNameSpace[splitNameSpace.length - 1];
                
                let found = (text.match(new RegExp(className, 'g')) || []).length;

                const startPos = editor.document.positionAt(match.index);
                const endPos = editor.document.positionAt(match.index + match[0].length);
                const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Unused class' };

                if (match[0].length && found < 2) {
                    smallNumbers.push(decoration);
                } else {
                    highlightSelections(editor, []);
                }
            }
            editor.setDecorations(unusedNamespaceDecorationType, smallNumbers);
        }

        function highlightSelections(editor: vscode.TextEditor, selections: vscode.Range[]) {
            if (!normalDecoration) return;

            let ranges: vscode.Range[] = [];
            let context = 0;
            
            selections.forEach(s => {
                if (context < 0) {
                    ranges.push(s);
                }
                else {
                    ranges.push(new vscode.Range(
                        new vscode.Position(Math.max(s.start.line - context, 0), 0),
                        new vscode.Position(s.end.line + context, Number.MAX_VALUE)
                    ));
                }
            });
            editor.setDecorations(normalDecoration, ranges);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}