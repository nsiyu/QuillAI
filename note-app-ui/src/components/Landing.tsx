import { useNavigate } from "react-router-dom";
import { useTypewriter } from "../hooks/useTypewriter";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import LandingIcon from "/Users/weiho/Documents/Project/Hackathon/temp/note-app-ui/src/assets/istockphoto-846418502-612x612-removebg-preview copy 2.png"; // Import the image
import { FiSearch, FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../contexts/ThemeContext'

function Landing() {
  const navigate = useNavigate();
  const animatedText = useTypewriter("AI-powered intelligence");

  const featuresRef = useRef(null);
  const demoRef = useRef(null);
  const benefitsRef = useRef(null);

  const isFeatureInView = useInView(featuresRef, {
    once: true,
    margin: "-100px",
  });
  const isDemoInView = useInView(demoRef, { once: true, margin: "-100px" });
  const isBenefitsInView = useInView(benefitsRef, {
    once: true,
    margin: "-100px",
  });

  const features = [
    {
      title: "Voice-to-Text",
      description:
        "Transform your spoken words into text instantly with our advanced speech recognition.",
      icon: "🎙️",
    },
    {
      title: "AI Analysis",
      description:
        "Get intelligent insights and suggestions to improve your notes.",
      icon: "🤖",
    },
    {
      title: "Smart Organization",
      description:
        "Automatically categorize and structure your notes for easy access.",
      icon: "📚",
    },
  ];

  const benefits = [
    {
      title: "Save Time",
      description:
        "Reduce note-taking time by 50% with voice commands and AI assistance.",
      icon: "⚡",
    },
    {
      title: "Better Understanding",
      description:
        "AI-powered analysis helps you grasp complex topics more easily.",
      icon: "🧠",
    },
    {
      title: "Stay Organized",
      description:
        "Keep your thoughts structured and accessible with smart organization.",
      icon: "✨",
    },
  ];

  const { isDarkMode, toggleDarkMode } = useTheme()
  
  return (
    <div className="relative min-h-screen text-jet dark:text-dark-text bg-white dark:bg-dark-bg">
      <div className="relative">
        <nav className="fixed w-full z-10 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">

            <div className="flex items-center gap-2">
              <img 
                src="/logo.png"
                alt="Quill.ai Logo"
                className="w-6 h-6 object-contain"
              />
              <span className="text-xl font-bold text-jet">Quill.ai</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="font-medium hover:text-maya transition-colors">Features</a>
              <a href="#pricing" className="font-medium hover:text-maya transition-colors">About</a>
              <button 
                onClick={() => navigate('/login')} 
                className="font-medium hover:text-maya transition-colors"
              >
                Login
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 text-maya hover:text-maya/80 transition-colors dark:text-maya dark:hover:text-maya/80"
              >
                {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
            </div>
          </div>
        </nav>


        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-24"
        >
          <div className="container mx-auto px-4 py-24 space-y-8">
            <h1 className="text-6xl font-extrabold text-center">
              Transform your notes with
              <span className="block mt-2 bg-gradient-to-r from-maya to-pink bg-clip-text text-transparent min-h-[80px]">
                {animatedText}
              </span>
            </h1>

            <p className="text-xl text-jet/80 text-center max-w-2xl mx-auto font-normal">
              Smart note-taking powered by AI to help you capture and connect
              ideas faster than ever.
            </p>

            <div className="flex justify-center gap-4 pt-8">
              <button className="px-8 py-3 bg-jet text-floral font-semibold rounded-lg hover:bg-jet/90 transition-all shadow-lg hover:shadow-xl">
                Get Started
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="px-8 py-3 text-jet/70 font-semibold rounded-lg border border-gray-200 hover:border-gray-300 focus:border-maya focus:outline-none focus:ring-1 focus:ring-maya/30 transition-all w-[300px] bg-white/50"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-jet/50" size={18} />
              </div>
            </div>
          </div>

          {/* Video Demo Section */}
          <motion.div
            ref={demoRef}
            initial={{ opacity: 0 }}
            animate={isDemoInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="py-24"
          >
            <div className="container mx-auto px-4 pb-24">
              <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={isDemoInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.8 }}
                  className="relative pt-[56.25%]"
                >
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/2QoVxeZXp4k?start=30"
                    title="NeuroPen Demo Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          ref={featuresRef}
          className="py-24"
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isFeatureInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
              <p className="text-xl text-jet/70">
                Everything you need for smarter note-taking
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isFeatureInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="p-6 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm rounded-xl shadow-lg"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-jet/70">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          ref={benefitsRef}
          className="py-24"
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isBenefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Why Choose NeuroPen?</h2>
              <p className="text-xl text-jet/70">
                Transform your note-taking experience
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isBenefitsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="p-6 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm rounded-xl shadow-lg"
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-jet/70">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-24 text-center"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Notes?
            </h2>
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3 bg-maya text-white font-semibold rounded-lg hover:bg-maya/90 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started for Free
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Landing;
