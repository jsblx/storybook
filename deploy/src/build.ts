import { spawnSync } from "child_process";
import { config } from "../config";

export default async () => {
  const environment = {
    ...process.env,
  };

  const defaults = {
    cwd: config.sourcePath,
    env: environment,
  };

  console.log("Building static files..");
  spawnSync("yarn", ["install"], defaults);
  spawnSync("yarn", ["build-storybook", "-o", "build"], defaults);
  console.log("Building static files..done");
};
