import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { getMoviePoster } from "./omdb";

/** Azure OpenAI config */
if (!import.meta.env.VITE_GITHUB_TOKEN) throw new Error("Azure API token is missing or invalid.");
const endpoint = "https://models.inference.ai.azure.com";
const embeddingModelName = "text-embedding-3-large";
const chatModelName = "gpt-4o";

/** Initialize Azure OpenAI client */
export const client = ModelClient(endpoint, new AzureKeyCredential(import.meta.env.VITE_GITHUB_TOKEN));

// Generate embedding from Azure OpenAI
export async function generateEmbedding(text: string) {
  try {
    const embeddingResponse = await client.path("/embeddings").post({
      body: {
        model: embeddingModelName,
        input: text,
      },
    });

    if (!embeddingResponse.body || !embeddingResponse.body.data || embeddingResponse.body.data.length === 0) {
      throw new Error("No embedding returned from Azure AI");
    }

    return embeddingResponse.body.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// Generate structured recommendations
export async function generateStructuredRecommendations(
  matchedMovies: any[],
  userPreferences: string
) {
  try {
    const moviesContent = matchedMovies
      .map((movie, index) => 
        `Movie ${index + 1} (Relevance: ${(movie.similarity).toFixed(2)}): ${movie.content}`
      )
      .join('\n\n');
    
    const chatMessages = [
      {
        role: 'system',
        content: `You are a movie recommendation system that returns structured data. 
        You will be given information about several movies and a user's preferences.
        
        Your job is to return a JSON array of movie recommendations, with each movie having these fields:
        - title: The title of the movie
        - year: The year of release (if available, otherwise null)
        - genre: The genre(s) of the movie (if available, otherwise "Unknown")
        - description: A brief description of the movie
        - relevanceScore: A score from 1-10 indicating how well it matches the user's preferences
        - reasonToWatch: A brief explanation of why the user would enjoy this movie
        
        Return ONLY valid JSON without any additional text, explanation, or markdown formatting.
        The JSON should be an array of movie objects, with 3-5 movies total depending on relevance.`
      },
      {
        role: 'user',
        content: `Here are some movies to consider (ranked by relevance):\n\n${moviesContent}\n\nUser request: ${userPreferences}\n\nReturn a JSON array of structured movie recommendations.`
      }
    ];
    
    const response = await client.path("/chat/completions").post({
      body: {
        model: chatModelName,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }
    });
    
    if (!response.body || !response.body.choices || response.body.choices.length === 0) {
      throw new Error("No valid response from Azure OpenAI chat completion");
    }
    
    const jsonResponse = response.body.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(jsonResponse);
      
      if (Array.isArray(parsedResponse.recommendations)) {
        return parsedResponse;
      } else if (Array.isArray(parsedResponse)) {
        return { recommendations: parsedResponse };
      } else {
        return { 
          recommendations: [parsedResponse],
          message: "Successfully processed recommendations"
        };
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      return { 
        recommendations: [],
        message: "Could not parse response as JSON",
        rawResponse: jsonResponse
      };
    }
  } catch (error) {
    console.error("Error generating structured recommendations:", error);
    throw error;
  }
}