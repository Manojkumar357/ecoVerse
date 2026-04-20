import { useEffect, useMemo, useRef } from "react";

type FloatingElement = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  rotate: number;
  shape: number;
};

type SignupAnimatedBackgroundProps = {
  children: React.ReactNode;
  className?: string;
  elementCount?: number;
};

export default function SignupAnimatedBackground({
  children,
  className = "",
  elementCount = 18,
}: SignupAnimatedBackgroundProps) {
  const motionRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0.5, y: 0.5 });
  const currentRef = useRef({ x: 0.5, y: 0.5 });

  const floatingElements = useMemo<FloatingElement[]>(
    () =>
      Array.from({ length: elementCount }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 18 + Math.random() * 30,
        opacity: 0.1 + Math.random() * 0.18,
        duration: 18 + Math.random() * 24,
        delay: -Math.random() * 25,
        driftX: -56 + Math.random() * 112,
        driftY: -56 + Math.random() * 112,
        rotate: -60 + Math.random() * 120,
        shape: i % 6,
      })),
    [elementCount]
  );

  useEffect(() => {
    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.05;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.05;

      if (motionRef.current) {
        motionRef.current.style.setProperty("--mx", currentRef.current.x.toFixed(4));
        motionRef.current.style.setProperty("--my", currentRef.current.y.toFixed(4));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={motionRef}
      className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-sky-950 to-cyan-950 ${className}`}
      style={{ "--mx": 0.5, "--my": 0.5 } as React.CSSProperties}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        targetRef.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        };
      }}
      onMouseLeave={() => {
        targetRef.current = { x: 0.5, y: 0.5 };
      }}
    >
      <div className="absolute inset-0 aurora-field"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(45,212,191,0.16),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_36%),radial-gradient(circle_at_50%_78%,rgba(16,185,129,0.14),transparent_42%)]"></div>
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      <div className="absolute inset-0 opacity-18 bg-[linear-gradient(to_right,rgba(45,212,191,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.1)_1px,transparent_1px)] bg-[size:90px_90px]"></div>

      <div
        className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-emerald-400/16 blur-3xl"
        style={{
          transform: "translate(calc((var(--mx) - 0.5) * 26px), calc((var(--my) - 0.5) * 20px))",
        }}
      ></div>
      <div
        className="absolute -bottom-24 right-0 w-80 h-80 rounded-full bg-cyan-300/16 blur-3xl"
        style={{
          transform: "translate(calc((0.5 - var(--mx)) * 30px), calc((0.5 - var(--my)) * 24px))",
        }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] rounded-full bg-teal-300/8 blur-3xl"
        style={{
          transform: "translate(calc((var(--mx) - 0.5) * 18px), calc((0.5 - var(--my)) * 18px))",
        }}
      ></div>
      <div className="absolute left-[-12rem] top-[8%] h-[38rem] w-[38rem] rounded-full border border-cyan-300/15 orbit-a"></div>
      <div className="absolute right-[-10rem] bottom-[0%] h-[30rem] w-[30rem] rounded-full border border-emerald-300/15 orbit-b"></div>

      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((item) => (
          <div
            key={item.id}
            className="absolute floating-bg-item"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: `${item.size}px`,
              height: `${item.size}px`,
              opacity: item.opacity,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              ["--dx" as any]: `${item.driftX}px`,
              ["--dy" as any]: `${item.driftY}px`,
              ["--rot" as any]: `${item.rotate}deg`,
            }}
          >
            {item.shape === 0 && <span className="block w-full h-full rounded-full border border-emerald-300/70 shadow-[0_0_12px_rgba(16,185,129,0.28)]"></span>}
            {item.shape === 1 && <span className="block w-full h-full rounded-md border border-sky-300/70 shadow-[0_0_12px_rgba(56,189,248,0.28)]"></span>}
            {item.shape === 2 && <span className="block w-full h-full rounded-full bg-gradient-to-tr from-cyan-300/25 to-emerald-300/8"></span>}
            {item.shape === 3 && <span className="block w-full h-full rounded-full border border-cyan-300/50 before:content-[''] before:absolute before:inset-1 before:rounded-full before:border before:border-cyan-300/30"></span>}
            {item.shape === 4 && <span className="block w-full h-full text-cyan-200/60 text-xs font-semibold tracking-wider">CO2</span>}
            {item.shape === 5 && <span className="block w-full h-full text-emerald-200/60 text-xs font-semibold tracking-wider">H2O</span>}
          </div>
        ))}
      </div>

      <style>{`
        .aurora-field {
          opacity: 0.35;
          background:
            radial-gradient(circle at 12% 22%, rgba(45, 212, 191, 0.24), transparent 30%),
            radial-gradient(circle at 84% 12%, rgba(59, 130, 246, 0.22), transparent 32%),
            radial-gradient(circle at 62% 84%, rgba(16, 185, 129, 0.18), transparent 34%);
          background-size: 170% 170%;
          animation: auroraShift 24s ease-in-out infinite alternate;
        }

        .orbit-a {
          animation: orbitSlow 34s linear infinite;
        }

        .orbit-b {
          animation: orbitSlowReverse 42s linear infinite;
        }

        .floating-bg-item {
          transform: translate3d(0, 0, 0);
          will-change: transform, opacity;
          animation-name: floatWander;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @keyframes auroraShift {
          0% {
            background-position: 0% 0%, 100% 0%, 60% 100%;
          }
          100% {
            background-position: 100% 70%, 20% 100%, 0% 20%;
          }
        }

        @keyframes orbitSlow {
          0% {
            transform: rotate(0deg) translateX(0) translateY(0);
          }
          50% {
            transform: rotate(180deg) translateX(16px) translateY(-14px);
          }
          100% {
            transform: rotate(360deg) translateX(0) translateY(0);
          }
        }

        @keyframes orbitSlowReverse {
          0% {
            transform: rotate(0deg) translateX(0) translateY(0);
          }
          50% {
            transform: rotate(-180deg) translateX(-18px) translateY(14px);
          }
          100% {
            transform: rotate(-360deg) translateX(0) translateY(0);
          }
        }

        @keyframes floatWander {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.96);
            opacity: 0.08;
          }
          25% {
            transform: translate3d(calc(var(--dx) * 0.3), calc(var(--dy) * -0.24), 0) rotate(calc(var(--rot) * 0.2)) scale(1.01);
            opacity: 0.18;
          }
          50% {
            transform: translate3d(calc(var(--dx) * -0.2), calc(var(--dy) * 0.42), 0) rotate(calc(var(--rot) * 0.45)) scale(0.99);
            opacity: 0.12;
          }
          75% {
            transform: translate3d(calc(var(--dx) * 0.5), calc(var(--dy) * 0.16), 0) rotate(calc(var(--rot) * 0.72)) scale(1.03);
            opacity: 0.2;
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(var(--rot)) scale(0.96);
            opacity: 0.08;
          }
        }
      `}</style>

      {children}
    </div>
  );
}
