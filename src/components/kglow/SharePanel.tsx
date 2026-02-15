import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { Download, Share2, Link } from 'lucide-react';
import * as m from 'framer-motion/m';
import { AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';

interface SharePanelProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  analysisId: string | null;
  celebName: string;
}

const SharePanel = ({ cardRef, analysisId, celebName }: SharePanelProps) => {
  const { t } = useTranslation();
  const [toast, setToast] = useState(false);
  const reportUrl = `https://k-mirror.ai/report/${analysisId || 'demo'}`;

  /* ── Toast helper ──────────────────────────────── */
  const showToast = useCallback(() => {
    setToast(true);
    const id = setTimeout(() => setToast(false), 2000);
    return () => clearTimeout(id);
  }, []);

  /* ── Capture card as canvas/blob ───────────────── */
  const captureCard = useCallback(async (): Promise<{
    canvas: HTMLCanvasElement;
    blob: Blob | null;
  }> => {
    if (!cardRef.current) throw new Error('Card ref not available');
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#0A0A1A',
      scale: 2,
      useCORS: true,
    });
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );
    return { canvas, blob };
  }, [cardRef]);

  /* ── 1. Download Card ──────────────────────────── */
  const handleDownload = useCallback(async () => {
    try {
      const { canvas } = await captureCard();
      const link = document.createElement('a');
      link.download = `kglow-${celebName.replace(/\s+/g, '-').toLowerCase()}-${analysisId || 'demo'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      trackEvent('card_shared', { platform: 'download', celeb_name: celebName });
    } catch {
      // Silently fail — card might not be rendered yet
    }
  }, [captureCard, celebName, analysisId]);

  /* ── 2. Share (Web Share API with fallback) ────── */
  const handleShare = useCallback(async () => {
    try {
      const { blob } = await captureCard();

      if (navigator.share && blob) {
        const file = new File([blob], 'kglow-card.png', { type: 'image/png' });
        await navigator.share({
          title: `K-GLOW Card — ${celebName}`,
          text: `Check out my K-GLOW analysis for ${celebName}!`,
          url: reportUrl,
          files: [file],
        });
        trackEvent('card_shared', { platform: 'share_api', celeb_name: celebName });
        return;
      }

      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(reportUrl);
      showToast();
    } catch (err) {
      // AbortError means user cancelled the share sheet — not a real error
      if (err instanceof Error && err.name === 'AbortError') return;

      // Final fallback: try clipboard
      try {
        await navigator.clipboard.writeText(reportUrl);
        showToast();
      } catch {
        // Nothing more we can do
      }
    }
  }, [captureCard, celebName, reportUrl, showToast]);

  /* ── 3. Copy Link ──────────────────────────────── */
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);
      showToast();
      trackEvent('card_shared', { platform: 'copy_link', celeb_name: celebName });
    } catch {
      // Clipboard API may not be available in insecure contexts
    }
  }, [reportUrl, showToast, celebName]);

  /* ── Button base styles ────────────────────────── */
  const btnClass =
    'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-mono text-[10px] font-bold uppercase tracking-[0.15em] transition-colors';

  return (
    <div className="w-full max-w-[400px] mx-auto space-y-2">
      <div className="flex gap-2">
        {/* Download */}
        <button
          onClick={handleDownload}
          className={`${btnClass} flex-1 bg-[#1A1A2E] text-[#F0F0F0] hover:bg-[#FF2D9B]/20 hover:text-[#FF2D9B] border border-[#1A1A2E] hover:border-[#FF2D9B]/40`}
        >
          <Download size={14} />
          {t('share.download', 'Download')}
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className={`${btnClass} flex-1 bg-[#FF2D9B] text-white hover:bg-[#FF2D9B]/80 border border-[#FF2D9B]`}
        >
          <Share2 size={14} />
          {t('share.share', 'Share')}
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className={`${btnClass} flex-1 bg-[#1A1A2E] text-[#F0F0F0] hover:bg-[#00D4FF]/20 hover:text-[#00D4FF] border border-[#1A1A2E] hover:border-[#00D4FF]/40`}
        >
          <Link size={14} />
          {t('share.copyLink', 'Copy Link')}
        </button>
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center justify-center py-2 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30"
          >
            <span className="font-mono text-[10px] font-bold text-[#00D4FF] uppercase tracking-[0.15em]">
              {t('share.copied', 'Link copied!')}
            </span>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SharePanel;
