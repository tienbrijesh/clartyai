
import { GoogleGenAI, Type } from "@google/genai";
import { MeetingReport } from "../types.ts";

/**
 * Utility to encode PCM data into a standard WAV format (required for Gemini audio/wav support).
 */
const encodeWAV = (samples: Float32Array, sampleRate: number): Blob => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 32 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
};

/**
 * Extracts the audio track from a video file and downsamples it to 16kHz for efficient processing.
 */
const extractAudio = async (file: File): Promise<string> => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  
  const targetSampleRate = 16000;
  const offlineCtx = new OfflineAudioContext(1, audioBuffer.duration * targetSampleRate, targetSampleRate);
  
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start();
  
  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = encodeWAV(renderedBuffer.getChannelData(0), targetSampleRate);
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(wavBlob);
  });
};

/**
 * Samples key visual frames from the video to provide context for long-form meetings.
 */
const sampleFrames = async (file: File, frameCount: number = 8): Promise<string[]> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.src = URL.createObjectURL(file);
    
    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const frames: string[] = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      for (let i = 0; i < frameCount; i++) {
        const time = (duration / (frameCount + 1)) * (i + 1);
        video.currentTime = time;
        await new Promise((r) => (video.onseeked = r));
        
        canvas.width = 640; // Low-res is sufficient for visual cues
        canvas.height = 360;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL('image/jpeg', 0.6).split(',')[1]);
      }
      
      URL.revokeObjectURL(video.src);
      resolve(frames);
    };
  });
};

/**
 * ClarityAI Synthesis Engine - Long-form Resolution Build
 * Handles 2+ hour sessions by decoupling audio and visual data.
 */
export const processMeetingVideo = async (file: File, updateProgress?: (step: string) => void): Promise<MeetingReport | null> => {
  // Use a fallback for environments where process.env is not globally shimmed
  const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : (window as any).process?.env?.API_KEY;
  if (!apiKey) throw new Error("AUTH_ERROR: System API key missing.");

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    updateProgress?.("Extracting Acoustic Spectrum...");
    const audioBase64 = await extractAudio(file);

    updateProgress?.("Sampling Visual Context...");
    const frameBase64s = await sampleFrames(file);

    updateProgress?.("Resolving Decision Graph...");
    
    const contentsParts: any[] = [
      { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
      ...frameBase64s.map(data => ({ inlineData: { mimeType: 'image/jpeg', data } })),
      { text: "Synthesize the record of decision from this audio and these supporting frames." }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: contentsParts },
      config: {
        systemInstruction: `You are an Executive Decision Architect. You will receive a high-fidelity audio track and a series of sequential keyframes from a long meeting.
        
        GOAL: Distill the entire conversation into a definitive Record of Decision.
        
        REQUIREMENTS:
        1. Accuracy: Rely primarily on the audio for dialogue and use frames for visual grounding (slides/demos).
        2. Comprehensive Search: Do not miss decisions made late in the recording.
        3. Output: Structured JSON only.
        
        JSON SCHEMA:
        {
          "summary": "Concise high-level result",
          "action_items": [{"task": "...", "owner": "...", "deadline": "..."}],
          "decisions": ["string"],
          "whatsapp_followup": "string",
          "email_followup": "string"
        }`,
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("ENGINE_EMPTY: Synthesis failed to resolve.");

    return JSON.parse(resultText) as MeetingReport;

  } catch (error: any) {
    console.error("ClarityAI Core Error:", error);
    if (error.message?.includes("decodeAudioData")) {
      throw new Error("MEDIA_DECODE_FAILED: Browser failed to extract the audio track. Ensure the video has a valid audio stream.");
    }
    throw new Error(error.message || "SYNTHESIS_FAILED: System encountered an error resolving long-form data.");
  }
};
