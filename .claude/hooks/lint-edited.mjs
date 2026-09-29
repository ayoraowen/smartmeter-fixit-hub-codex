// PostToolUse hook: run ESLint on the .ts/.tsx file Claude just edited.
// Exit code 2 sends stderr back to Claude so it can fix the errors.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const eslint = path.join(root, "node_modules", "eslint", "bin", "eslint.js");

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let file;
  try {
    file = JSON.parse(input).tool_input?.file_path;
  } catch {
    process.exit(0);
  }

  const skip =
    !file ||
    !/\.(ts|tsx)$/.test(file) ||
    /[\\/](node_modules|dist)[\\/]/.test(file) ||
    /[\\/]src[\\/]components[\\/]ui[\\/]/.test(file) ||
    !existsSync(file) ||
    !existsSync(eslint);
  if (skip) process.exit(0);

  try {
    execFileSync(process.execPath, [eslint, "--quiet", file], { cwd: root, stdio: "pipe" });
  } catch (error) {
    process.stderr.write(
      `ESLint errors in ${path.relative(root, file)} (some may predate this edit):\n${error.stdout}${error.stderr}`,
    );
    process.exit(2);
  }
});
