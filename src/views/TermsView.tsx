import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { containerVariants, itemVariants } from '@/constants/animations';

interface TermsSection {
  title: string;
  content: string[];
}

const enSections: TermsSection[] = [
  {
    title: '1. Acceptance of Terms',
    content: [
      'By accessing, browsing, or using the K-MIRROR application ("Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms") and our Privacy Policy, which is incorporated herein by reference. These Terms constitute a legally binding agreement between you ("User," "you," or "your") and K-MIRROR ("we," "us," or "our").',
      'If you do not agree with any part of these Terms, you must immediately discontinue use of the Service. Your continued access to or use of the Service following the posting of any changes to these Terms constitutes acceptance of those changes.',
    ],
  },
  {
    title: '2. Service Description',
    content: [
      'K-MIRROR is an AI-powered K-beauty analysis and styling recommendation platform. The Service utilizes facial recognition technology powered by Google Gemini AI to analyze facial features including skin tone, face shape, bone structure, and other characteristics to provide personalized Korean beauty and styling recommendations.',
      'Core features of the Service include: AI-powered facial analysis for skin tone and face shape classification; celebrity style matching based on facial feature similarity; personalized K-beauty product recommendations curated to your unique features; an e-commerce platform for purchasing recommended K-beauty products; and expert matching for professional beauty and styling consultations.',
      'The Service is provided strictly for entertainment and educational purposes only. AI-generated analysis results, product recommendations, and style suggestions do not constitute professional medical, dermatological, cosmetic, or any other form of professional advice. Users should not rely on the Service as a substitute for qualified professional guidance.',
    ],
  },
  {
    title: '3. User Accounts',
    content: [
      'You may create an account using a valid email address or through Google OAuth authentication. By creating an account, you represent and warrant that: (a) all registration information you provide is truthful, accurate, current, and complete; (b) you will maintain and promptly update such information to keep it truthful, accurate, current, and complete; and (c) you are at least 13 years of age (or 14 years of age for residents of South Korea).',
      'You are solely responsible for maintaining the confidentiality and security of your account credentials, including your password and any authentication tokens. You agree to immediately notify us of any unauthorized use of your account or any other breach of security. We shall not be liable for any loss or damage arising from your failure to safeguard your account information.',
      'Each individual is permitted to maintain only one active account. Creating multiple accounts for the purpose of abusing promotions, circumventing restrictions, or any other deceptive purpose is strictly prohibited and may result in the termination of all associated accounts.',
    ],
  },
  {
    title: '4. Acceptable Use',
    content: [
      'You agree to use the Service only for its intended purpose of personal beauty analysis and product discovery. You shall use the Service in compliance with all applicable local, national, and international laws and regulations.',
      'You shall not upload, transmit, or submit any images that: contain offensive, obscene, or inappropriate content; depict individuals other than yourself without their explicit consent; contain content that is illegal or promotes illegal activities; or infringe upon the intellectual property rights, privacy rights, or other rights of any third party.',
      'You shall not attempt to reverse-engineer, decompile, disassemble, or otherwise attempt to derive the source code, algorithms, or underlying technology of the Service, including but not limited to the AI analysis models and recommendation engines.',
      'You shall not use any automated tools, bots, crawlers, scrapers, or similar technologies to access, interact with, or extract data from the Service. You shall not circumvent, disable, or otherwise interfere with any rate limits, security features, access controls, or other protective measures implemented within the Service.',
      'Violation of these acceptable use provisions may result in immediate suspension or termination of your account, at our sole discretion, with or without prior notice.',
    ],
  },
  {
    title: '5. Intellectual Property',
    content: [
      'The K-MIRROR application, including but not limited to its design, user interface, AI analysis technology, algorithms, recommendation engine, source code, graphics, logos, trademarks, and all associated intellectual property, are and shall remain the exclusive property of K-MIRROR and its licensors. These are protected by applicable copyright, trademark, patent, and other intellectual property laws.',
      'You retain full ownership of any photographs or images that you upload to the Service. By uploading an image, you grant K-MIRROR a limited, non-exclusive, non-transferable, revocable license to process your image solely for the purpose of performing the AI facial analysis. This license terminates immediately upon completion of the analysis, and your images are not stored or retained on our servers.',
      'Analysis results generated by the Service, including style recommendations, product suggestions, and celebrity match information, are provided for your personal, non-commercial use only. You may not reproduce, distribute, publicly display, or create derivative works from such results for any commercial purpose without our prior written consent.',
    ],
  },
  {
    title: '6. Payment Terms',
    content: [
      'Product purchases made through the K-MIRROR shop are processed securely by Stripe, a PCI DSS Level 1 certified third-party payment processor. By making a purchase, you agree to Stripe\'s terms of service and privacy policy in addition to these Terms.',
      'All prices displayed on the Service are in the applicable currency as indicated at the time of purchase. Prices are subject to change without prior notice, provided that any price change will not affect orders that have already been confirmed.',
      'K-MIRROR acts as a facilitator for payment processing and is not directly responsible for the payment processing services provided by Stripe. Any issues related to payment processing, chargebacks, or payment disputes should first be directed to Stripe, though we will endeavor to assist where possible.',
      'Refund Policy: If you are not satisfied with a product purchase, you may contact our customer support within fourteen (14) days of the date of purchase to request a refund. Refund requests will be evaluated on a case-by-case basis, and approved refunds will be processed through the original payment method.',
      'Expert session bookings may be subject to separate cancellation and refund policies as specified at the time of booking. Cancellation terms for expert sessions will be clearly communicated before you confirm your booking.',
    ],
  },
  {
    title: '7. AI Disclaimer',
    content: [
      'The AI-powered analysis results provided by K-MIRROR are generated using Google Gemini AI technology. While we strive to provide helpful and relevant recommendations, it is essential that you understand and acknowledge the following limitations:',
      'All analysis results, including skin tone classifications, face shape determinations, celebrity style matches, and product recommendations, are generated for entertainment and educational purposes ONLY. These results do NOT constitute medical advice, dermatological diagnosis, cosmetic prescription, or any form of professional beauty consultation.',
      'We do not guarantee the accuracy, completeness, reliability, or suitability of any AI-generated recommendations. AI analysis is inherently probabilistic, and results may vary based on image quality, lighting conditions, camera angle, and other environmental factors.',
      'You should always consult qualified medical professionals, licensed dermatologists, or certified beauty professionals for any concerns related to skin health, skin conditions, allergies, or other medical or dermatological matters. Never disregard professional medical advice or delay seeking treatment based on information provided by this Service.',
      'Analysis results are subjective in nature and reflect algorithmic interpretations. Different analyses of the same image may yield varying results. The Service should be used as a source of inspiration and general guidance, not as definitive or authoritative advice.',
    ],
  },
  {
    title: '8. Limitation of Liability',
    content: [
      'THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY. WE EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.',
      'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, K-MIRROR AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE.',
      'Our total cumulative liability to you for any and all claims arising out of or related to the Service shall not exceed the total amount you have actually paid to K-MIRROR for the specific service giving rise to the claim during the twelve (12) months immediately preceding the event giving rise to such liability.',
      'We are not responsible for any disruptions, outages, data loss, or service failures caused by third-party service providers, including but not limited to Supabase (authentication and database), Stripe (payment processing), Google (AI analysis and OAuth), and Vercel (hosting). The availability of the Service is dependent upon these third-party providers, and we cannot guarantee uninterrupted service.',
    ],
  },
  {
    title: '9. Privacy',
    content: [
      'Your use of the Service is also governed by our Privacy Policy, which describes in detail how we collect, use, process, store, and protect your personal information, including biometric facial data.',
      'Please review our Privacy Policy carefully. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy. The Privacy Policy is incorporated into and forms an integral part of these Terms.',
    ],
  },
  {
    title: '10. Changes to Terms',
    content: [
      'We reserve the right to modify, update, or revise these Terms at any time, at our sole discretion. When we make changes, we will update the "Last Updated" date at the top of this page.',
      'For material changes that substantially affect your rights or obligations under these Terms, we will provide reasonable advance notice through the Service, such as a prominent in-app notification or an email to the address associated with your account.',
      'Your continued use of the Service after the effective date of any revised Terms constitutes your acceptance of and agreement to the updated Terms. If you do not agree with any revised Terms, your sole remedy is to discontinue use of the Service.',
    ],
  },
  {
    title: '11. Governing Law & Dispute Resolution',
    content: [
      'These Terms shall be governed by, construed, and enforced in accordance with the applicable laws of the jurisdiction in which you reside, without regard to its conflict of law principles.',
      'Any dispute, controversy, or claim arising out of or relating to these Terms or the Service shall first be attempted to be resolved through good-faith negotiation between the parties. If the dispute cannot be resolved through negotiation within thirty (30) days, either party may submit the dispute to binding arbitration or the competent courts of the applicable jurisdiction.',
      'Nothing in these Terms shall limit or exclude any rights you may have under applicable consumer protection legislation that cannot be lawfully limited or excluded.',
    ],
  },
  {
    title: '12. Contact',
    content: [
      'If you have any questions, concerns, or feedback regarding these Terms of Service, please contact us at:',
      'Email: legal@k-mirror.app',
      'We will make every effort to respond to your inquiries in a timely manner and to resolve any issues to your satisfaction.',
    ],
  },
];

const koSections: TermsSection[] = [
  {
    title: '1. 약관의 동의',
    content: [
      'K-MIRROR 애플리케이션(이하 "서비스")에 접속하거나 이를 이용함으로써, 귀하는 본 이용약관(이하 "약관")과 이에 참조로 포함된 개인정보 처리방침을 읽고 이해하였으며 이에 동의합니다. 본 약관은 귀하(이하 "이용자")와 K-MIRROR(이하 "회사") 간의 법적 구속력을 갖는 계약을 구성합니다.',
      '본 약관의 어떤 부분에라도 동의하지 않으시는 경우, 즉시 서비스 이용을 중단하여 주시기 바랍니다. 본 약관의 변경 사항이 게시된 이후에도 서비스를 계속 이용하시는 경우, 해당 변경 사항에 동의하신 것으로 간주됩니다. 본 약관은 「전자상거래 등에서의 소비자보호에 관한 법률」 및 관련 법령에 따라 작성되었습니다.',
    ],
  },
  {
    title: '2. 서비스 설명',
    content: [
      'K-MIRROR는 AI 기반의 K-뷰티 분석 및 스타일링 추천 플랫폼입니다. 본 서비스는 Google Gemini AI가 구동하는 안면 인식 기술을 활용하여 피부 톤, 얼굴형, 골격 구조 등의 얼굴 특성을 분석하고, 이를 기반으로 개인화된 한국 뷰티 및 스타일링 추천을 제공합니다.',
      '서비스의 주요 기능은 다음과 같습니다: 피부 톤 및 얼굴형 분류를 위한 AI 기반 안면 분석; 얼굴 특성 유사도 기반의 연예인 스타일 매칭; 이용자의 고유한 특성에 맞춘 K-뷰티 제품 추천; 추천 K-뷰티 제품 구매를 위한 전자상거래 플랫폼; 전문 뷰티 및 스타일링 상담을 위한 전문가 매칭 서비스.',
      '본 서비스는 오락 및 교육 목적으로만 제공됩니다. AI가 생성한 분석 결과, 제품 추천 및 스타일 제안은 전문적인 의료, 피부과, 미용 또는 기타 어떠한 형태의 전문 상담에도 해당하지 않습니다. 이용자는 전문적인 판단이 필요한 사안에 대해 본 서비스를 대체 수단으로 사용해서는 안 됩니다.',
    ],
  },
  {
    title: '3. 이용자 계정',
    content: [
      '이용자는 유효한 이메일 주소 또는 Google OAuth 인증을 통해 계정을 생성할 수 있습니다. 계정 생성 시 이용자는 다음을 보증합니다: (가) 제공하는 모든 가입 정보가 진실되고 정확하며 최신이고 완전할 것; (나) 해당 정보를 진실되고 정확하며 최신이고 완전한 상태로 유지 및 갱신할 것; (다) 만 14세 이상일 것(「개인정보보호법」 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따름).',
      '이용자는 비밀번호 및 인증 토큰을 포함한 계정 자격증명의 기밀성과 보안을 유지할 전적인 책임이 있습니다. 계정의 무단 사용 또는 기타 보안 위반 사실을 인지한 경우 즉시 회사에 통보하여야 합니다. 이용자가 계정 정보를 적절히 보호하지 못하여 발생하는 손실이나 손해에 대해 회사는 책임지지 않습니다.',
      '1인당 하나의 활성 계정만 유지할 수 있습니다. 프로모션 남용, 제한 우회 또는 기타 기만적 목적으로 다수의 계정을 생성하는 행위는 엄격히 금지되며, 관련된 모든 계정이 해지될 수 있습니다.',
    ],
  },
  {
    title: '4. 이용 수칙',
    content: [
      '이용자는 개인적인 뷰티 분석 및 제품 탐색이라는 본래의 목적에 한해서만 서비스를 이용하여야 합니다. 서비스 이용 시 모든 관련 국내외 법률 및 규정을 준수하여야 합니다.',
      '이용자는 다음에 해당하는 이미지를 업로드, 전송 또는 제출하여서는 안 됩니다: 불쾌하거나 음란하거나 부적절한 콘텐츠가 포함된 이미지; 본인이 아닌 타인의 명시적 동의 없이 촬영된 이미지; 불법적이거나 불법 활동을 조장하는 콘텐츠가 포함된 이미지; 제3자의 지식재산권, 개인정보 또는 기타 권리를 침해하는 이미지.',
      '서비스의 소스 코드, 알고리즘 또는 기반 기술(AI 분석 모델 및 추천 엔진 포함)에 대해 역설계, 디컴파일, 역어셈블 또는 기타 방법으로 추출을 시도하는 행위는 금지됩니다.',
      '자동화 도구, 봇, 크롤러, 스크래퍼 또는 유사 기술을 사용하여 서비스에 접근하거나 데이터를 추출하는 행위는 금지됩니다. 서비스에 구현된 이용 제한, 보안 기능, 접근 통제 또는 기타 보호 조치를 우회, 비활성화 또는 방해하는 행위도 금지됩니다.',
      '본 이용 수칙 위반 시 회사의 단독 재량에 따라 사전 통지 여부와 관계없이 이용자의 계정이 즉시 정지 또는 해지될 수 있습니다.',
    ],
  },
  {
    title: '5. 지식재산권',
    content: [
      'K-MIRROR 애플리케이션의 디자인, 사용자 인터페이스, AI 분석 기술, 알고리즘, 추천 엔진, 소스 코드, 그래픽, 로고, 상표 및 관련 모든 지식재산은 회사 및 그 라이선서의 독점적 재산이며, 관련 저작권법, 상표법, 특허법 등 지식재산 관련 법률의 보호를 받습니다.',
      '이용자는 서비스에 업로드한 사진 및 이미지에 대한 완전한 소유권을 유지합니다. 이미지 업로드 시, 이용자는 AI 안면 분석 수행의 목적에 한하여 회사에 제한적이고 비독점적이며 양도 불가능하고 철회 가능한 라이선스를 부여합니다. 이 라이선스는 분석 완료 즉시 종료되며, 이용자의 이미지는 당사 서버에 저장되거나 보관되지 않습니다.',
      '서비스가 생성한 분석 결과(스타일 추천, 제품 제안, 연예인 매칭 정보 포함)는 이용자의 개인적, 비상업적 용도로만 제공됩니다. 회사의 사전 서면 동의 없이 해당 결과를 상업적 목적으로 복제, 배포, 공개 전시 또는 2차 저작물을 작성하는 행위는 금지됩니다.',
    ],
  },
  {
    title: '6. 결제 조건',
    content: [
      'K-MIRROR 쇼핑몰을 통한 상품 구매는 PCI DSS Level 1 인증을 받은 제3자 결제 대행사인 Stripe를 통해 안전하게 처리됩니다. 구매 시 이용자는 본 약관에 더하여 Stripe의 서비스 약관 및 개인정보 처리방침에 동의하게 됩니다.',
      '서비스에 표시되는 모든 가격은 구매 시점에 표시된 해당 통화 기준입니다. 가격은 사전 통지 없이 변경될 수 있으나, 이미 확정된 주문에 대해서는 변경된 가격이 적용되지 않습니다. 「전자상거래법」에 따라 가격, 배송비 등 관련 정보를 명확히 표시합니다.',
      '회사는 결제 처리의 중개자 역할을 하며, Stripe가 제공하는 결제 처리 서비스에 대해 직접적인 책임을 지지 않습니다. 결제 처리, 차지백 또는 결제 분쟁과 관련된 문제는 우선 Stripe에 문의하여 주시되, 회사도 가능한 범위 내에서 도움을 드리겠습니다.',
      '환불 정책: 상품 구매에 불만이 있으신 경우, 구매일로부터 14일 이내에 고객 지원팀에 연락하여 환불을 요청하실 수 있습니다. 「전자상거래법」 제17조에 따른 청약철회 기간(7일) 내에는 특별한 사유 없이 환불이 가능하며, 그 이후의 환불 요청은 사안별로 검토되어 원래 결제 수단을 통해 처리됩니다.',
      '전문가 상담 세션 예약에는 예약 시점에 명시된 별도의 취소 및 환불 정책이 적용될 수 있습니다. 전문가 세션의 취소 조건은 예약 확정 전에 명확히 안내됩니다.',
    ],
  },
  {
    title: '7. AI 분석 면책사항',
    content: [
      'K-MIRROR가 제공하는 AI 기반 분석 결과는 Google Gemini AI 기술을 사용하여 생성됩니다. 회사는 유용하고 관련성 높은 추천을 제공하기 위해 노력하지만, 이용자는 다음과 같은 한계를 이해하고 인정하여야 합니다:',
      '피부 톤 분류, 얼굴형 판별, 연예인 스타일 매칭 및 제품 추천을 포함한 모든 분석 결과는 오락 및 교육 목적으로만 생성됩니다. 이러한 결과는 의료 조언, 피부과 진단, 미용 처방 또는 어떠한 형태의 전문 뷰티 상담에도 해당하지 않습니다.',
      '회사는 AI가 생성한 추천의 정확성, 완전성, 신뢰성 또는 적합성을 보장하지 않습니다. AI 분석은 본질적으로 확률적이며, 이미지 품질, 조명 조건, 카메라 각도 및 기타 환경적 요인에 따라 결과가 달라질 수 있습니다.',
      '피부 건강, 피부 질환, 알레르기 또는 기타 의료 및 피부과적 사안에 대한 우려가 있으신 경우 반드시 자격을 갖춘 의료 전문가, 면허를 보유한 피부과 전문의 또는 공인된 뷰티 전문가와 상담하여 주시기 바랍니다. 본 서비스에서 제공하는 정보를 근거로 전문적인 의료 조언을 무시하거나 치료를 지연하여서는 안 됩니다.',
      '분석 결과는 주관적인 성격을 가지며 알고리즘적 해석을 반영합니다. 동일한 이미지에 대해서도 다른 분석 결과가 도출될 수 있습니다. 본 서비스는 영감과 일반적인 참고 자료로 활용하시되, 확정적이거나 권위 있는 조언으로 간주해서는 안 됩니다.',
    ],
  },
  {
    title: '8. 책임의 제한',
    content: [
      '본 서비스는 "현상 그대로(AS IS)" 및 "이용 가능한 상태로(AS AVAILABLE)" 제공되며, 명시적이든 묵시적이든 법률상의 것이든 어떠한 종류의 보증도 포함하지 않습니다. 회사는 상품성, 특정 목적 적합성, 권리 및 비침해에 대한 묵시적 보증을 포함한 모든 보증을 명시적으로 부인합니다.',
      '관련 법률이 허용하는 최대 범위 내에서, 회사 및 그 임원, 이사, 직원, 대리인, 계열사는 서비스 이용 또는 이용 불능과 관련하여 발생하는 간접적, 부수적, 특별, 결과적, 징벌적 또는 예시적 손해(이익, 영업권, 데이터 손실 또는 기타 무형적 손실에 대한 손해를 포함하되 이에 한정되지 않음)에 대해 책임지지 않습니다.',
      '본 서비스와 관련하여 또는 이에 기인하여 발생하는 모든 청구에 대한 회사의 총 누적 책임은 해당 책임을 발생시킨 사건 직전 12개월 동안 이용자가 해당 서비스에 대해 실제로 지급한 총 금액을 초과하지 않습니다. 다만, 「전자상거래법」 및 「소비자기본법」 등 강행규정에 의해 보장되는 소비자의 권리는 본 조항에 의해 제한되지 않습니다.',
      '회사는 Supabase(인증 및 데이터베이스), Stripe(결제 처리), Google(AI 분석 및 OAuth), Vercel(호스팅) 등 제3자 서비스 제공업체에 의해 발생하는 서비스 중단, 장애, 데이터 손실 또는 서비스 결함에 대해 책임지지 않습니다. 서비스의 가용성은 이러한 제3자 제공업체에 의존하므로 중단 없는 서비스를 보장할 수 없습니다.',
    ],
  },
  {
    title: '9. 개인정보 보호',
    content: [
      '본 서비스의 이용에는 생체 얼굴 데이터를 포함한 개인정보의 수집, 이용, 처리, 저장 및 보호 방법을 상세히 설명하는 개인정보 처리방침이 함께 적용됩니다.',
      '개인정보 처리방침을 주의 깊게 검토하여 주시기 바랍니다. 서비스를 이용함으로써 개인정보 처리방침에 명시된 바에 따른 정보의 수집 및 이용에 동의하시게 됩니다. 개인정보 처리방침은 본 약관에 포함되어 본 약관의 불가분의 일부를 구성합니다.',
    ],
  },
  {
    title: '10. 약관의 변경',
    content: [
      '회사는 단독 재량으로 언제든지 본 약관을 수정, 갱신 또는 개정할 권리를 보유합니다. 변경 시 본 페이지 상단의 "최종 수정일"을 갱신합니다.',
      '이용자의 권리 또는 의무에 중대한 영향을 미치는 변경의 경우, 앱 내 공지 또는 이용자의 계정에 연결된 이메일 주소로의 통지 등을 통해 합리적인 사전 고지를 제공합니다. 「전자상거래법」 제15조에 따라, 이용자에게 불리한 약관 변경의 경우 최소 7일 전에 공지하며, 중요한 사항의 변경은 30일 전에 고지합니다.',
      '변경된 약관의 효력 발생일 이후에도 서비스를 계속 이용하시는 경우, 변경된 약관에 동의하신 것으로 간주됩니다. 변경된 약관에 동의하지 않으시는 경우, 유일한 구제 수단은 서비스 이용을 중단하는 것입니다.',
    ],
  },
  {
    title: '11. 준거법 및 분쟁 해결',
    content: [
      '본 약관은 대한민국 법률(「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「개인정보보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 포함)에 따라 규율, 해석 및 집행됩니다.',
      '본 약관 또는 서비스와 관련하여 발생하는 분쟁, 논쟁 또는 청구는 우선 당사자 간의 성실한 협의를 통해 해결을 시도합니다. 협의를 통해 30일 이내에 분쟁이 해결되지 않을 경우, 한국공정거래조정원 또는 한국소비자원의 조정을 신청하거나, 민사소송법에 따른 관할 법원에 소를 제기할 수 있습니다.',
      '본 약관의 어떠한 조항도 관련 소비자보호 법령에 따라 이용자에게 보장되는 권리를 합법적으로 제한하거나 배제할 수 없는 범위 내에서 해당 권리를 제한하거나 배제하지 않습니다.',
    ],
  },
  {
    title: '12. 문의',
    content: [
      '본 이용약관에 대한 질문, 우려 사항 또는 의견이 있으시면 아래 연락처로 문의하여 주시기 바랍니다:',
      '이메일: legal@k-mirror.app',
      '이용자의 문의에 신속하게 응답하고 문제를 원만하게 해결하기 위해 최선을 다하겠습니다.',
    ],
  },
];

const TermsView = () => {
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
          {t('legal.termsOfService')}
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

export default TermsView;
