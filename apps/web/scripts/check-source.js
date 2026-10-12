import { access } from "node:fs/promises";
for (const file of ["src/main.jsx", "src/App.jsx", "src/styles.css"]) {
  await access(new URL(`../${file}`, import.meta.url));
}
console.log("Web JavaScript source check passed.");
