import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-orange-600">ChefOS</span>
              <span className="ml-2 text-gray-600 font-medium hidden sm:block">Portal</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-orange-600 font-medium">
              Home
            </Link>
            <Link href="/cuisines" className="text-gray-700 hover:text-orange-600 font-medium">
              Cuisines
            </Link>
            <Link href="/recipes" className="text-gray-700 hover:text-orange-600 font-medium">
              Recipes
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-600 font-medium">
              About
            </Link>
          </nav>
          <div className="flex items-center">
            <button className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-700 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
