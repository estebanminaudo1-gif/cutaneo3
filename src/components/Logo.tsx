import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textSize?: string;
}

export default function Logo({ className = "h-8 w-auto", showText = true, textSize = "text-xl" }: LogoProps) {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Icono Vectorial CUTANEO */}
      <svg
        className={`text-black fill-none stroke-current ${className}`}
        viewBox="0 0 100 100"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Un contorno orgánico abstracto minimalista que recuerda a una gota o línea de piel delicada */}
        <path
          d="M50 15 C68 35, 78 50, 78 68 C78 82, 66 90, 50 90 C34 90, 22 82, 22 68 C22 50, 32 35, 50 15 Z"
          strokeWidth="3"
        />
        <path
          d="M50 35 C42 48, 38 58, 38 68 C38 76, 44 80, 50 80"
          strokeWidth="2"
          opacity="0.6"
        />
        <circle cx="50" cy="68" r="4" className="fill-black" />
      </svg>
      
      {/* Texto Tipográfico CUTANEO */}
      {showText && (
        <span className={`font-light tracking-[0.25em] ${textSize} text-black font-sans uppercase`}>
          Cutaneo
        </span>
      )}
    </div>
  );
}
