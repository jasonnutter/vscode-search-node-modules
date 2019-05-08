const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { findParentModules } = require('./find-parent-modules');

var lastFolder = '';
var lastWorkspaceName = '';
var lastWorkspaceRoot = '';

const nodeModules = 'node_modules';

const showError = message => vscode.window.showErrorMessage(`Search node_modules: ${message}`);

exports.activate = context => {
    const searchNodeModules = vscode.commands.registerCommand('extension.search', () => {
        const preferences = vscode.workspace.getConfiguration('search-node-modules');

        const useLastFolder = preferences.get('useLastFolder', false);
        const nodeModulesPath = preferences.get('path', nodeModules);
        const searchParentModules = preferences.get('searchParentModules', true);

        const searchPath = (workspaceName, workspaceRoot, folderPath) => {
            // Path to node_modules in this workspace folder
            const workspaceNodeModules = path.join(workspaceName, nodeModulesPath);

            // Reset last folder
            lastFolder = '';
            lastWorkspaceName = '';
            lastWorkspaceRoot = '';

            // Path to current folder
            const folderFullPath = path.join(workspaceRoot, folderPath);

            // Read folder, built quick pick with files/folder (and shortcuts)
            fs.readdir(folderFullPath, async (readErr, files) => {
                if (readErr) {
                    if (folderPath === nodeModulesPath) {
                        return showError('No node_modules folder in this workspace.');
                    }

                    return showError(`Unable to open folder ${folderPath}`);
                }

                const isParentFolder = folderPath.includes('..');
                const options = files;

                // If searching in root node_modules, also include modules from parent folders, that are outside of the workspace
                if (folderPath === nodeModulesPath) {
                    if (searchParentModules) {
                        const parentModules = await findParentModules(workspaceRoot, nodeModulesPath);
                        options.push(...parentModules);
                    }
                } else  {
                    // Otherwise, show option to move back to root
                    options.push('');
                    options.push(workspaceNodeModules);

                    // If current folder is not outside of the workspace, also add option to move a step back
                    if (!isParentFolder) {
                        options.push('..');
                    }
                }


                vscode.window.showQuickPick(options, {
                    placeHolder: path.format({ dir: workspaceName, base: folderPath})
                })
                .then(selected => {
                    // node_modules shortcut selected
                    if (selected === workspaceNodeModules) {
                        searchPath(workspaceName, workspaceRoot, nodeModulesPath);
                    } else {
                        const selectedPath = path.join(folderPath, selected);
                        const selectedFullPath = path.join(workspaceRoot, selectedPath);

                        // If selected is a folder, traverse it,
                        // otherwise open file.
                        fs.stat(selectedFullPath, (statErr, stats) => {
                            if (stats.isDirectory()) {
                                searchPath(workspaceName, workspaceRoot, selectedPath);
                            } else {
                                lastWorkspaceName = workspaceName;
                                lastWorkspaceRoot = workspaceRoot;
                                lastFolder = folderPath;

                                vscode.workspace.openTextDocument(selectedFullPath, selectedPath)
                                .then(vscode.window.showTextDocument);
                            }
                        });
                    }
                });
            });
        };

        // Open last folder if there is one
        if (useLastFolder && lastFolder) {
            return searchPath(lastWorkspaceName, lastWorkspaceRoot, lastFolder);
        }

        // Must have at least one workspace folder
        if (!vscode.workspace.workspaceFolders.length) {
            return showError('You must have a workspace opened.');
        }

        // If in a multifolder workspace, prompt user to select which one to traverse.
        if (vscode.workspace.workspaceFolders.length > 1) {
            vscode.window.showQuickPick(vscode.workspace.workspaceFolders.map(folder => ({
                label: folder.name,
                folder
            })), {
                placeHolder: 'Select workspace folder'
            })
                .then(selected => {
                    if (selected) {
                        searchPath(selected.label, selected.folder.uri.fsPath, nodeModulesPath);
                    }
                });
        } else {
            // Otherwise, use the first one
            const folder = vscode.workspace.workspaceFolders[0];
            searchPath(folder.name, folder.uri.fsPath, nodeModulesPath);
        }
    });

    context.subscriptions.push(searchNodeModules);
};

exports.deactivate = () => {};
