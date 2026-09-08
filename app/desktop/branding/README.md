# Approved Ad Fontes NT application icon

AFNT-107 · 2026-09-08. Larry selected the AF open-book design: “Ok, Let's go with that (with the AF).” This is the application icon, not a replacement Ordinary Means organizational logo.

- `af-approved-preview.png`: exact approved image, SHA-256 `999e15a9f8e01e7f4d9c60abd955a9f3062f42ff201b1bbe18e95d35742858af`.
- `af-icon.png`: production RGBA master, 1254×1254, SHA-256 `0f789a70b8631c135505866d1b3453ff96ab9688144610f4ec8d329ab45d4b7c`.
- Built-in image generation produced the preview. Its checkerboard was painted RGB rather than alpha. After an unsuccessful image-tool cleanup, Larry explicitly authorized a small image-processing script to remove the background.
- Cleanup used Pillow: flood-fill from (0,0), four-connected exterior pixels where blue minus red is less than 50; set their alpha to zero; feather the alpha boundary with Gaussian radius 0.35 source pixels. Original RGB artwork is preserved exactly. No letters, page shapes or colors were redrawn.
- Inspected 128, 64, 32 and 16 pixel previews. The smallest icon retains the book silhouette; letter detail naturally reduces.

## Generation prompt

Edit the original navy/ivory/brass open-book icon into one alternative integrating uppercase AF. Preserve the navy rounded-square tile, ivory book and brass bookmark. Place a bold serif navy A in the left page and matching F in the right page, optically balanced around the bookmark. Sturdy letterforms, no fine flourishes, no extra text or symbols. Keep the palette and book silhouette.

## Platform files

Generate using the locked Tauri CLI from the repository root:

```sh
node app/node_modules/@tauri-apps/cli/tauri.js icon app/desktop/branding/af-icon.png -o /tmp/af-icons
```

Copy only `32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.png`, `icon.icns`, and `icon.ico` to `app/desktop/src-tauri/icons/`. Mobile/store variants are unused. PNG/ICNS/ICO icon resources are tracked application assets; installers and frontend/corpus build outputs remain ignored.

The common bundle config selects Mac ICNS and Linux PNG resources. Windows uses the multi-resolution ICO for the app, setup and uninstaller. Mac seals the complete bundle with an ad-hoc signature; it is not Developer ID signed or notarized. No website favicon or social card is changed by this desktop packaging update.
