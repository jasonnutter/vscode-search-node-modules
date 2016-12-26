const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

exports.activate = context => {
    const searchNodeModules = vscode.commands.registerCommand('extension.search', () => {
        const nodeModules = 'node_modules';

        const searchPath = folderPath => {
            const folderFullPath = path.join(vscode.workspace.rootPath, folderPath);

            fs.readdir(folderFullPath, (readErr, files) => {
                if (folderPath !== nodeModules) {
                    files.push('..');
                }

                vscode.window.showQuickPick(files, {
                    placeHolder: folderPath
                })
                .then(selected => {
                    const selectedPath = path.join(folderPath, selected);
                    const selectedFullPath = path.join(vscode.workspace.rootPath, selectedPath);

                    fs.stat(selectedFullPath, (statErr, stats) => {
                        if (stats.isDirectory()) {
                            searchPath(selectedPath);
                        } else {
                            vscode.workspace.openTextDocument(selectedFullPath, selectedPath)
                            .then(vscode.window.showTextDocument);
                        }
                    });
                });
            });
        };

        searchPath(nodeModules);
    });

    context.subscriptions.push(searchNodeModules);
};

exports.deactivate = () => {};
