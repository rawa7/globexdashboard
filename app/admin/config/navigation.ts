export const adminNavigation = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: 'HomeIcon',
    },
    {
        name: 'articles',
        href: '/admin/articles',
        icon: 'news',
    },
    {
        name: 'brokers',
        href: '/admin/brokers',
        icon: 'brokers',
    },
    {
        name: 'carousel',
        href: '/admin/carousel',
        icon: 'carousel',
    },
    {
        name: 'quiz',
        href: '/admin/quiz',
        icon: 'quiz',
    },
    {
        name: 'signals',
        href: '/admin/signals',
        icon: 'signal',
    },
    {
        name: 'trainers',
        href: '/admin/trainers',
        icon: 'trainers',
    },
    {
        name: 'Exchange Rates',
        href: '/admin/exchange-rates',
        icon: 'CurrencyDollarIcon',
    },
    // Add other admin navigation items here
]

// You can also add icon types if using TypeScript
export type NavigationItem = {
    name: string
    href: string
    icon: string
} 