// import tooltip from './index';
import tooltip from '../solution/index.js';

describe('events-practice/tooltip', () => {
  beforeEach(() => {
    tooltip.initialize();
  });

  afterEach(() => {
    tooltip.destroy();
  });

  it('should be rendered correctly', () => {
    tooltip.render('');

    expect(tooltip.element).toBeVisible();
    expect(tooltip.element).toBeInTheDocument();
  });
});
