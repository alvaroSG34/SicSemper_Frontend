interface AmbientBlob {
  size: number;
  top: string;
  left: string;
  background: string;
  duration: number;
  delay: number;
}

interface AmbientParticle {
  size: number;
  top: string;
  left: string;
  color: string;
  duration: number;
  delay: number;
  shape?: "circle" | "rounded";
}

const ambientBlobs: AmbientBlob[] = [
  {
    size: 420,
    top: "-8%",
    left: "-10%",
    background: "radial-gradient(circle, rgba(88,101,242,0.18) 0%, rgba(88,101,242,0) 72%)",
    duration: 38,
    delay: 0,
  },
  {
    size: 380,
    top: "18%",
    left: "72%",
    background: "radial-gradient(circle, rgba(255,107,157,0.16) 0%, rgba(255,107,157,0) 70%)",
    duration: 34,
    delay: 8,
  },
  {
    size: 460,
    top: "62%",
    left: "8%",
    background: "radial-gradient(circle, rgba(88,101,242,0.14) 0%, rgba(88,101,242,0) 74%)",
    duration: 42,
    delay: 16,
  },
  {
    size: 340,
    top: "70%",
    left: "75%",
    background: "radial-gradient(circle, rgba(255,107,157,0.12) 0%, rgba(255,107,157,0) 70%)",
    duration: 36,
    delay: 5,
  },
];

const ambientParticles: AmbientParticle[] = [
  { size: 7, top: "14%", left: "20%", color: "#5865f2", duration: 13, delay: 0 },
  { size: 9, top: "22%", left: "82%", color: "#ff6b9d", duration: 15, delay: 3 },
  { size: 6, top: "36%", left: "10%", color: "#ffd166", duration: 12, delay: 6 },
  { size: 8, top: "44%", left: "66%", color: "#8ea0ff", duration: 14, delay: 4 },
  { size: 7, top: "56%", left: "30%", color: "#ff92bd", duration: 16, delay: 7 },
  { size: 6, top: "66%", left: "88%", color: "#5865f2", duration: 11, delay: 1 },
  { size: 8, top: "76%", left: "16%", color: "#ffd166", duration: 15, delay: 5, shape: "rounded" },
  { size: 7, top: "84%", left: "58%", color: "#ff6b9d", duration: 13, delay: 2 },
];

export function LandingAmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {ambientBlobs.map((blob, index) => (
        <span
          key={`ambient-blob-${index}`}
          className="landing-ambient-blob absolute rounded-full"
          style={{
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            top: blob.top,
            left: blob.left,
            background: blob.background,
            animationDuration: `${blob.duration}s`,
            animationDelay: `${blob.delay}s`,
          }}
        />
      ))}

      {ambientParticles.map((particle, index) => (
        <span
          key={`ambient-particle-${index}`}
          className={`landing-ambient-particle landing-ambient-twinkle absolute ${
            particle.shape === "rounded" ? "rounded-[6px]" : "rounded-full"
          }`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: particle.top,
            left: particle.left,
            backgroundColor: particle.color,
            animationDuration: `${particle.duration}s, 8s`,
            animationDelay: `${particle.delay}s, ${particle.delay * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}
