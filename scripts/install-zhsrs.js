const { spawnSync } = require("child_process");
const fs = require("fs");

[
  "../lib/custom-markdown"
].forEach((p) => {
  [
    "admin",
    "web"
  ].forEach((folder) => {
    if (fs.existsSync(`${folder}/package-lock.json`)) {
      spawnSync("npm", ["install", p, "-D"], {
        cwd: folder,
        stdio: "inherit"
      });
    }
  });
});