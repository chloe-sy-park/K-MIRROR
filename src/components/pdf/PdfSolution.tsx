import PdfPageShell from './PdfPageShell';

interface PdfSolutionProps {
  adaptationLogic: { base: string; lip: string; point: string };
  recommendations: {
    ingredients: string[];
    products: Array<{ name: string; brand: string; matchScore: number }>;
  };
  pageOffset: number;
  totalPages: number;
  caseNumber: string;
}

const PANEL_STYLE = {
  background: '#1A1A2E',
  borderRadius: 12,
  padding: 20,
};

const SECTION_LABEL_STYLE = {
  fontFamily: 'monospace',
  fontSize: 10,
  color: '#FF2D9B',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  margin: '0 0 10px 0',
  fontWeight: 700,
};

const BODY_TEXT_STYLE = {
  fontSize: 13,
  color: 'rgba(255,255,255,0.8)',
  lineHeight: 1.7,
  margin: 0,
};

const INGREDIENT_CHIP_STYLE = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: 16,
  background: 'rgba(0,212,255,0.1)',
  border: '1px solid rgba(0,212,255,0.2)',
  fontFamily: 'monospace',
  fontSize: 11,
  color: '#00D4FF',
};

/**
 * PDF 7-8페이지 — Pony's Solution Guide
 * Page 1: Base & Skin + Eyes & Brows + Key Ingredients (first 4)
 * Page 2: Lips & Cheeks + Additional Ingredients
 */
const PdfSolution = ({
  adaptationLogic,
  recommendations,
  pageOffset,
  totalPages,
  caseNumber,
}: PdfSolutionProps) => {
  const firstIngredients = recommendations.ingredients.slice(0, 4);
  const remainingIngredients = recommendations.ingredients.slice(4);

  return (
    <>
      {/* Page 1 */}
      <PdfPageShell pageNumber={pageOffset} totalPages={totalPages} caseNumber={caseNumber}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
              {"Pony's Solution Guide"}
            </h2>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Personalized Technique Recommendations
            </p>
          </div>

          {/* Base & Skin */}
          <div style={PANEL_STYLE}>
            <p style={SECTION_LABEL_STYLE}>Base &amp; Skin</p>
            <p style={BODY_TEXT_STYLE}>{adaptationLogic.base}</p>
          </div>

          {/* Eyes & Brows */}
          <div style={PANEL_STYLE}>
            <p style={SECTION_LABEL_STYLE}>Eyes &amp; Brows</p>
            <p style={BODY_TEXT_STYLE}>{adaptationLogic.point}</p>
          </div>

          {/* Key Ingredients */}
          <div style={PANEL_STYLE}>
            <p style={SECTION_LABEL_STYLE}>Key Ingredients</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {firstIngredients.map((ingredient) => (
                <span key={ingredient} style={INGREDIENT_CHIP_STYLE}>
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        </div>
      </PdfPageShell>

      {/* Page 2 */}
      <PdfPageShell pageNumber={pageOffset + 1} totalPages={totalPages} caseNumber={caseNumber}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
              {"Pony's Solution Guide"}
            </h2>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Continued
            </p>
          </div>

          {/* Lips & Cheeks */}
          <div style={PANEL_STYLE}>
            <p style={SECTION_LABEL_STYLE}>Lips &amp; Cheeks</p>
            <p style={BODY_TEXT_STYLE}>{adaptationLogic.lip}</p>
          </div>

          {/* Additional Ingredients */}
          {remainingIngredients.length > 0 && (
            <div style={PANEL_STYLE}>
              <p style={SECTION_LABEL_STYLE}>Additional Ingredients</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {remainingIngredients.map((ingredient) => (
                  <span key={ingredient} style={INGREDIENT_CHIP_STYLE}>
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </PdfPageShell>
    </>
  );
};

export default PdfSolution;
