import ProductForm from './index.js';

import productData from './__mocks__/product-data.js';
import categoriesData from './__mocks__/categories-data.js';

describe('tests-for-frontend-apps/product-form-v2', () => {
  let productForm;

  beforeEach(async () => {
    fetchMock
      .once(JSON.stringify(categoriesData))
      .once(JSON.stringify(productData));

    const productId = 'some-id';

    productForm = new ProductForm(productId);

    const element = await productForm.render();

    document.body.append(element);
  });

  afterEach(() => {
    fetchMock.resetMocks();
    productForm.destroy();
    productForm = null;
  });

  it('should be rendered correctly', () => {
    expect(productForm.element).toBeVisible();
    expect(productForm.element).toBeInTheDocument();
  });

  it('should have ability to be removed', () => {
    productForm.remove();

    expect(productForm.element).not.toBeInTheDocument();
  });
});

