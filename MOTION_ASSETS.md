# Shared Motion assets

Fonts, Material Symbols names and shape exports are synchronized from the pinned release in `motion-assets.lock.json`. The canonical collection, provenance and gallery are at https://github.com/feldmandev/motion-assets.

Run `python scripts/update_motion_assets.py` to reproduce the locked assets, or add `--update` to select the latest release. All selected hashes are validated before any files are written. Normal builds do not download assets. The scheduled workflow opens an update PR when a new release is published; GitHub repository policy must allow Actions-created PRs.

The UI embeds Feldman Font and Material Symbols Rounded. Shared shape catalogs/SVGs are bundled below the Motion asset resource root, preserving their `assets/shapes/...` paths; native rounded-polygon morphing remains platform-specific. Source and license notices accompany the resources.
