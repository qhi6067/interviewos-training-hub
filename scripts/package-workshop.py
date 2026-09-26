"""Package only authored starter files, never installed dependencies."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
source = root / "examples/react-task-manager"
target = root / "dist/downloads/react-task-manager.zip"
files = ["package.json", "package-lock.json", "index.html", "vite.config.js", "README.md",
         "src/main.jsx", "src/App.jsx", "src/helpers.js", "src/style.css"]
with ZipFile(target, "w", ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(source / name, name)
print(f"Packaged {len(files)} starter files: {target.name}")
