export default async function Test () {
  return (
    <div className="font-sans h-full">
      <nav className="flex items-center justify-between bg-gray-100 p-4">
        <div className="flex items-center">
          <span className="text-xl font-semibold">FelipeApp✨</span>
        </div>
        <div className="flex gap-4">
          <a href="#home" className="hover:text-blue-500">HOME</a>
          <a href="#description" className="hover:text-blue-500">DESCRIPTION</a>
          <a href="#contact" className="hover:text-blue-500">CONTACT</a>
        </div>
        <div className="flex items-center gap-2">
          {/* Icons go here */}
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        </div>
      </nav>

      <header className="text-center p-10">
        <h1 className="text-3xl font-bold">Welcome to my AI web</h1>
        <div className="border-t-4 border-dashed border-gray-500 mt-2"></div>
      </header>

      <section className="p-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* These would be your feature boxes */}
        <div className="p-4 border border-gray-200 rounded hover:shadow-lg transition ease-in-out duration-150">
          <h2 className="text-lg font-semibold mb-2">1</h2>
          <p>Description of feature 1...</p>
        </div>
        <div className="p-4 border border-gray-200 rounded hover:shadow-lg transition ease-in-out duration-150">
          <h2 className="text-lg font-semibold mb-2">2</h2>
          <p>Description of feature 2...</p>
        </div>
        <div className="p-4 border border-gray-200 rounded hover:shadow-lg transition ease-in-out duration-150">
          <h2 className="text-lg font-semibold mb-2">3</h2>
          <p>Description of feature 3...</p>
        </div>
      </section>

      <footer className="flex justify-center p-4 border-t mt-4">
        <span className="text-sm">1 to 3</span>
      </footer>
    </div>
  )
}
