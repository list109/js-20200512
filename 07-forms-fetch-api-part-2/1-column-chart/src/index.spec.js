// import ColumnChart from './index.js';
// TODO: remove
import ColumnChart from '../solution';

import ordersData from "./__mocks__/orders-data.js";

describe('async-code-fetch-api-part-1/column-chart', () => {
  let columnChart;

  beforeEach(() => {
    fetchMock
      .once(JSON.stringify(ordersData));

    columnChart = new ColumnChart({
      label: 'Column Chart',
      link: '',
      value: 0
    });

    document.body.append(columnChart.element);
  });

  afterEach(() => {
    columnChart.destroy();
    columnChart = null;
  });

  it('should be rendered correctly', () => {
    expect(columnChart.element).toBeInTheDocument();
    expect(columnChart.element).toBeVisible();
  });

  it('should have ability to define label', () => {
    const label = 'New label';

    columnChart = new ColumnChart({ label });

    const title = columnChart.element.querySelector('.column-chart__title');

    expect(title).toHaveTextContent(label);
  });

  it('should have ability to define link', () => {
    const link = 'https://google.com';

    columnChart = new ColumnChart({ link });

    const columnLink = columnChart.element.querySelector('.column-chart__link');

    expect(columnLink).toBeVisible();
    expect(columnLink).toHaveTextContent('View all');
  });

  it('should have property \'chartHeight', () => {
    columnChart = new ColumnChart();

    expect(columnChart.chartHeight).toEqual(50);
  });

  it('should render label correctly', () => {
    const { element } = columnChart;
    const [titleElement] = element.children;

    expect(titleElement).toHaveTextContent('Column Chart');
  });

  it('should render data correctly', () => {
    const { element } = columnChart;
    const [_, contentElement] = element.children;
    const [header, body] = contentElement.children;

    expect(header).toHaveTextContent('457');
    expect(body.children.length).toEqual(31);
  });

  it('should have ability to be update by new values', async () => {
    const data = {
      "2020-04-11": 10,
      "2020-04-12": 20,
      "2020-04-16": 30
    };

    const { element } = columnChart;

    fetchMock
      .once(JSON.stringify(data));

    await columnChart.update(new Date('2020-03-06'), new Date('2020-05-06'));

    const [, contentElement] = element.children;
    const [header, body] = contentElement.children;

    expect(header).toHaveTextContent('60');
    expect(body.children.length).toEqual(3);
  });

  it('should have loading indication if data wasn\'t passed ', () => {
    columnChart = new ColumnChart();
    document.body.append(columnChart);

    expect(columnChart.element).toHaveClass('column-chart_loading');
  });

  it('should have ability to be destroyed', () => {
    columnChart.destroy();

    expect(columnChart.element).not.toBeInTheDocument();
  });
});
