// @ts-ignore
import 'dotenv/config';

import fs from 'node:fs/promises'
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '~/lib/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
    const dir = path.join(__dirname, '../../.data');
    const compnanies = await fs.readdir(dir);
    for (const company of compnanies) {
      // Skip non-company directories/files
      const skipList = ['.git', '.gitignore', 'README.md', 'src', 'pom.xml'];
      if (skipList.includes(company)) continue;

      // 1. Capitalize the company name (folder names are lowercase-hyphenated)
      const capitalizedName = company
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // 2. The folder name is already a valid slug (lowercase-hyphenated)
      const slug = company;

      // Check if the slug already exists in the database
      const existingSheet = await db.sheet.findFirst({
        where: { slug },
      });

      if (existingSheet) {
        console.log(`Sheet with slug ${slug} already exists. Skipping creation.`);
        continue; // Skip to the next company if the slug already exists
      }

      // 3. Create the Company as Sheet in the database
      await db.sheet.create({
        data: {
          slug: slug,
          name: capitalizedName,
          isCompany: true,
        },
      });

      console.log(`Created sheet for company: ${capitalizedName} (Slug: ${slug})`);
    }
}

init();