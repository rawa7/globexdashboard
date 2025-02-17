'use client'
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminNavigation } from './config/navigation'
import { 
    HomeIcon, 
    UsersIcon, 
    CurrencyDollarIcon,
    Bars3Icon,  // for mobile menu button
} from '@heroicons/react/24/outline'

const iconMap = {
    'HomeIcon': HomeIcon,
    'UsersIcon': UsersIcon,
    'CurrencyDollarIcon': CurrencyDollarIcon,
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    const getIcon = (iconName: string) => {
        const Icon = iconMap[iconName as keyof typeof iconMap]
        return Icon ? <Icon className="h-6 w-6" /> : null
    }

    return (
        <div>
            <button
                type="button"
                className="lg:hidden fixed top-4 left-4 z-40 rounded-md bg-white p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                                    <nav className="flex flex-1 flex-col">
                                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                            <li>
                                                <ul role="list" className="-mx-2 space-y-1">
                                                    {adminNavigation.map((item) => (
                                                        <li key={item.name}>
                                                            <Link
                                                                href={item.href}
                                                                className={`
                                                                    group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                                                                    ${pathname === item.href
                                                                        ? 'bg-gray-50 text-blue-600'
                                                                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                                                    }
                                                                `}
                                                                onClick={() => setSidebarOpen(false)}
                                                            >
                                                                {getIcon(item.icon)}
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {adminNavigation.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={`
                                                    group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                                                    ${pathname === item.href
                                                        ? 'bg-gray-50 text-blue-600'
                                                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                                    }
                                                `}
                                            >
                                                {getIcon(item.icon)}
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            <div className="lg:pl-72">
                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
} 