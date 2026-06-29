// Generate waveform peaks from an audio/video file
export async function generateWaveform(url, samples = 200) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(channelData.length / samples);
    const peaks = [];

    for (let i = 0; i < samples; i++) {
      const start = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[start + j] || 0);
      }
      peaks.push(sum / blockSize);
    }

    // Normalize peaks
    const max = Math.max(...peaks, 0.01);
    return peaks.map((p) => p / max);
  } catch (err) {
    console.warn("Waveform generation failed:", err);
    return null;
  }
}
