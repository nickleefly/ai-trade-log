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
            { source: '/tokens', destination: '/private/tokens' },
            { source: '/intro', destination: '/private/intro' },
            { source: '/feedback', destination: '/private/feedback' },
        ];
    },
};

export default nextConfig;
