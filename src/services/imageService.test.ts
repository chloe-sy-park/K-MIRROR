import { processImage } from './imageService';

// Mock Canvas API for jsdom (no real canvas support)
const mockToDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,mockedBase64Output');
const mockDrawImage = vi.fn();
const mockGetContext = vi.fn().mockReturnValue({
  drawImage: mockDrawImage,
});

beforeEach(() => {
  mockToDataURL.mockClear();
  mockDrawImage.mockClear();
  mockGetContext.mockClear();

  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: mockGetContext,
        toDataURL: mockToDataURL,
      } as unknown as HTMLCanvasElement;
    }
    return document.createElement(tag);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function createMockFile(name: string, type: string, size = 1024): File {
  const content = new ArrayBuffer(size);
  return new File([content], name, { type });
}

// Mock URL.createObjectURL and Image
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeAll(() => {
  URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
  URL.revokeObjectURL = vi.fn();

  // Mock Image constructor
  class MockImage {
    width = 800;
    height = 600;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    _src = '';
    set src(_val: string) {
      this._src = _val;
      // Trigger onload asynchronously
      setTimeout(() => this.onload?.(), 0);
    }
    get src() {
      return this._src;
    }
  }

  vi.stubGlobal('Image', MockImage);
});

afterAll(() => {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
  vi.unstubAllGlobals();
});

describe('processImage', () => {
  it('returns processed image with base64 and mimeType', async () => {
    const file = createMockFile('photo.jpg', 'image/jpeg');
    const result = await processImage(file);

    expect(result.base64).toBe('mockedBase64Output');
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });

  it('resizes images larger than 1024px', async () => {
    // Create an image that's larger than 1024px
    class LargeImage {
      width = 2048;
      height = 1536;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      _src = '';
      set src(_val: string) {
        this._src = _val;
        setTimeout(() => this.onload?.(), 0);
      }
      get src() {
        return this._src;
      }
    }
    vi.stubGlobal('Image', LargeImage);

    const file = createMockFile('big.png', 'image/png');
    const result = await processImage(file);

    // 2048 → 1024 (ratio 0.5), 1536 → 768
    expect(result.width).toBe(1024);
    expect(result.height).toBe(768);
  });

  it('does not upscale images smaller than 1024px', async () => {
    class SmallImage {
      width = 512;
      height = 384;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      _src = '';
      set src(_val: string) {
        this._src = _val;
        setTimeout(() => this.onload?.(), 0);
      }
      get src() {
        return this._src;
      }
    }
    vi.stubGlobal('Image', SmallImage);

    const file = createMockFile('small.jpg', 'image/jpeg');
    const result = await processImage(file);

    expect(result.width).toBe(512);
    expect(result.height).toBe(384);
  });

  it('always outputs image/jpeg mimeType', async () => {
    const pngFile = createMockFile('photo.png', 'image/png');
    const result = await processImage(pngFile);
    expect(result.mimeType).toBe('image/jpeg');
  });

  it('calls canvas toDataURL with jpeg quality 0.85', async () => {
    const file = createMockFile('photo.jpg', 'image/jpeg');
    await processImage(file);

    expect(mockToDataURL).toHaveBeenCalledWith('image/jpeg', 0.85);
  });

  it('throws when canvas context is unavailable', async () => {
    mockGetContext.mockReturnValueOnce(null);
    const file = createMockFile('photo.jpg', 'image/jpeg');
    await expect(processImage(file)).rejects.toThrow('Canvas 2D context not available');
  });
});
