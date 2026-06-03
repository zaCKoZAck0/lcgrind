// @ts-ignore
import 'dotenv/config';

import fs from 'node:fs/promises'
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '~/lib/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
    const totalStart = performance.now();
    const dir = path.join(__dirname, '../../.data');
    const entries = await fs.readdir(dir);

    const skipList = new Set(['.git', '.gitignore', 'README.md', 'src', 'pom.xml']);

    const rows = entries
        .filter((entry) => !skipList.has(entry))
        .map((company) => ({
            slug: company,
            name: company
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            isCompany: true,
        }));

    const result = await db.sheet.createMany({ data: rows, skipDuplicates: true });

    console.log(
        `Inserted ${result.count}/${rows.length} company sheets (${rows.length - result.count} already existed) in ${(performance.now() - totalStart).toFixed(0)}ms`
    );
}

init();
