import { QRCodeSVG } from 'qrcode.react';

interface ProductItem {
  name: string;
  brand: string;
  matchScore: number;
  price?: string;
  affiliateUrl?: string | null;
}

interface PdfProductsProps {
  products: ProductItem[];
}

/** 개별 제품 카드 */
const ProductCard = ({ name, brand, matchScore, price, affiliateUrl }: ProductItem) => (
  <div
    style={{
      background: '#1A1A2E',
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}
  >
    {/* Brand */}
    <p
      style={{
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#FF2D9B',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        margin: 0,
      }}
    >
      {brand}
    </p>

    {/* Product name */}
    <p style={{ fontSize: 14, color: '#F0F0F0', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>{name}</p>

    {/* Match score bar */}
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Match</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#FF2D9B', fontWeight: 700 }}>
          {matchScore}%
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: 4,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(Math.max(matchScore, 0), 100)}%`,
            height: '100%',
            borderRadius: 2,
            background: 'linear-gradient(90deg, #FF2D9B, #FF6FB5)',
          }}
        />
      </div>
    </div>

    {/* Price */}
    {price && (
      <p
        style={{
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
          margin: 0,
        }}
      >
        {price}
      </p>
    )}

    {/* QR Code for affiliate link */}
    {affiliateUrl && (
      <div style={{ marginTop: 8 }}>
        <QRCodeSVG value={affiliateUrl} size={60} bgColor="transparent" fgColor="#ffffff" />
      </div>
    )}
  </div>
);

/** PDF 9페이지 — AI 큐레이션 제품 그리드 (2열, 최대 6개) */
const PdfProducts = ({ products }: PdfProductsProps) => {
  const displayProducts = products.slice(0, 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title */}
      <div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#F0F0F0',
            margin: '0 0 4px 0',
          }}
        >
          AI-Curated Products
        </h2>
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          Personalized Product Recommendations
        </p>
      </div>

      {/* Product grid — 2 columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        {displayProducts.map((product) => (
          <ProductCard key={`${product.brand}-${product.name}`} {...product} />
        ))}
      </div>
    </div>
  );
};

export default PdfProducts;
