import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaTwitter } from 'react-icons/fa';
import { authService } from '../services/auth';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login({ email, password });
      navigate('/home');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center">
      <div className="p-8 rounded-xl shadow-xl max-w-md w-full space-y-6 backdrop-blur-sm bg-white/30">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-jet">Welcome Back</h2>
          <p className="text-jet/70 mt-2">Please enter your details</p>
        </div>
        
        {error && (
          <div className="p-3 bg-pink/10 text-pink rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-jet">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-maya/30 rounded-lg focus:outline-none focus:border-maya"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-jet">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-maya/30 rounded-lg focus:outline-none focus:border-maya"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-jet text-floral font-semibold rounded-lg hover:bg-jet/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-jet/70">or sign in with</div>

        <div className="flex justify-center gap-4">
          <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all">
            <FaGoogle className="text-maya" />
          </button>
          <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all">
            <FaFacebook className="text-maya" />
          </button>
          <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all">
            <FaTwitter className="text-maya" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
