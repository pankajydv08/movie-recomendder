import axios from 'axios';

// const API_KEY = import.meta.env.VITE_OMDB; // Use environment variable for OMDB API key

// if (!API_KEY) {
//   throw new Error('OMDB API key is missing. Please set it in the environment variables.');
// }else{
//   console.log("API working")
// }

export async function getMoviePoster(title: string): Promise<string | null> {
  try {
    const response = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=16cd21bc`);
    if (response.data && response.data.Poster) {
      return response.data.Poster;
    } else {
      console.log('No poster found for the movie:', title);
      return null;
    }
  } catch (error) {
    console.error('Error fetching movie poster:', error);
    return null;
  }
}
