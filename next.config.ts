import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	// images: {
	// 	remotePatterns: [
	// 		{
	// 			protocol: 'https',
	// 			hostname: 'image.pollinations.ai',
	// 		},
	// 		{
	// 			protocol: 'https',
	// 			hostname: 'example.com',
	// 		},
	// 	],
	// },

	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
			{
				protocol: 'http',
				hostname: '**',
			},
		],
	},
	// Anti-caché para desarrollo
	// ...(process.env.NODE_ENV === 'development' && {
	// 	experimental: {
	// 		staleTimes: {
	// 			dynamic: 0,
	// 			static: 0,
	// 		},
	// 	},
		// headers: async () => [
		// 	{
		// 		source: '/(.*)',
		// 		headers: [
		// 			{
		// 				key: 'Cache-Control',
		// 				value: 'no-cache, no-store, must-revalidate',
		// 			},
		// 		],
		// 	},
		// ],
	// }),
};

export default nextConfig;
