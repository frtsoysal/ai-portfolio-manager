import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        {/* Header/Navigation */}
        <nav className="flex justify-between items-center p-6 lg:px-12">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-white font-semibold text-xl">Portfolio Manager</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/portfolios" className="text-gray-300 hover:text-white transition-colors">
              Portfolios
            </Link>
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/portfolios" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              AI Beats Human{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Emotions
              </span>{' '}
              in Investing
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Our AI portfolio manager eliminates emotional decision-making, delivering consistent returns through 
              data-driven strategies that outperform traditional human advisors.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href="/portfolios"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Start AI Investing
              </Link>
              <Link 
                href="#features"
                className="border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Learn More
              </Link>
            </div>

            {/* Portfolio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="text-3xl font-bold text-white mb-2">5</div>
                <div className="text-gray-400">Portfolio Strategies</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="text-3xl font-bold text-green-400 mb-2">+28.4%</div>
                <div className="text-gray-400">Average Annual Return</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
                <div className="text-gray-400">AI Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose AI Portfolio Management?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI system analyzes market trends, manages risk, and optimizes your portfolio 
              performance without emotional bias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Driven Decisions</h3>
              <p className="text-gray-600">
                Advanced machine learning algorithms analyze market data 24/7 to make optimal investment decisions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5 Portfolio Strategies</h3>
              <p className="text-gray-600">
                Choose from Growth, Value, Momentum, Crypto, and Turkish Stars portfolios tailored to your goals.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-8 rounded-xl">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Monitoring</h3>
              <p className="text-gray-600">
                Track performance, risk metrics, and AI recommendations in real-time with beautiful dashboards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-100 p-8 rounded-xl">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Risk Management</h3>
              <p className="text-gray-600">
                Sophisticated risk assessment and portfolio balancing to protect your investments.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-8 rounded-xl">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Insights</h3>
              <p className="text-gray-600">
                Get personalized AI recommendations and market insights to optimize your investment strategy.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-100 p-8 rounded-xl">
              <div className="w-12 h-12 bg-rose-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Performance Analytics</h3>
              <p className="text-gray-600">
                Detailed performance tracking with charts, comparisons, and historical analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Start Your AI Investment Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of investors who trust AI to manage their portfolios and achieve better returns.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/portfolios"
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Explore Portfolios
            </Link>
            <Link 
              href="/portfolios?type=growth"
              className="border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-10 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              View Growth Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 border-t border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="text-white font-semibold text-xl">Portfolio Manager</span>
            </div>
            
            <div className="flex items-center space-x-8">
              <Link href="/portfolios" className="text-gray-400 hover:text-white transition-colors">
                Portfolios
              </Link>
              <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </Link>
              <span className="text-gray-500 text-sm">
                © 2024 AI Portfolio Manager. Built with Next.js & FastAPI.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}