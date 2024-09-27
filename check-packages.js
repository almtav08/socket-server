// make a script that checks if all the packages are installed using the package.json file. If the pacakges are not installed, then install them. It should work with any package manager (npm, yarn, pnpm)
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const userAgent = process.env.npm_config_user_agent || "";
let packageManager = "npm";

if (userAgent.includes("pnpm")) {
  packageManager = "pnpm";
} else if (userAgent.includes("yarn")) {
  packageManager = "yarn";
}

console.log(`Checking dependencies using ${packageManager}...`);

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

const dependencies = packageJson.dependencies ? Object.keys(packageJson.dependencies) : [];
const devDependencies = packageJson.devDependencies ? Object.keys(packageJson.devDependencies) : [];

dependencies.forEach((dep) => {
  const packagePath = path.join("node_modules", dep);
  if (fs.existsSync(packagePath)) {
    console.log(`Package "${dep}" is installed.`);
  } else {
    console.log(`Installing "${dep}".`);
    exec(`${packageManager} install ${dep}`);
  }
});

devDependencies.forEach((dep) => {
  const packagePath = path.join("node_modules", dep);
  if (fs.existsSync(packagePath)) {
    console.log(`Package "${dep}" is installed.`);
  } else {
    console.log(`Package "${dep}" is NOT installed.`);
    exec(`${packageManager} install ${dep} -D`);
  }
});