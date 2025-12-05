import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from './MotionWrapper';

export function Footer() {
  return (
    <FadeIn className="bg-gray-900 text-white border-t border-gray-800" direction="up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <StaggerItem className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold">
                C
              </div>
              <span className="font-bold text-xl tracking-tight">ChefOS</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering chefs and food lovers to create, share, and discover amazing recipes.
            </p>
          </StaggerItem>

          <StaggerItem className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">Discover</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/recipes" className="hover:text-orange-500 transition-colors">
                  Recipes
                </Link>
              </li>
              <li>
                <Link href="/cuisines" className="hover:text-orange-500 transition-colors">
                  Cuisines
                </Link>
              </li>
              <li>
                <Link href="/chefs" className="hover:text-orange-500 transition-colors">
                  Top Chefs
                </Link>
              </li>
            </ul>
          </StaggerItem>

          <StaggerItem className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-orange-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-orange-500 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-orange-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </StaggerItem>

          <StaggerItem className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-orange-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-orange-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </StaggerItem>
        </StaggerContainer>
        <FadeIn
          className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500"
          delay={0.2}
        >
          &copy; {new Date().getFullYear()} ChefOS. All rights reserved.
        </FadeIn>
      </div>
    </FadeIn>
  );
}
