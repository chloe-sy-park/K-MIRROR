import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  fadeInUpVariants,
  staggerContainerVariants,
} from '@/constants/animations';

/* ── FAQ items config ── */
const faqItems = [
  { questionKey: 'landing.faq.q1', answerKey: 'landing.faq.a1' },
  { questionKey: 'landing.faq.q2', answerKey: 'landing.faq.a2' },
  { questionKey: 'landing.faq.q3', answerKey: 'landing.faq.a3' },
  { questionKey: 'landing.faq.q4', answerKey: 'landing.faq.a4' },
] as const;

/* ── Component ── */
const FAQSection = () => {
  const { t } = useTranslation();
  const { ref, isInView } = useScrollAnimation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="landing-section py-24 px-6 lg:px-12 bg-[#F5F5F7]">
      <div ref={ref} className="max-w-3xl mx-auto">
        {/* Header */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <m.h2
            variants={fadeInUpVariants}
            className="text-4xl md:text-5xl font-black heading-font tracking-tighter uppercase"
          >
            {t('landing.faq.title')}
          </m.h2>
        </m.div>

        {/* FAQ accordion */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {faqItems.map((item, index) => (
            <m.div
              key={item.questionKey}
              variants={fadeInUpVariants}
              className="border-b border-gray-100 py-6"
            >
              {/* Question header */}
              <button
                onClick={() => handleToggle(index)}
                className="w-full flex items-center justify-between text-left gap-4"
              >
                <span className="text-lg font-bold heading-font">
                  {t(item.questionKey)}
                </span>
                <m.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-shrink-0"
                >
                  <ChevronDown size={20} className="text-gray-400" />
                </m.span>
              </button>

              {/* Answer body */}
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <m.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pt-4 text-gray-500 text-sm leading-relaxed">
                      {t(item.answerKey)}
                    </p>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default FAQSection;
