export function Hero() {
  return (
    <div className="relative bg-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-80"></div>
        {/* Placeholder for a real background image */}
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
            opacity: 0.5,
          }}
        ></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Master the Art of <span className="text-orange-500">Cooking</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
          Discover thousands of recipes from around the world. From local favorites to exotic
          dishes, find your next culinary adventure.
        </p>
        <div className="max-w-xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for recipes, ingredients, or cuisines..."
              className="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
            />
            <button className="absolute right-2 top-2 bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
