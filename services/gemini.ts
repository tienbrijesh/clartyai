import { GoogleGenAI, Type } from "@google/genai";
import { MeetingReport } from "../types.ts";

/**
 * Utility to encode PCM data into a standard WAV format.
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
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
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
 * Extracts audio from a video file and downsamples to 16kHz WAV.
 */
const extractAudio = async (file: File): Promise<string> => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const offlineCtx = new OfflineAudioContext(1, audioBuffer.duration * 16000, 16000);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start();
  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = encodeWAV(renderedBuffer.getChannelData(0), 16000);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(wavBlob);
  });
};

/**
 * Samples visual keyframes from the video.
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
        canvas.width = 640;
        canvas.height = 360;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
        frames.push(data);
      }
      URL.revokeObjectURL(video.src);
      resolve(frames);
    };
  });
};

/**
 * Process a meeting video of any length by distilling it into a Record of Decision.
 */
export const processMeetingVideo = async (file: File, onProgress?: (step: string) => void): Promise<MeetingReport | null> => {
  // Directly initialize using process.env.API_KEY as per the rules.
  // We assume this is available in the environment.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    onProgress?.("Extracting Audio Spectrum...");
    const audioData = await extractAudio(file);

    onProgress?.("Sampling Visual Context...");
    const frameData = await sampleFrames(file);

    onProgress?.("Resolving Decision Graph...");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: audioData } },
          ...frameData.map(data => ({ inlineData: { mimeType: 'image/jpeg', data } })),
          { text: "Generate a comprehensive meeting report from this audio and these key frames. Distill the entire conversation into a definitive 'Record of Decision'." }
        ]
      },
      config: {
        systemInstruction: "You are an Executive Decision Architect. Distill meeting recordings into a 'Record of Decision'. Focus on consensus, ownership, and clear next steps. Output ONLY valid JSON matching the provided schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            action_items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  deadline: { type: Type.STRING }
                },
                required: ["task", "owner", "deadline"]
              }
            },
            decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
            whatsapp_followup: { type: Type.STRING },
            email_followup: { type: Type.STRING }
          },
          required: ["summary", "action_items", "decisions", "whatsapp_followup", "email_followup"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Synthesis Engine returned an empty response.");
    
    return JSON.parse(text) as MeetingReport;

  } catch (error: any) {
    console.error("ClarityAI API Error:", error);
    // Throw a clean error for the UI state
    throw new Error(error.message || "The synthesis engine failed to process the meeting data. Please ensure the file is valid and try again.");
  }
};