# CHANGELOG

# 1.3.0

* Added: Initial support for multi-root workspaces.

# 1.2.0

* Added: `search_node_modules.path` option to specify the path to your `node_modules` folder.

# 1.1.0

* Added: `search-node-modules.useLastFolder` option to default the file picker to the folder of the last opened file. Turned off by default, please provide feedback!
* Added: A new entry in the file list (separated by a blank entry) which when picked, takes you back to the `node_modules` folder for your workspace (the workspace folder name has been added to the file picker placeholder to make it more clear that this option takes you back to that folder).
* Fixed: Added error handling for invalid folders (e.g. if you try to launch the file picker when there isn't a `node_modules` folder in your workspace).

# 1.0.2

* Fixed: Ensure keyboard shortcut only fires when terminal is not focused. This was breaking the built-in shortcut to clear the integrated terminal.

## 1.0.0

* Initial release.
