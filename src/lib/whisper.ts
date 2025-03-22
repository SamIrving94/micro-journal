import fs from 'fs';
import path from 'path';
import os from 'os';
import { createClient } from '@supabase/supabase-js';
import axios, { AxiosError } from 'axios';

// Maximum number of retries for API calls
const MAX_RETRIES = 3;
// Delay between retries (in ms)
const RETRY_DELAY = 1000;

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param retries Number of retries
 * @param delay Delay between retries in ms
 */
async function retry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Retrying after ${delay}ms... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retry(fn, retries - 1, delay * 2);
  }
}

/**
 * Downloads an audio file from WhatsApp Media API
 * @param mediaId The ID of the media to download
 * @returns Path to the downloaded file
 */
async function downloadWhatsAppAudio(mediaId: string): Promise<string> {
  console.log(`Downloading WhatsApp audio with ID: ${mediaId}`);
  
  // Construct the media endpoint URL
  const mediaEndpoint = `${process.env.NEXT_PUBLIC_WHATSAPP_API_URL}/${mediaId}`;
  
  // Get the media URL from WhatsApp
  let mediaUrl: string;
  try {
    const response = await retry(() => axios.get(mediaEndpoint, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN}`
      }
    }));
    
    mediaUrl = response.data?.url;
    if (!mediaUrl) {
      throw new Error('Media URL not found in response');
    }
  } catch (error: unknown) {
    console.error('Failed to get media URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Could not get media URL from WhatsApp: ${errorMessage}`);
  }
  
  // Download the audio file
  try {
    const audioResponse = await retry(() => axios.get(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN}`
      },
      responseType: 'arraybuffer'
    }));
    
    // Create a unique filename to avoid collisions
    const timestamp = new Date().getTime();
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, `whatsapp_audio_${mediaId}_${timestamp}.ogg`);
    
    // Write the file to disk
    await fs.promises.writeFile(filePath, audioResponse.data);
    console.log(`Audio file saved to ${filePath}`);
    
    return filePath;
  } catch (error: unknown) {
    console.error('Failed to download audio file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Could not download audio file: ${errorMessage}`);
  }
}

/**
 * Transcribes audio using OpenAI Whisper API
 * @param audioPath Path to the audio file
 * @returns Transcribed text
 */
async function transcribeWithWhisper(audioPath: string): Promise<string> {
  console.log(`Transcribing audio file: ${audioPath}`);
  
  // Check if file exists and has content
  try {
    const stats = await fs.promises.stat(audioPath);
    if (stats.size === 0) {
      throw new Error('Audio file is empty');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Invalid audio file: ${errorMessage}`);
  }
  
  try {
    // Create form data with file
    const formData = new FormData();
    const file = new Blob([await fs.promises.readFile(audioPath)]);
    formData.append('file', file, path.basename(audioPath));
    formData.append('model', 'whisper-1');
    
    // Add optional parameters for better transcription
    formData.append('language', 'en'); // Set to auto-detect or specify language
    formData.append('response_format', 'json');
    formData.append('temperature', '0.2'); // Lower temperature for more accurate transcription
    
    // Call Whisper API with retry logic
    const response = await retry(() => axios.post(
      'https://api.openai.com/v1/audio/transcriptions', 
      formData, 
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout
      }
    ));
    
    if (!response.data?.text) {
      throw new Error('No transcription in response');
    }
    
    return response.data.text;
  } catch (error: unknown) {
    console.error('Error transcribing with Whisper:', error);
    
    // Provide more specific error message based on error type
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        throw new Error('OpenAI API key is invalid');
      } else if (axiosError.response?.status === 429) {
        throw new Error('OpenAI rate limit exceeded');
      } else if (axiosError.code === 'ECONNABORTED') {
        throw new Error('Transcription request timed out');
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to transcribe audio: ${errorMessage}`);
  }
}

/**
 * Main function to transcribe audio from WhatsApp
 * @param mediaId WhatsApp media ID
 * @returns Transcribed text
 */
export async function transcribeAudio(mediaId: string): Promise<string> {
  let audioPath: string | null = null;
  
  try {
    console.log(`Starting transcription process for media ID: ${mediaId}`);
    
    // Step 1: Download the audio
    audioPath = await downloadWhatsAppAudio(mediaId);
    
    // Step 2: Transcribe the audio
    const transcription = await transcribeWithWhisper(audioPath);
    
    // Success! Return the transcription
    console.log(`Transcription successful (${transcription.length} characters)`);
    return transcription;
  } catch (error) {
    console.error('Transcription failed:', error);
    throw error;
  } finally {
    // Clean up temporary file
    if (audioPath) {
      fs.promises.unlink(audioPath)
        .catch(err => console.warn(`Warning: Failed to delete temp file ${audioPath}:`, err));
    }
  }
} 