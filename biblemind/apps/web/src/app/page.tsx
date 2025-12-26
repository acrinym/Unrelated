import Link from 'next/link';
import { BookOpen, Brain, Search, TrendingUp, Users, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">BibleMind</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
          </nav>
          <div className="flex space-x-4">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-spiritual-50 text-spiritual-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Brain className="h-4 w-4" />
            <span>10 Parallel AI Reasoning Engines</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-serif">
            Biblical Guidance from
            <span className="text-primary-600"> Every Angle</span>
          </h2>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get multi-perspective theological analysis grounded in Scripture. BibleMind explores your question through 7 theological lenses, then synthesizes everything into unified biblical wisdom.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
              Start Asking Questions
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-lg px-8 py-3">
              See How It Works
            </Link>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            Free tier: 10 questions/day • Premium: Unlimited
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why BibleMind?
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Traditional Bible apps give you verses. BibleMind gives you wisdom.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Multi-Perspective Analysis</h4>
              <p className="text-gray-600">
                Every question analyzed through 7 theological perspectives: Torah, Prophetic, Wisdom, Gospel, Apostolic, Messianic, and Mystical.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card">
              <div className="bg-spiritual-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-spiritual-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Theological Council</h4>
              <p className="text-gray-600">
                See how Orthodox, Catholic, Reformed, Pentecostal, Eastern Orthodox, and Messianic traditions approach your question.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Growth Tracking</h4>
              <p className="text-gray-600">
                Monitor your spiritual maturity over time. See patterns in your questions and celebrate growth milestones.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Scripture-Grounded</h4>
              <p className="text-gray-600">
                Every answer backed by specific Bible passages. Cross-references, original languages, and thematic connections included.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Pastoral Care</h4>
              <p className="text-gray-600">
                Identifies spiritual/emotional distress and provides immediate biblical comfort and guidance.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Covenant Analysis</h4>
              <p className="text-gray-600">
                Understand God's promises through the 6 biblical covenants and see how Christ fulfills them all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Holographic Reasoning in Action
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your question passes through 10 specialized AI engines, each analyzing from a different angle.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Safety Check</h4>
                  <p className="text-gray-600">Engine 0 ensures your question is theologically sound and appropriate.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Heart Analysis</h4>
                  <p className="text-gray-600">Engine 9 understands the emotional/spiritual state behind your question.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Parallel Analysis</h4>
                  <p className="text-gray-600">Engines 1, 2, and 4 run simultaneously: Multi-perspective oracle, covenant analysis, and pastoral care.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Integration</h4>
                  <p className="text-gray-600">Engines 3 and 5 weigh perspectives and integrate Old/New Testament wisdom.</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Synthesis & Memory</h4>
                  <p className="text-gray-600">Engine 6 synthesizes everything into unified guidance. Engine 7 remembers your journey. Engine 8 tracks growth.</p>
                </div>
              </div>

              {/* Result */}
              <div className="flex gap-4 bg-spiritual-50 p-4 rounded-lg border-2 border-spiritual-200">
                <div className="flex-shrink-0 w-8 h-8 bg-spiritual-600 text-white rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Your Answer</h4>
                  <p className="text-gray-600">Comprehensive biblical guidance with action steps, scripture references, and prayer prompts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="card border-2 border-gray-200">
              <h4 className="text-2xl font-bold mb-2">Free</h4>
              <div className="mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>10 questions per day</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>All 10 reasoning engines</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Basic question history</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Community support</span>
                </li>
              </ul>
              <Link href="/auth/signup" className="btn-secondary w-full text-center">
                Get Started
              </Link>
            </div>

            {/* Individual */}
            <div className="card border-2 border-primary-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h4 className="text-2xl font-bold mb-2">Individual</h4>
              <div className="mb-4">
                <span className="text-4xl font-bold">$12</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Unlimited questions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Full question history</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Growth tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Export answers</span>
                </li>
              </ul>
              <Link href="/auth/signup" className="btn-primary w-full text-center">
                Upgrade Now
              </Link>
            </div>

            {/* Church */}
            <div className="card border-2 border-gray-200">
              <h4 className="text-2xl font-bold mb-2">Church</h4>
              <div className="mb-4">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>50 seats</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Admin dashboard</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Congregational insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Bulk export</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Dedicated support</span>
                </li>
              </ul>
              <Link href="/auth/signup" className="btn-secondary w-full text-center">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-4xl font-bold text-white mb-6 font-serif">
            Ready to deepen your biblical understanding?
          </h3>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of believers growing in wisdom and spiritual maturity.
          </p>
          <Link href="/auth/signup" className="bg-white text-primary-600 hover:bg-gray-50 font-medium px-8 py-3 rounded-lg text-lg inline-block transition-colors">
            Start Your Journey Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-primary-400" />
                <h5 className="text-white font-bold">BibleMind</h5>
              </div>
              <p className="text-sm">
                Biblical wisdom from every angle, powered by AI.
              </p>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4">Product</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4">Company</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4">Legal</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 BibleMind. Built with 🕊️ for the glory of God.</p>
            <p className="mt-2 text-xs italic">&quot;In the beginning was the Word...&quot; - John 1:1</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
