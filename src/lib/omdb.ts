import axios from 'axios';

const API_KEY = '16cd21bc'; // Replace with your OMDB API key

export async function getMoviePoster(title: string): Promise<string | null> {
  try {
    const response = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${API_KEY}`);
    if (response.data && response.data.Poster) {
      //console.log('Movie Poster URL:', response.data.Poster);
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