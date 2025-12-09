import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            { source: '/calendar', destination: '/private/calendar' },
            { source: '/history', destination: '/private/history' },
            { source: '/statistics', destination: '/private/statistics' },
            { source: '/strategies', destination: '/private/strategies' },
            { source: '/journal', destination: '/private/journal' },
            { source: '/journal/:path*', destination: '/private/journal/:path*' },
            { source: '/tradeAI', destination: '/private/tradeAI' },
            { source: '/tradeAI/:path*', destination: '/private/tradeAI/:path*' },
            { source: '/tokens', destination: '/private/tokens' },
            { source: '/reports-history', destination: '/private/reports-history' },
            { source: '/reports-history/:path*', destination: '/private/reports-history/:path*' },
            { source: '/intro', destination: '/private/intro' },
            { source: '/feedback', destination: '/private/feedback' },
        ];
    },
};

export default nextConfig;
