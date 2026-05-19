import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, "public", "mockups", "catalog.json"), "utf8"),
);

for (const m of catalog.mockups) {
  if (!m.backgroundSource) continue;
  const dir = path.join(root, "public", "mockups", m.id);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, "background.jpg");
  const metaDest = path.join(dir, "metadata.json");
  process.stdout.write(`${m.id}… `);
  try {
    const res = await fetch(m.backgroundSource);
    if (!res.ok) throw new Error(String(res.status));
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    fs.writeFileSync(
      metaDest,
      JSON.stringify(
        {
          name: m.name,
          mode: m.mode,
          placement: m.placement,
          feather: m.feather,
          wallTone: m.wallTone,
          blend: m.blend,
        },
        null,
        2,
      ),
    );
    console.log("ok");
  } catch (e) {
    console.log("FAIL", e.message);
  }
}
