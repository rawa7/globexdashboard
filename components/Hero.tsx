'use client'

export default function Hero() {
  return (
    <div className="relative h-[600px] bg-gradient-to-r from-blue-900 to-blue-700">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 h-full flex flex-col justify-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Globex Corporation
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
          Your trusted partner in global trade. Connecting businesses worldwide with quality products and reliable service.
        </p>
        <button className="mt-8 px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition w-fit">
          Explore Our Products
        </button>
      </div>
    </div>
  )
} 