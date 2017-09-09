const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

var lastFolder = '';
const nodeModules = 'node_modules';

const showError = message => vscode.window.showErrorMessage(`Search node_modules: ${message}`);

exports.activate = context => {
    const searchNodeModules = vscode.commands.registerCommand('extension.search', () => {
        if (!vscode.workspace.rootPath) {
            return showError('You must have a workspace opened.');
        }

        const preferences = vscode.workspace.getConfiguration('search-node-modules');

        const useLastFolder = preferences.get('useLastFolder', false);
        const nodeModulesPath = preferences.get('path', nodeModules);

        const workspaceName = vscode.workspace.rootPath.split(path.sep).pop();
        const workspaceNodeModules = path.join(workspaceName, nodeModulesPath);

        const searchPath = folderPath => {
            lastFolder = '';

            const folderFullPath = path.join(vscode.workspace.rootPath, folderPath);

            fs.readdir(folderFullPath, (readErr, files) => {
                if (readErr) {
                    if (folderPath === nodeModulesPath) {
                        return showError('No node_modules folder in this workspace.');
                    }

                    return showError(`Unable to open folder ${folderPath}`);
                }

                if (folderPath !== nodeModulesPath) {
                    files.push('');
                    files.push(workspaceNodeModules);
                    files.push('..');
                }

                vscode.window.showQuickPick(files, {
                    placeHolder: path.join(workspaceName, folderPath)
                })
                .then(selected => {
                    if (selected === workspaceNodeModules) {
                        searchPath(nodeModulesPath);
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

        const startingPath = useLastFolder && lastFolder ? lastFolder : nodeModulesPath;

        searchPath(startingPath);
    });

    context.subscriptions.push(searchNodeModules);
};

exports.deactivate = () => {};
