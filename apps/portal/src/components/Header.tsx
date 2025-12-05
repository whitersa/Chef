import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from './MotionWrapper';

export function Header() {
  return (
    <FadeIn
      className="bg-white shadow-sm sticky top-0 z-50 bg-opacity-90 backdrop-blur-md border-b border-gray-100"
      direction="down"
      margin="0px"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-orange-500/30 transition-all duration-300 transform group-hover:rotate-3">
                C
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-orange-600 transition-colors">
                ChefOS
              </span>
            </Link>
            <StaggerContainer className="hidden md:ml-10 md:flex md:space-x-8" delay={0.1}>
              <StaggerItem>
                <Link
                  href="/recipes"
                  className="text-gray-500 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group"
                >
                  Recipes
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
              </StaggerItem>
              <StaggerItem>
                <Link
                  href="/cuisines"
                  className="text-gray-500 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group"
                >
                  Cuisines
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
              </StaggerItem>
              <StaggerItem>
                <Link
                  href="/about"
                  className="text-gray-500 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group"
                >
                  About
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
              </StaggerItem>
            </StaggerContainer>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-orange-500 transition-colors rounded-full hover:bg-orange-50">
              <span className="sr-only">Search</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <Link
              href="/login"
              className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
