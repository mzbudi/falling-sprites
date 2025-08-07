import React from "react";

export const GameLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Falling sprites */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {[...Array(10)].map((_, i) => {
          const spriteIndex = (i % 5) + 1;
          const left = Math.random() * 100;
          const duration = 3 + Math.random() * 4;
          const delay = Math.random() * 5;

          return (
            <img
              key={i}
              src={`/assets/s${spriteIndex}.png`}
              className="falling-sprite absolute w-40 h-40 animate-fall"
              style={{
                left: `${left}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              }}
              alt={`s${spriteIndex}`}
            />
          );
        })}
      </div>

      {/* Main content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
