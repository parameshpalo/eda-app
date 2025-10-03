// src/components/Placeholder.tsx
interface PlaceholderProps {
  imageSrc: string;
  title: string;
  subtitle: string;
}

export default function Placeholder({ imageSrc, title, subtitle }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full bg-gray-100">
      {/* 👆 min-h ensures it stretches below header, 4rem = header height */}

      <img
        src={imageSrc}
        alt={title}
        className="w-64 mb-6"
      />
      <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
      <p className="text-gray-500 text-lg">{subtitle}</p>
    </div>
  );
}
