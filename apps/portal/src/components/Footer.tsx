import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/chef-logo.svg"
                alt="ChefOS Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <h3 className="text-white text-xl font-bold tracking-tight">ChefOS</h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Your ultimate destination for culinary inspiration and recipe management. Discover,
              cook, and share your passion for food.
            </p>
            <div className="flex space-x-4 pt-2">
              {/* Social placeholders */}
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors cursor-pointer">
                <span className="text-xs">TW</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors cursor-pointer">
                <span className="text-xs">IG</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors cursor-pointer">
                <span className="text-xs">FB</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-orange-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-orange-500 transition-colors"></span>
                  Cuisines
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-orange-500 transition-colors"></span>
                  Ingredients
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-orange-500 transition-colors"></span>
                  Popular
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-orange-500 transition-colors"></span>
                  New Arrivals
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-orange-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-orange-500 transition-colors"></span>
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-orange-500 transition-colors"></span>
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} ChefOS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
