import { useEffect, useRef } from "react";

interface VoiceVisualizerProps {
  stream: MediaStream | null;
  isListening: boolean;
}

export function VoiceVisualizer({ stream, isListening }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (isListening && stream && canvasRef.current) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;

          // Create gradient
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#3b82f6'); // primary
          gradient.addColorStop(1, '#6366f1'); // secondary

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

          x += barWidth + 2;
        }
      };

      draw();

      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        audioContext.close();
      };
    }
    return undefined;
  }, [isListening, stream]);

  return (
    <div className="flex flex-col items-center gap-4 py-4 h-24">
      <canvas
        ref={canvasRef}
        width={300}
        height={60}
        className={`transition-all duration-500 ${isListening ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      />
    </div>
  );
}
