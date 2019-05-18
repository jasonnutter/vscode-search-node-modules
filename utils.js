const vscode = require('vscode');

const formatMsg = message => `Search node_modules: ${message}`;
const showError = message => vscode.window.showErrorMessage(formatMsg(message));
const showWarning = message => vscode.window.showWarningMessage(formatMsg(message));

module.exports = { showError, showWarning };
