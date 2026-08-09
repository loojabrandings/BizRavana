import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const migrationsDirectory = new URL("../../supabase/migrations/", import.meta.url);
const projectFile = (path) => new URL(`../../${path}`, import.meta.url);

test("SQL migrations are uniquely named and sequential", async () => {
  const names = (await readdir(migrationsDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  assert.ok(names.length > 0, "At least one migration is required.");
  const numbers = names.map((name) => {
    const match = /^(\d{3})_[a-z0-9_]+\.sql$/.exec(name);
    assert.ok(match, `Invalid migration filename: ${name}`);
    return Number(match[1]);
  });

  assert.equal(new Set(numbers).size, numbers.length, "Migration numbers must be unique.");
  assert.deepEqual(
    numbers,
    Array.from({ length: numbers.length }, (_, index) => index + 1),
    "Migration numbers must be contiguous from 001.",
  );

  for (const name of names) {
    const sql = await readFile(new URL(name, migrationsDirectory), "utf8");
    assert.ok(sql.trim().length > 20, `${name} is unexpectedly empty.`);
  }
});

test("migration documentation tracks the latest SQL file", async () => {
  const names = (await readdir(migrationsDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort();
  const latestName = names.at(-1);
  const latestNumber = latestName.slice(0, 3);
  const [readme, schema, roadmap] = await Promise.all([
    readFile(projectFile("README.md"), "utf8"),
    readFile(projectFile("DATABASE_SCHEMA.md"), "utf8"),
    readFile(projectFile("RELEASE_ROADMAP.md"), "utf8"),
  ]);

  assert.ok(readme.includes(`tracked through \`${latestName}\``));
  assert.ok(schema.includes(`Current migration range: \`001\` through \`${latestNumber}\``));
  assert.ok(roadmap.includes(`migration history for \`001–${latestNumber}\``));
});
