import { supabase } from './supabase';
import { generateEmbedding, generateStructuredRecommendations } from './azure';
import { getMoviePoster } from './omdb';

// Search for similar movies in Supabase
async function searchSimilarMovies(embedding: number[]) {
  try {
    const { data, error } = await supabase.rpc('match_movie', {
      query_embedding: embedding,
      match_threshold: 0.30,
      match_count: 5
    });
    
    if (error) {
      console.error("❌ Supabase RPC Error:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error searching similar movies:", error);
    throw error;
  }
}

// Alternative method to search by cosine similarity
async function searchMoviesBySimilarity(embedding: number[]) {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*, (embeddings <=> $1) as similarity', { bind: [embedding] })
      .order('similarity')
      .limit(5);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error with direct similarity search:", error);
    throw error;
  }
}

// Main recommendation function
export async function getRecommendations(
  favoriteMovie: string,
  moodPreference: string,
  tonePreference: string
) {
  try {
    const userPreferences = `${favoriteMovie} ${moodPreference} ${tonePreference}`;
    const embedding = await generateEmbedding(userPreferences);
    let matchedMovies = [];
    
    try {
      matchedMovies = await searchSimilarMovies(embedding);
      
      if (!matchedMovies?.length) {
        matchedMovies = await searchMoviesBySimilarity(embedding);
      }
    } catch (searchError) {
      console.log("Search failed:", searchError);
    }
    
    if (!matchedMovies?.length) {
      return { 
        recommendations: [], 
        message: "No movies found matching your preferences." 
      };
    }
    
    const result = await generateStructuredRecommendations(matchedMovies, userPreferences);
    
    // Add posterUrl to each movie in the recommendations
    for (const movie of result.recommendations) {
      movie.posterUrl = await getMoviePoster(movie.title);
    }
    
    console.log("Recommendations:", result);
    return result;
  } catch (error) {
    console.error("Error in recommendation flow:", error);
    throw error;
  }
}