// Watches data/ and site/ and rebuilds dist/ on every change.
import { watch } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const BUILD = join(ROOT, "scripts", "build.mjs");

let timer = null;
let building = false;
let pending = false;

function build() {
  if (building) { pending = true; return; }
  building = true;
  const p = spawn(process.execPath, [BUILD], { stdio: "inherit" });
  p.on("exit", () => {
    building = false;
    if (pending) { pending = false; build(); }
  });
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(build, 100);
}

for (const dir of ["data", "site"]) {
  watch(join(ROOT, dir), { recursive: true }, schedule);
}

console.log("👀 Watching data/ and site/ — rebuilding dist/ on changes.");
build();
