import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ShopView from './ShopView';
import { useCartStore } from '@/store/cartStore';
import { PRODUCT_CATALOG } from '@/data/productCatalog';

vi.mock('@/services/productService', async () => {
  const { PRODUCT_CATALOG: catalog } = await import('@/data/productCatalog');
  return { fetchProducts: vi.fn().mockResolvedValue(catalog) };
});

function renderView() {
  return render(
    <MemoryRouter>
      <ShopView />
    </MemoryRouter>
  );
}

async function renderViewAndWaitForProducts() {
  renderView();
  await waitFor(() => {
    expect(screen.getByText(PRODUCT_CATALOG[0]!.name)).toBeInTheDocument();
  });
}

describe('ShopView', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('renders the shop title and subtitle', async () => {
    await renderViewAndWaitForProducts();
    expect(screen.getByText('shop.title')).toBeInTheDocument();
    expect(screen.getByText('shop.subtitle')).toBeInTheDocument();
  });

  it('shows all category filter buttons', async () => {
    await renderViewAndWaitForProducts();
    expect(screen.getByText('shop.all')).toBeInTheDocument();
    expect(screen.getByText('shop.base')).toBeInTheDocument();
    expect(screen.getByText('shop.lip')).toBeInTheDocument();
    expect(screen.getByText('shop.eye')).toBeInTheDocument();
    expect(screen.getByText('shop.skincare')).toBeInTheDocument();
  });

  it('displays all product names when "all" category is active', async () => {
    await renderViewAndWaitForProducts();
    for (const product of PRODUCT_CATALOG) {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    }
  });

  it('shows product brands', async () => {
    await renderViewAndWaitForProducts();
    expect(screen.getAllByText('HERA').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('COSRX').length).toBeGreaterThanOrEqual(1);
  });

  it('shows product prices', async () => {
    await renderViewAndWaitForProducts();
    expect(screen.getByText('$45.00')).toBeInTheDocument();
    expect(screen.getByText('$14.00')).toBeInTheDocument();
  });

  it('shows product match scores', async () => {
    await renderViewAndWaitForProducts();
    expect(screen.getByText('98% common.match')).toBeInTheDocument();
    expect(screen.getByText('96% common.match')).toBeInTheDocument();
  });

  it('shows product safety ratings', async () => {
    await renderViewAndWaitForProducts();
    expect(screen.getAllByText('EWG Green').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Vegan').length).toBeGreaterThan(0);
  });

  it('shows product category badges', async () => {
    await renderViewAndWaitForProducts();
    expect(screen.getAllByText('base').length).toBeGreaterThan(0);
    expect(screen.getAllByText('lip').length).toBeGreaterThan(0);
  });

  it('filters to base products when base category is clicked', async () => {
    await renderViewAndWaitForProducts();
    fireEvent.click(screen.getByText('shop.base'));

    const baseProducts = PRODUCT_CATALOG.filter((p) => p.category === 'base');
    const nonBaseProducts = PRODUCT_CATALOG.filter((p) => p.category !== 'base');

    for (const product of baseProducts) {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    }
    for (const product of nonBaseProducts) {
      expect(screen.queryByText(product.name)).not.toBeInTheDocument();
    }
  });

  it('filters to lip products when lip category is clicked', async () => {
    await renderViewAndWaitForProducts();
    fireEvent.click(screen.getByText('shop.lip'));

    const lipProducts = PRODUCT_CATALOG.filter((p) => p.category === 'lip');
    for (const product of lipProducts) {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    }

    // A base product should not be visible
    const baseProduct = PRODUCT_CATALOG.find((p) => p.category === 'base');
    if (baseProduct) {
      expect(screen.queryByText(baseProduct.name)).not.toBeInTheDocument();
    }
  });

  it('filters to skincare products when skincare category is clicked', async () => {
    await renderViewAndWaitForProducts();
    fireEvent.click(screen.getByText('shop.skincare'));

    const skincareProducts = PRODUCT_CATALOG.filter((p) => p.category === 'skincare');
    for (const product of skincareProducts) {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    }
  });

  it('shows all products again when "all" is clicked after filtering', async () => {
    await renderViewAndWaitForProducts();

    // Filter to lip first
    fireEvent.click(screen.getByText('shop.lip'));
    const baseProduct = PRODUCT_CATALOG.find((p) => p.category === 'base');
    if (baseProduct) {
      expect(screen.queryByText(baseProduct.name)).not.toBeInTheDocument();
    }

    // Switch back to all
    fireEvent.click(screen.getByText('shop.all'));
    for (const product of PRODUCT_CATALOG) {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    }
  });

  it('adds a product to the cart when the add button is clicked', async () => {
    await renderViewAndWaitForProducts();

    // Each product card has a ShoppingBag button; find all and click the first
    const addButtons = screen.getAllByRole('button').filter((btn) => {
      // The add-to-cart buttons are the small ones inside product cards (no text content)
      return btn.closest('.grid') && btn.textContent === '';
    });
    expect(addButtons.length).toBeGreaterThan(0);
    fireEvent.click(addButtons[0]!);

    expect(useCartStore.getState().items.length).toBe(1);
  });

  it('has links to product detail pages', async () => {
    await renderViewAndWaitForProducts();
    const firstProduct = PRODUCT_CATALOG[0]!;
    const productLinks = screen.getAllByRole('link').filter(
      (link) => link.getAttribute('href') === `/shop/${firstProduct.id}`
    );
    expect(productLinks.length).toBeGreaterThan(0);
  });
});
