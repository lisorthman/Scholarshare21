'use client';
import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

export default function LottieLoader({ size = 180 }) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch('/Main Scene.json')
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  if (!animationData) return null; // or a fallback spinner

  return (
    <Lottie
      animationData={animationData}
      loop
      style={{ width: size, height: size }}
    />
  );
}