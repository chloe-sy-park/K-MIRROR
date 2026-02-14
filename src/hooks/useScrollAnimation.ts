import { useRef } from 'react';
import { useInView } from 'framer-motion';

interface UseScrollAnimationOptions {
  once?: boolean;
  margin?: string;
}

export const useScrollAnimation = (options?: UseScrollAnimationOptions) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: options?.once ?? true,
    margin: (options?.margin ?? '-100px') as `${number}px`,
  });

  return { ref, isInView };
};
