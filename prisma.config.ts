import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// function normalizeUrl(raw: string): string {
// 	try {
// 		const u = new URL(raw);
// 		const schema = u.searchParams.get('schema');
// 		if (schema) {
// 			u.searchParams.delete('schema');
// 			// translate to Postgres option: -c search_path=schema
// 			const opt = `-c search_path=${schema}`;
// 			u.searchParams.set('options', opt);
// 		}
// 		console.log('--------------------------', u.toString(), raw);
// 		return u.toString();
// 	} catch {
// 		return raw;
// 	}
// }

const rawUrl = process.env.DATABASE_URL ?? '';
// const url = normalizeUrl(rawUrl);

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		url: rawUrl,
	},
});
