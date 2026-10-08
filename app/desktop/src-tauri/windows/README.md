# Windows installed-name compatibility

`installer.nsi` is the Tauri CLI 2.11.4 NSIS template from https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.11.4/crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi . Upstream SHA-256: `20f4ecc730defb71f1342eaeaec4021df13be3d843abba0effe88ea5835fa079`. Apart from the attribution header, only `UNINSTKEY` and `MANUPRODUCTKEY` differ: they retain the published Ad Fontes NT registry identity while all display text uses the current product name. Re-audit this small diff when updating Tauri. License: Apache-2.0 OR MIT, copied alongside this file.

`rename-shortcuts.nsh` changes only old shortcuts whose target matches this installation. The updater does not otherwise recreate shortcuts. Existing install folders, executable name, bundle ID, local data and updater keys remain unchanged. Fresh installs use the new product-name folder.
