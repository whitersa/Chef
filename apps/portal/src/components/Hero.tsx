import { StaggerContainer, StaggerItem } from './MotionWrapper';

export function Hero() {
  return (
    <div className="relative bg-gray-900 text-white overflow-hidden h-[600px]">
      <div className="absolute inset-0">
        {/* Background Image with Parallax-like feel */}
        <div
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
          }}
        ></div>
        {/* Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-gray-50/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/40 to-transparent"></div>
      </div>

      <StaggerContainer className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
        <StaggerItem>
          <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-semibold tracking-wider mb-6 backdrop-blur-sm">
            #1 COOKING COMMUNITY
          </span>
        </StaggerItem>

        <StaggerItem>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-lg">
            Taste the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
              Magic
            </span>
            <br />
            in Every Bite
          </h1>
        </StaggerItem>

        <StaggerItem>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl drop-shadow-md font-light">
            Unlock your inner chef with our curated collection of world-class recipes.
          </p>
        </StaggerItem>

        <StaggerItem className="w-full max-w-2xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center">
            <input
              id="search"
              name="search"
              type="text"
              placeholder="What are you craving today?"
              className="w-full px-8 py-5 rounded-full bg-white/95 backdrop-blur-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-2xl text-lg transition-all"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 rounded-full hover:from-orange-700 hover:to-orange-600 transition-all shadow-md font-medium transform hover:scale-105 active:scale-95 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </button>
          </div>
        </StaggerItem>

        <div className="mt-8 flex gap-4 text-sm text-gray-300 font-medium">
          <span>Trending:</span>
          <div className="flex gap-3">
            {['Pasta', 'Vegan', 'Desserts', 'Breakfast'].map((tag) => (
              <a
                key={tag}
                href="#"
                className="hover:text-orange-400 transition-colors underline decoration-orange-500/30 hover:decoration-orange-500"
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      </StaggerContainer>
    </div>
  );
}
