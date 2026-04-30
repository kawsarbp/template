import Logo from '@/assets/logo-main.png';
export default function RightSide() {
    return (
        <div className="relative hidden h-full w-1/2 lg:block">
            {/* Background with theme colors */}
            <div className="absolute inset-0 bg-primary">
                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    }}
                ></div>

                {/* Pattern Overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>

                {/* Animated Circles */}
                <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl"></div>
                <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative flex min-h-full flex-col items-center justify-center p-10 py-12 text-primary-foreground">
                <div className="w-full max-w-lg space-y-7">
                    {/* Shipping Accounting Illustration */}
                    <div className="relative mx-auto">
                        <div className="absolute inset-0 rounded-3xl bg-primary-foreground/20 blur-xl"></div>

                        {/* Main Illustration Container */}
                        <div className="relative rounded-3xl bg-primary-foreground/10 p-5 shadow-2xl ring-1 ring-primary-foreground/20 backdrop-blur-sm">
                            {/* Ship and Documents Illustration */}
                            <div className="space-y-4">
                                {/* Top Section - Logo */}
                                <div className="flex items-center justify-center">
                                    <div className="relative">
                                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-primary-foreground/20 p-1">
                                            <img
                                                src={Logo}
                                                alt="Zaaag Shipping Logo"
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        {/* Wave decoration */}
                                        <div className="absolute -bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-primary-foreground/30"></div>
                                    </div>
                                </div>

                                {/* Middle Section - Documents/Charts */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    {/* Invoice Icon */}
                                    <div className="flex flex-col items-center gap-2 rounded-xl bg-primary-foreground/10 p-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/20">
                                            <svg
                                                className="h-5 w-5 text-primary-foreground"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-medium text-primary-foreground/90">
                                            Invoices
                                        </span>
                                    </div>

                                    {/* Chart Icon */}
                                    <div className="flex flex-col items-center gap-2 rounded-xl bg-primary-foreground/10 p-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/20">
                                            <svg
                                                className="h-5 w-5 text-primary-foreground"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-medium text-primary-foreground/90">
                                            Analytics
                                        </span>
                                    </div>

                                    {/* Money Icon */}
                                    <div className="flex flex-col items-center gap-2 rounded-xl bg-primary-foreground/10 p-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/20">
                                            <svg
                                                className="h-5 w-5 text-primary-foreground"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-medium text-primary-foreground/90">
                                            Finance
                                        </span>
                                    </div>

                                    {/* Tracking Icon */}
                                    <div className="flex flex-col items-center gap-2 rounded-xl bg-primary-foreground/10 p-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/20">
                                            <svg
                                                className="h-5 w-5 text-primary-foreground"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-medium text-primary-foreground/90">
                                            Tracking
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-4 text-center">
                        <h2 className="text-3xl leading-tight font-bold tracking-tight">
                            Streamline Your POS & Accounting
                        </h2>
                        <p className="text-base leading-relaxed text-primary-foreground/90">
                            Complete management solution for modern POS
                            businesses with powerful accounting tools and
                            real-time insights
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="grid gap-2.5">
                        {[
                            { text: 'Real-time Financial Tracking' },
                            { text: 'Automated Invoice Management' },
                            { text: 'Secure & Reliable Platform' },
                            { text: 'Comprehensive Analytics' },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-4 py-2.5 backdrop-blur-sm transition-all hover:bg-primary-foreground/15"
                            >
                                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-foreground/30">
                                    <svg
                                        className="h-3.5 w-3.5 text-primary-foreground"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-primary-foreground">
                                    {feature.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
