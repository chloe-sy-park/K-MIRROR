import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { containerVariants, itemVariants } from '@/constants/animations';

interface PolicySection {
  title: string;
  content: string[];
}

const enSections: PolicySection[] = [
  {
    title: '1. Information We Collect',
    content: [
      'Facial Image Data: When you use the K-MIRROR analysis feature, your device camera captures a facial image which is transmitted to Google Gemini AI for real-time analysis. This image is processed in-memory for the sole purpose of generating your beauty analysis results. K-MIRROR does not store, save, or retain your facial images on any server. Once the analysis is complete, the image data is discarded and is not recoverable.',
      'Account Information: If you choose to create an account, we collect your email address through Supabase Authentication. This is used solely to identify your account, enable you to save analysis results, and manage your order history.',
      'Purchase History: When you make a purchase, your order details (items selected, quantities, shipping address, and transaction identifiers) are recorded for order fulfillment purposes. Payment card details are processed exclusively by Stripe and are never transmitted to or stored on K-MIRROR servers.',
      'User Preferences: Your environment setting, makeup skill level, and mood preferences are stored locally on your device using browser localStorage (key: kmirror_settings). This data never leaves your device.',
      'Consent Records: Your biometric consent and cookie consent decisions are stored locally on your device (key: kmirror_consent) to ensure we do not prompt you unnecessarily and to maintain a record of your choices.',
    ],
  },
  {
    title: '2. How We Use Your Data',
    content: [
      'AI-Powered Facial Analysis: Your facial image is sent to Google Gemini AI to analyze skin tone, face shape, bone structure, and other facial characteristics. The results are used to generate personalized K-beauty style recommendations tailored to your unique features.',
      'Personalized Product Recommendations: Based on your analysis results, we suggest K-beauty products from our curated catalog that are suited to your skin tone, facial structure, and style preferences.',
      'Order Fulfillment and Customer Support: We use your account and order information to process purchases, arrange delivery, and respond to any inquiries related to your orders.',
      'Service Improvement: Aggregated, anonymized usage patterns may be used to improve the quality of our analysis algorithms, product catalog, and overall user experience. No personally identifiable information is used for this purpose without your explicit consent.',
    ],
  },
  {
    title: '3. Biometric Data',
    content: [
      'K-MIRROR analyzes biometric facial features including, but not limited to, skin tone classification, face shape geometry, bone structure proportions (zygomatic arch, mandible prominence), canthal tilt, and facial symmetry ratios. This analysis is performed by Google Gemini AI.',
      'All biometric analysis is performed in real-time. Your facial image is transmitted to Google Gemini AI via a secure, encrypted connection for processing. The image is not permanently stored by K-MIRROR at any point during or after this process.',
      'You must provide explicit, informed consent before each initial analysis session. A biometric consent dialog will be presented before the camera is activated. You may decline, in which case no image data will be captured or transmitted.',
      'You may withdraw your consent for biometric analysis at any time by navigating to Settings within the application. Withdrawing consent will prevent future biometric analyses until consent is re-granted. Previously generated analysis results that you have saved will remain accessible but no new biometric data will be collected.',
      'For residents of jurisdictions with biometric privacy laws (including but not limited to Illinois BIPA, Texas CUBI, and Washington state biometric identifiers law), please note: K-MIRROR does not store biometric identifiers or biometric information. Facial images are processed transiently and discarded immediately upon completion of the analysis.',
    ],
  },
  {
    title: '4. Third-Party Services',
    content: [
      'Supabase: Provides authentication services and database hosting for user accounts and saved analysis results. Supabase processes your email address and stores your account data in compliance with their privacy policy. Data is stored in secure, SOC 2 Type II compliant infrastructure.',
      'Google Gemini AI: Performs facial image analysis. When you initiate a scan, your facial image is sent to Google Gemini AI for processing. Google processes this data in accordance with their AI terms of service. K-MIRROR does not control how Google processes data once transmitted, and we recommend reviewing Google\'s Privacy Policy for details.',
      'Stripe: Handles all payment processing. When you make a purchase, your payment information is transmitted directly to Stripe and is never processed by or stored on K-MIRROR servers. Stripe is PCI DSS Level 1 certified.',
      'YouTube Data API: Used to curate educational K-beauty video content relevant to your analysis results. Your use of YouTube content embedded within K-MIRROR is subject to Google\'s Privacy Policy (https://policies.google.com/privacy) and YouTube\'s Terms of Service.',
      'Vercel: Provides application hosting and content delivery. Vercel may collect standard server logs including IP addresses as part of their hosting infrastructure.',
    ],
  },
  {
    title: '5. Cookies & Local Storage',
    content: [
      'K-MIRROR primarily uses browser localStorage rather than traditional HTTP cookies to store application data on your device. The following localStorage keys are used:',
      'kmirror_lang: Your preferred language setting (English or Korean). This is essential for the application to function correctly in your chosen language.',
      'kmirror_settings: Your environment, skill level, and mood preferences for the analysis engine. This data remains on your device and is not transmitted to any server.',
      'kmirror_consent: Records of your biometric data consent and cookie/analytics consent decisions. This is essential for legal compliance and to respect your privacy choices.',
      'kmirror_cart: Your current shopping cart contents. This data remains on your device until you complete a purchase or clear your cart.',
      'No third-party tracking cookies are placed by K-MIRROR. We do not use advertising cookies, social media tracking pixels, or cross-site tracking mechanisms. If you accept analytics cookies via the cookie consent banner, minimal anonymized usage data may be collected to improve the service.',
    ],
  },
  {
    title: '6. Your Rights',
    content: [
      'Access: You have the right to request a copy of the personal data we hold about you, including your account information and order history.',
      'Deletion: You may request the deletion of your account and all associated personal data at any time. Upon receiving such a request, we will delete your account information and any saved analysis results from our servers. Please note that order records may be retained as required by applicable tax and commercial regulations.',
      'Data Portability: You have the right to receive your personal data in a structured, commonly used, and machine-readable format.',
      'Withdraw Consent: You may withdraw your consent for biometric facial analysis at any time through the Settings page. This will not affect the lawfulness of any processing performed prior to withdrawal.',
      'Opt Out: You may opt out of optional analytics cookies at any time by adjusting your consent preferences. Essential localStorage (language, settings, consent records) cannot be opted out of as it is necessary for the application to function.',
      'If you are a resident of the European Economic Area (EEA), you may also have additional rights under the General Data Protection Regulation (GDPR), including the right to restrict processing and the right to lodge a complaint with a supervisory authority.',
    ],
  },
  {
    title: '7. Data Security',
    content: [
      'All data transmitted between your device and our servers is encrypted using HTTPS with TLS 1.2 or higher. This includes facial images sent for analysis, account credentials, and payment-related communications.',
      'API keys and sensitive credentials are stored exclusively on the server side through Supabase Edge Functions and are never exposed to or accessible from the client-side application code.',
      'Database access is governed by Supabase Row Level Security (RLS) policies, ensuring that users can only access their own data. No user can read, modify, or delete another user\'s account information or saved analyses.',
      'We conduct regular reviews of our security practices and promptly address any identified vulnerabilities. While no system can guarantee absolute security, we implement industry-standard measures to protect your data.',
    ],
  },
  {
    title: '8. Children\'s Privacy',
    content: [
      'K-MIRROR is not intended for use by individuals under the age of 13. We do not knowingly collect personal information, including biometric data, from children under 13 years of age.',
      'If we become aware that we have inadvertently collected personal data from a child under 13, we will take immediate steps to delete such information from our records. If you are a parent or guardian and believe your child has provided personal information to K-MIRROR, please contact us at the email address listed below.',
    ],
  },
  {
    title: '9. Changes to This Policy',
    content: [
      'We reserve the right to update or modify this Privacy Policy at any time. When we make changes, we will update the "Last Updated" date at the top of this page.',
      'For material changes that significantly affect how we collect, use, or share your personal data, we will provide prominent notice within the application before the changes take effect.',
      'Your continued use of K-MIRROR after any changes to this Privacy Policy constitutes your acceptance of the revised terms. We encourage you to review this page periodically to stay informed about our data practices.',
    ],
  },
  {
    title: '10. Contact',
    content: [
      'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:',
      'Email: privacy@k-mirror.app',
      'We will endeavor to respond to all legitimate inquiries within 30 days. If you feel that your privacy rights have been violated, you also have the right to lodge a complaint with your local data protection authority.',
    ],
  },
];

const koSections: PolicySection[] = [
  {
    title: '1. 수집하는 개인정보 항목',
    content: [
      '얼굴 이미지 데이터: K-MIRROR 분석 기능을 이용하실 때, 기기의 카메라를 통해 촬영된 얼굴 이미지가 Google Gemini AI로 전송되어 실시간으로 분석됩니다. 해당 이미지는 뷰티 분석 결과 생성만을 위해 메모리상에서 처리되며, K-MIRROR의 어떠한 서버에도 저장, 보관 또는 유지되지 않습니다. 분석이 완료되면 이미지 데이터는 즉시 폐기되며 복구할 수 없습니다.',
      '계정 정보: 회원가입 시 Supabase 인증 서비스를 통해 이메일 주소를 수집합니다. 이는 계정 식별, 분석 결과 저장, 주문 내역 관리의 목적으로만 사용됩니다.',
      '구매 내역: 구매 시 주문 상세 정보(선택 제품, 수량, 배송 주소, 거래 식별자)가 주문 이행을 위해 기록됩니다. 결제 카드 정보는 Stripe에서 직접 처리되며, K-MIRROR 서버로 전송되거나 저장되지 않습니다.',
      '사용자 환경 설정: 환경, 메이크업 숙련도, 무드 설정은 브라우저 localStorage(키: kmirror_settings)를 통해 사용자의 기기에만 로컬로 저장됩니다. 이 데이터는 사용자의 기기를 벗어나지 않습니다.',
      '동의 기록: 생체 데이터 동의 및 쿠키 동의 내역은 사용자 기기의 localStorage(키: kmirror_consent)에 저장되어, 불필요한 중복 요청을 방지하고 사용자의 선택 기록을 유지합니다.',
    ],
  },
  {
    title: '2. 개인정보의 이용 목적',
    content: [
      'AI 기반 얼굴 분석: 얼굴 이미지를 Google Gemini AI에 전송하여 피부 톤, 얼굴형, 골격 구조 및 기타 얼굴 특성을 분석합니다. 분석 결과는 사용자의 고유한 특징에 맞춘 개인화된 K-뷰티 스타일 추천을 생성하는 데 사용됩니다.',
      '맞춤형 제품 추천: 분석 결과를 기반으로, 사용자의 피부 톤, 얼굴 구조 및 스타일 선호도에 적합한 큐레이션된 K-뷰티 제품을 추천합니다.',
      '주문 처리 및 고객 지원: 계정 및 주문 정보를 활용하여 구매 처리, 배송 수배, 주문 관련 문의 응대를 진행합니다.',
      '서비스 개선: 비식별화된 집계 사용 패턴을 분석 알고리즘, 제품 카탈로그, 전반적인 사용자 경험 개선에 활용할 수 있습니다. 별도의 명시적 동의 없이 개인 식별 정보를 이 목적으로 사용하지 않습니다.',
    ],
  },
  {
    title: '3. 생체(바이오메트릭) 데이터',
    content: [
      'K-MIRROR는 피부 톤 분류, 얼굴형 기하학, 골격 비율(광대뼈 아치, 하악골 돌출도), 눈꼬리 각도(Canthal Tilt), 안면 대칭 비율 등을 포함하되 이에 국한되지 않는 생체 얼굴 특징을 분석합니다. 이 분석은 Google Gemini AI에 의해 수행됩니다.',
      '모든 생체 분석은 실시간으로 이루어집니다. 얼굴 이미지는 안전한 암호화 연결을 통해 Google Gemini AI로 전송되어 처리됩니다. 이 과정 중 또는 이후 어느 시점에서도 K-MIRROR가 해당 이미지를 영구적으로 저장하지 않습니다.',
      '최초 분석 세션 시작 전에 반드시 명시적이고 충분한 정보에 기반한 동의를 제공하셔야 합니다. 카메라가 활성화되기 전에 생체 데이터 동의 대화 상자가 표시됩니다. 동의를 거부하시면 이미지 데이터가 촬영되거나 전송되지 않습니다.',
      '설정 메뉴를 통해 언제든지 생체 분석에 대한 동의를 철회하실 수 있습니다. 동의를 철회하시면 재동의 전까지 새로운 생체 분석이 수행되지 않습니다. 기존에 저장한 분석 결과는 계속 열람 가능하나, 새로운 생체 데이터는 수집되지 않습니다.',
      '생체정보 보호 관련 법률이 적용되는 지역(대한민국 개인정보보호법의 민감정보 조항 포함)에 거주하시는 분들께 안내드립니다: K-MIRROR는 생체 인식 정보를 저장하지 않습니다. 얼굴 이미지는 일시적으로 처리된 후 분석 완료 즉시 폐기됩니다.',
    ],
  },
  {
    title: '4. 제3자 서비스 제공',
    content: [
      'Supabase: 사용자 계정 인증 서비스 및 데이터베이스 호스팅을 제공합니다. Supabase는 사용자의 이메일 주소를 처리하고 자체 개인정보 처리방침에 따라 계정 데이터를 저장합니다. 데이터는 SOC 2 Type II 인증을 받은 보안 인프라에 저장됩니다.',
      'Google Gemini AI: 얼굴 이미지 분석을 수행합니다. 스캔을 시작하면 얼굴 이미지가 Google Gemini AI로 전송되어 처리됩니다. Google은 자사의 AI 서비스 약관에 따라 해당 데이터를 처리합니다. 전송된 데이터에 대한 Google의 처리 방식은 K-MIRROR가 통제할 수 없으므로, Google의 개인정보 처리방침을 별도로 확인하시기를 권장합니다.',
      'Stripe: 모든 결제 처리를 담당합니다. 구매 시 결제 정보는 Stripe로 직접 전송되며, K-MIRROR 서버에서 처리되거나 저장되지 않습니다. Stripe는 PCI DSS Level 1 인증을 보유하고 있습니다.',
      'YouTube Data API: 분석 결과와 관련된 K-뷰티 교육 동영상 콘텐츠를 큐레이션하는 데 사용됩니다. K-MIRROR 내에서 YouTube 콘텐츠를 이용하시는 경우 Google의 개인정보 처리방침(https://policies.google.com/privacy) 및 YouTube 서비스 약관이 적용됩니다.',
      'Vercel: 애플리케이션 호스팅 및 콘텐츠 전송을 제공합니다. Vercel은 호스팅 인프라의 일환으로 IP 주소를 포함한 표준 서버 로그를 수집할 수 있습니다.',
    ],
  },
  {
    title: '5. 쿠키 및 로컬 스토리지',
    content: [
      'K-MIRROR는 기존의 HTTP 쿠키 대신 브라우저 localStorage를 주로 사용하여 애플리케이션 데이터를 사용자 기기에 저장합니다. 다음의 localStorage 키가 사용됩니다:',
      'kmirror_lang: 사용자의 언어 설정(한국어 또는 영어). 선택한 언어로 애플리케이션이 정상 작동하기 위해 필수적입니다.',
      'kmirror_settings: 분석 엔진에 대한 환경, 숙련도, 무드 설정. 이 데이터는 사용자 기기에만 존재하며 서버로 전송되지 않습니다.',
      'kmirror_consent: 생체 데이터 동의 및 쿠키/분석 동의 내역. 법적 준수 및 개인정보 보호 선택 존중을 위해 필수적입니다.',
      'kmirror_cart: 현재 장바구니 내용. 구매 완료 또는 장바구니 비우기 전까지 사용자 기기에 저장됩니다.',
      'K-MIRROR는 제3자 추적 쿠키를 사용하지 않습니다. 광고 쿠키, 소셜 미디어 추적 픽셀, 크로스 사이트 추적 메커니즘을 사용하지 않습니다. 쿠키 동의 배너를 통해 분석 쿠키에 동의하신 경우, 서비스 개선을 위한 최소한의 익명화된 사용 데이터가 수집될 수 있습니다.',
    ],
  },
  {
    title: '6. 이용자의 권리',
    content: [
      '열람권: 당사가 보유한 개인정보(계정 정보 및 주문 내역 포함)의 사본을 요청하실 수 있습니다.',
      '삭제권: 언제든지 계정 및 관련 개인정보의 삭제를 요청하실 수 있습니다. 요청 접수 시 계정 정보와 저장된 분석 결과를 서버에서 삭제합니다. 다만, 관련 세법 및 상법에 따라 주문 기록은 일정 기간 보존될 수 있습니다.',
      '데이터 이동권: 개인정보를 체계적이고 통상적으로 사용되며 기계 판독이 가능한 형식으로 제공받을 권리가 있습니다.',
      '동의 철회: 설정 페이지를 통해 생체 얼굴 분석에 대한 동의를 언제든지 철회하실 수 있습니다. 동의 철회는 철회 이전에 수행된 처리의 적법성에 영향을 미치지 않습니다.',
      '선택적 거부: 언제든지 동의 설정 변경을 통해 선택적 분석 쿠키를 거부하실 수 있습니다. 필수 localStorage(언어, 설정, 동의 기록)는 애플리케이션 정상 작동에 필요하므로 거부 대상에서 제외됩니다.',
      '대한민국 개인정보보호법에 따라 정보주체는 개인정보의 처리 정지를 요구할 권리, 손해배상을 청구할 권리 등 추가적인 권리를 보유합니다. 또한 개인정보보호위원회 또는 한국인터넷진흥원(KISA)에 피해 구제를 신청하실 수 있습니다.',
    ],
  },
  {
    title: '7. 데이터 보안',
    content: [
      '사용자 기기와 서버 간 전송되는 모든 데이터는 TLS 1.2 이상의 HTTPS 암호화를 적용합니다. 분석용 얼굴 이미지, 계정 인증 정보, 결제 관련 통신 모두 이에 해당합니다.',
      'API 키 및 민감한 자격증명은 Supabase Edge Functions를 통해 서버 측에서만 저장되며, 클라이언트 측 애플리케이션 코드에서는 접근하거나 노출되지 않습니다.',
      '데이터베이스 접근은 Supabase Row Level Security(RLS) 정책에 의해 관리되어, 사용자는 자신의 데이터에만 접근할 수 있습니다. 다른 사용자의 계정 정보나 저장된 분석 결과를 열람, 수정 또는 삭제할 수 없습니다.',
      '보안 관행에 대한 정기적인 점검을 수행하며, 식별된 취약점은 신속하게 조치합니다. 완벽한 보안을 보장할 수 있는 시스템은 없으나, 사용자 데이터 보호를 위해 업계 표준의 보안 조치를 시행하고 있습니다.',
    ],
  },
  {
    title: '8. 아동 개인정보 보호',
    content: [
      'K-MIRROR는 만 14세 미만 아동의 이용을 대상으로 하지 않습니다. 당사는 만 14세 미만 아동의 개인정보(생체 데이터 포함)를 고의로 수집하지 않습니다.',
      '만 14세 미만 아동의 개인정보가 부주의하게 수집된 사실을 인지하게 될 경우, 해당 정보를 즉시 삭제하기 위한 조치를 취합니다. 부모 또는 보호자로서 자녀가 K-MIRROR에 개인정보를 제공한 것으로 판단되시면, 아래 연락처로 문의해 주시기 바랍니다.',
    ],
  },
  {
    title: '9. 개인정보 처리방침의 변경',
    content: [
      '당사는 필요에 따라 본 개인정보 처리방침을 수정하거나 변경할 수 있습니다. 변경 시에는 본 페이지 상단의 "최종 수정일"을 갱신합니다.',
      '개인정보의 수집, 이용 또는 공유 방식에 중대한 영향을 미치는 변경의 경우, 변경 사항이 적용되기 전에 애플리케이션 내에서 눈에 띄는 공지를 제공합니다.',
      '본 개인정보 처리방침의 변경 후에도 K-MIRROR를 계속 이용하시는 경우 변경된 내용에 동의하신 것으로 간주됩니다. 당사의 데이터 처리 관행에 대해 지속적으로 확인하시려면 본 페이지를 정기적으로 방문해 주시기를 권장합니다.',
    ],
  },
  {
    title: '10. 문의',
    content: [
      '본 개인정보 처리방침 또는 당사의 데이터 처리 관행에 대해 질문, 우려 사항, 또는 요청이 있으시면 아래 연락처로 문의해 주시기 바랍니다:',
      '이메일: privacy@k-mirror.app',
      '모든 정당한 문의에 대해 접수일로부터 30일 이내에 회신드리겠습니다. 개인정보 권리가 침해되었다고 판단되시는 경우, 개인정보보호위원회(https://www.pipc.go.kr) 또는 한국인터넷진흥원 개인정보침해신고센터(https://privacy.kisa.or.kr)에 신고하실 수 있습니다.',
    ],
  },
];

const PrivacyPolicyView = () => {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const sections = isKo ? koSections : enSections;

  return (
    <m.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-3xl mx-auto py-20 px-6"
    >
      <m.div variants={itemVariants} className="mb-16">
        <h1 className="text-4xl sm:text-5xl font-black heading-font uppercase tracking-tighter mb-4">
          {t('legal.privacyPolicy')}
        </h1>
        <p className="text-sm text-gray-400 tracking-wide">
          {t('legal.lastUpdated')}
        </p>
      </m.div>

      {sections.map((section) => (
        <m.section key={section.title} variants={itemVariants}>
          <h2 className="text-xl font-black uppercase tracking-wider mt-12 mb-4">
            {section.title}
          </h2>
          <div className="space-y-4">
            {section.content.map((paragraph, idx) => (
              <p
                key={idx}
                className="text-sm text-gray-600 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </m.section>
      ))}
    </m.div>
  );
};

export default PrivacyPolicyView;
