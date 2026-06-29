export async function transcribeAudio(videoUrl, onProgress) {
  try {
    if (onProgress) onProgress("Initializing AI...");
    const { pipeline, env } = await import("@xenova/transformers");
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    if (onProgress) onProgress("Loading AI model...");
    const transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny",
      { quantized: true }
    );

    if (onProgress) onProgress("Extracting audio...");
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const response = await fetch(videoUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const targetSampleRate = 16000;
    const offlineContext = new OfflineAudioContext(
      1, audioBuffer.duration * targetSampleRate, targetSampleRate
    );
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();

    const renderedBuffer = await offlineContext.startRendering();
    const audioData = renderedBuffer.getChannelData(0);

    if (onProgress) onProgress("Transcribing speech...");
    const output = await transcriber(audioData, {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
    });

    if (onProgress) onProgress("Creating captions...");
    const captions = [];
    if (output.chunks) {
      for (const chunk of output.chunks) {
        const [start, end] = chunk.timestamp;
        if (start !== null && end !== null && chunk.text && chunk.text.trim()) {
          captions.push({ start, duration: end - start, text: chunk.text.trim() });
        }
      }
    }
    return captions;
  } catch (err) {
    throw new Error("AI captions failed: " + err.message);
  }
}
