import React, { useState } from 'react';
import { Popcorn } from 'lucide-react';
import { getRecommendations } from './lib/recommendations';

interface Movie {
  title: string;
  year?: number | null;
  genre: string;
  description: string;
  relevanceScore: number;
  reasonToWatch: string;
  posterUrl: string | null;
}

function App() {
  const [favoriteMovie, setFavoriteMovie] = useState('');
  const [moodPreference, setMoodPreference] = useState('');
  const [tonePreference, setTonePreference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [currentRecommendationIndex, setCurrentRecommendationIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!favoriteMovie || !moodPreference || !tonePreference) {
      alert('Please answer all questions');
      return;
    }

    setIsLoading(true);
    setShowResults(false);

    try {
      const result = await getRecommendations(
        favoriteMovie,
        moodPreference,
        tonePreference
      );
      setRecommendations(result.recommendations || []);
      setCurrentRecommendationIndex(0);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFavoriteMovie('');
    setMoodPreference('');
    setTonePreference('');
    setShowResults(false);
    setRecommendations([]);
  };

  const handleNextRecommendation = () => {
    setCurrentRecommendationIndex((prevIndex) => prevIndex + 1);
  };

  const currentRecommendation = recommendations[currentRecommendationIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-900 py-12 px-4">
      <div className="max-w-lg mx-auto"> {/* Increased max-width from md to lg */}
        <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden p-6">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Popcorn className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">PopChoice</h1>
          </div>

          {!showResults && !isLoading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-lg mb-2">
                  What's your favorite movie and why?
                </label>
                <textarea
                  value={favoriteMovie}
                  onChange={(e) => setFavoriteMovie(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Type your answer here..."
                />
              </div>

              <div>
                <label className="block text-white text-lg mb-2">
                  Are you in the mood for something new or a classic?
                </label>
                <textarea
                  value={moodPreference}
                  onChange={(e) => setMoodPreference(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Type your answer here..."
                />
              </div>

              <div>
                <label className="block text-white text-lg mb-2">
                  Do you want to have fun or do you want something serious?
                </label>
                <textarea
                  value={tonePreference}
                  onChange={(e) => setTonePreference(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Type your answer here..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full py-3 px-6 font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-colors duration-300 shadow-lg"
              >
                Let's Go
              </button>
            </form>
          )}

          {isLoading && (
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Finding perfect movies for you...</p>
            </div>
          )}

          {showResults && currentRecommendation && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Here is your recommendation:</h2>
              <div className="bg-slate-800 rounded-lg p-4 text-white">
                <h3 className="text-xl font-semibold mb-2">
                  {currentRecommendation.title} {currentRecommendation.year && `(${currentRecommendation.year})`}
                </h3>
                {currentRecommendation.posterUrl && (
                  <div className="mb-3">
                    <img src={currentRecommendation.posterUrl} alt={`${currentRecommendation.title} poster`} className="w-full h-auto rounded-lg" />
                  </div>
                )}
                {currentRecommendation.genre !== "Unknown" && (
                  <p className="text-purple-400 text-sm mb-2">{currentRecommendation.genre}</p>
                )}
                <p className="text-gray-300 mb-3">{currentRecommendation.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-400">
                    Match: {currentRecommendation.relevanceScore}/10
                  </span>
                </div>
                <div className="mt-3 text-sm text-gray-300">
                  <strong className="text-purple-400">Why you'll like it:</strong>{' '}
                  {currentRecommendation.reasonToWatch}
                </div>
              </div>
              {currentRecommendationIndex < recommendations.length - 1 ? (
                <button
                  onClick={handleNextRecommendation}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full py-3 px-6 font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-colors duration-300 shadow-lg"
                >
                  Next Recommendation
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full py-3 px-6 font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-colors duration-300 shadow-lg"
                >
                  Start Over
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;