const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

var lastFolder = '';
const nodeModules = 'node_modules';

exports.activate = context => {
    const searchNodeModules = vscode.commands.registerCommand('extension.search', () => {
        if (!vscode.workspace.rootPath) {
            return vscode.window.showErrorMessage('Search node_modules: You must have a workspace opened.');
        }

        const preferences = vscode.workspace.getConfiguration('search-node-modules');

        const useLastFolder = preferences.get('useLastFolder', false);

        const workspaceName = vscode.workspace.rootPath.split('/').pop();
        const workspaceNodeModules = path.join(workspaceName, nodeModules);

        const searchPath = folderPath => {
            lastFolder = '';

            const folderFullPath = path.join(vscode.workspace.rootPath, folderPath);

            fs.readdir(folderFullPath, (readErr, files) => {
                if (folderPath !== nodeModules) {
                    files.push('');
                    files.push(workspaceNodeModules);
                    files.push('..');
                }

                vscode.window.showQuickPick(files, {
                    placeHolder: folderPath
                })
                .then(selected => {
                    if (selected === workspaceNodeModules) {
                        searchPath(nodeModules);
                    } else {
                        const selectedPath = path.join(folderPath, selected);
                        const selectedFullPath = path.join(vscode.workspace.rootPath, selectedPath);

                        fs.stat(selectedFullPath, (statErr, stats) => {
                            if (stats.isDirectory()) {
                                searchPath(selectedPath);
                            } else {
                                lastFolder = folderPath;
                                vscode.workspace.openTextDocument(selectedFullPath, selectedPath)
                                .then(vscode.window.showTextDocument);
                            }
                        });
                    }
                });
            });
        };

        const startingPath = useLastFolder && lastFolder ? lastFolder : nodeModules;

        searchPath(startingPath);
    });

    context.subscriptions.push(searchNodeModules);
};

exports.deactivate = () => {};
