# opencode-desktop-theme-patcher

Patches the Linux **OpenCode Desktop** app with a bordered, Claude Code-style chat look, a per-element color panel, and 17 preset color schemes.

> Unofficial. This is not affiliated with or endorsed by the OpenCode project. It modifies the installed app bundle, so use it at your own risk.

## What it changes

- **Markdown blocks:** code blocks, tables, blockquotes, inline code, headings and horizontal rules get clear borders, rounded corners and accent colors.
- **Assistant replies:** each reply sits in a bordered box with a left edge line.
- **Your messages:** a tinted bubble with its own border and fill.
- **Tool calls and permission prompts:** bordered cards with a tinted header.
- **Turn dividers:** a line between chat turns.
- **Colors panel:** a floating **Colors** button (bottom-right) with:
  - 17 presets, including Dracula, Nord, Catppuccin Mocha, Tokyo Night, Gruvbox Dark, One Dark, Solarized Dark, Monokai, Rosé Pine, Everforest, Kanagawa, Night Owl, GitHub Dark, Ayu Mirage, Material Palenight, Synthwave and Claude orange.
  - A color picker for every element: accent, accent text, base border, surfaces, heading underline, your message fill and border, quote fill, inline code fill, and the border of each block type.
  - Per-color reset (`×`) and a **Reset all** button.

Colors are saved in the app's local storage, so they persist between launches.

## Requirements

- Linux with the OpenCode Desktop package installed to `/usr/lib/opencode-desktop/` (the layout used by the Arch package).
- `node` and `npx` (the script uses `@electron/asar` through `npx`).
- `sudo` access, for the install step only.

## Usage

Clone the repo and run the script from its folder:

```bash
git clone https://github.com/<your-user>/opencode-desktop-theme-patcher.git
cd opencode-desktop-theme-patcher
./patch-desktop.sh            # builds /tmp/opencode/app.asar.new, does not install
./patch-desktop.sh --install  # builds and installs over /usr/lib/opencode-desktop/app.asar (needs sudo)
```

Then restart OpenCode Desktop and open the **Colors** panel.

### After an app update

Package updates overwrite `app.asar`. Run the script again with `--install` to re-apply the patch. The script detects the new file, saves it as the pristine copy, and patches it again.

## How it works

1. `patch-desktop.sh` saves a pristine copy of `app.asar` to `~/.local/share/opencode-desktop-theme/`.
2. It extracts the bundle to `/tmp/opencode/build`.
3. It appends `chat-blocks.css` to the app's main stylesheet.
4. It inserts `accent-switcher.js` as an inline script into `index.html`. This adds the Colors panel and applies saved colors as CSS variables.
5. It repacks the bundle, keeping the native `node-pty` module unpacked, and copies it into place when `--install` is given.

The stylesheet uses CSS variables such as `--oc-accent`, `--oc-b-user` and `--oc-f-user`. The panel sets these on the root element, so every block updates at once.

## Restoring the original app

```bash
sudo cp ~/.local/share/opencode-desktop-theme/app.asar.orig /usr/lib/opencode-desktop/app.asar
rm -f ~/.local/share/opencode-desktop-theme/installed.sha256
```

Restart OpenCode Desktop afterward. If the pristine copy is missing, reinstall the package.

## Files

| File | Purpose |
| --- | --- |
| `patch-desktop.sh` | Builds and optionally installs the patched bundle. |
| `chat-blocks.css` | Block, card and border styles, driven by CSS variables. |
| `accent-switcher.js` | The Colors panel, presets and local-storage persistence. |

## Notes

- Tested on OpenCode Desktop 2.2.1 with Electron 44 on Linux (Wayland). Other versions may need selector updates, because the styles target the app's internal `data-component` and `data-slot` names.
- The `/tmp/opencode` working directory is hard-coded in the script.
- The preset palettes were written by hand from each scheme's commonly published colors. Some shades may differ slightly from the official versions.

## License

No license has been chosen yet.
