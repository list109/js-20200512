import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru'
const currentDate = new Date();
const month = 2592000000;
const prevDate = new Date(Date.now() - month);

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;
  data = [];

  constructor({
    label = '',
    link = '',
    value = 0,
    url = 'api/dashboard/orders',
    formatHeading = data => data,
  } = {}) {
    this.label = label;
    this.link = link;
    this.value = value;
    this.url = new URL(url, BACKEND_URL);
    this.formatHeading = formatHeading;

    this.render();
    this.update(prevDate, currentDate);
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  get template() {
    return `
    <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
        </div>
        <div data-element="body" class="column-chart__chart">
        </div>
      </div>
    </div>
  `;
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }


  async update(from, to) {
    const { header, body } = this.subElements;
    this.data = await this.getData(from, to);

    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }

    header.innerHTML = this.getTotalAmount();
    body.innerHTML = this.getColumnBody();
  }

  async getData(from, to) {
    const data = await fetchJson(this.getUrl(from, to), {
      method: 'GET',
    })

    return Object.entries(data);
  }

  getUrl(from, to) {
    this.url.searchParams.set('from', from);
    this.url.searchParams.set('to', to);

    return this.url;
  }

  getTotalAmount() {
    const total = this.data.reduce((prev, item) => prev + item[1], 0);
    return this.formatHeading(total);
  }

  getColumnBody() {
    const maxValue = Math.max(...this.data.map(item => item[1]));

    return this.data
      .map(([stringDate, amount]) => {
        const scale = this.chartHeight / maxValue;

        return `
      <div style="--value: ${Math.floor(amount * scale)}" data-tooltip="
        <div><small>${this.getDate(stringDate)}</small></div><strong>${this.formatHeading(amount)}</strong>
      ">
      </div>
    `;
      })
      .join('');
  }

  getDate(date) {
    const formatter = new Intl.DateTimeFormat('ru', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    return formatter.format(new Date(date));
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.data = [];
  }
}