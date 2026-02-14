import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LandingFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0F0F0F] text-white py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Logo + tagline */}
          <div>
            <h2 className="text-2xl font-black heading-font tracking-tighter italic uppercase">
              K-MIRROR <span className="text-[#FF4D8D] not-italic">AI</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mt-3">
              {t('landing.footer.tagline')}
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8">
            <Link
              to="/privacy"
              className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors"
            >
              {t('landing.footer.privacy')}
            </Link>
            <Link
              to="/terms"
              className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors"
            >
              {t('landing.footer.terms')}
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800 my-10" />

        {/* Copyright */}
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 text-center">
          {t('landing.footer.copyright')}
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
