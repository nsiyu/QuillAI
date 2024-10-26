import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-main text-jet">
      <nav className="fixed w-full z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-maya"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.71 7.04c.39-.39.39-1.04 0-1.43l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z" />
            </svg>
            <span className="text-2xl font-bold text-jet">
              NeuroPen
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="font-medium hover:text-maya transition-colors">Features</a>
            <a href="#pricing" className="font-medium hover:text-maya transition-colors">Pricing</a>
            <button 
              onClick={() => navigate('/login')} 
              className="px-6 py-2 text-maya font-semibold rounded-lg border-2 border-maya hover:bg-maya/10 transition-all"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24">
        <div className="container mx-auto px-4 py-24 space-y-8">
          <h1 className="text-6xl font-extrabold text-center">
            Transform your notes with
            <span className="block mt-2 bg-gradient-to-r from-maya to-pink bg-clip-text text-transparent">
              AI-powered intelligence
            </span>
          </h1>
          
          <p className="text-xl text-jet/80 text-center max-w-2xl mx-auto font-normal">
            Smart note-taking powered by AI to help you capture and connect ideas faster than ever.
          </p>

          <div className="flex justify-center gap-4 pt-8">
            <button className="px-8 py-3 bg-jet text-floral font-semibold rounded-lg hover:bg-jet/90 transition-all shadow-lg hover:shadow-xl">
              Get Started
            </button>
            <button className="px-8 py-3 text-maya font-semibold rounded-lg border border-maya/30 hover:border-maya hover:bg-maya/5 transition-all">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Video Demo Section */}
        <div className="container mx-auto px-4 pb-24">
          <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/2QoVxeZXp4k?start=30"
                title="NeuroPen Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="text-center space-y-2">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-maya">{title}</h3>
      <p className="text-jet/70 font-normal">{description}</p>
    </div>
  )
}

export default Landing
