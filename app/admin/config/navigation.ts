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