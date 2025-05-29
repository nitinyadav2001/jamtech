import useAuth from '@/Hook/useAuth'
import React from 'react'

export const DataButtonLoader = () => {
    const { actionLoader } = useAuth();

    if (!actionLoader) return null

    return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
            <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
            <p className="mt-4 text-white text-xl font-semibold">Please wait...</p>
        </div>
    )
}
