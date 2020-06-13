import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';


export default class SortableTable {
    element;
    subElements = {};

    constructor(header, { url = 'api/rest/products' } = {}) {
        this.url = new URL(url, BACKEND_URL);
        this.header = header;

        this.render();
    }

    async sortOnServer(id = 'title', order = 'asc') {
        const currentDate = new Date();
        const month = 2592000000;
        const prevDate = new Date(Date.now() - month);

        this.url.searchParams.set('_sort', id);
        this.url.searchParams.set('_order', order);
        this.url.searchParams.set('_start', 0);
        this.url.searchParams.set('_end', 30);
        this.url.searchParams.set('from', prevDate);
        this.url.searchParams.set('to', currentDate);
        const data = await fetchJson(this.url);

        this.update(data);

        return data;
    }

    update(data) {
        const { body } = this.subElements;
        
        body.innerHTML = this.getRows(data);
    }

    async render() {
        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;

        const cell = this.element.querySelector('.sortable-table__cell');
        cell.insertAdjacentHTML('beforeend', this.arrowTemplate);

        this.subElements = this.getSubElements(this.element);
        
        this.initEventListeners();

        await this.sortOnServer();
    }

    initEventListeners() {
        this.element.addEventListener('pointerdown', this.load);
    }

    load = event => {
        const head = event.target.closest('[data-sortable]');
        if (!head || head.dataset.sortable !== "true") return;

        const order = (head.dataset.order === 'asc') ? 'desc' : 'asc';
        const field = head.dataset.id;
        this.sortOnServer(field, order);
    }

    getSubElements() {
        const elements = this.element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;
            return accum;
        }, {})
    }

    get template() {
        return `<div class="sortable-table sortable-table__loading">${this.headerTemplate} ${this.bodyTemplate}</div>`;
    }

    get headerTemplate() {
        return `<div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.header.map(item => this.headerRowTemplate(item)).join('')}
            </div>`
    }

    headerRowTemplate({ id, title, sortable }) {
        return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="asc">
            <span>${title}</span>
        </div>`
    }

    get arrowTemplate() {
        return `
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>`;
    }

    get bodyTemplate() {
        return `<div data-element="body" class="sortable-table__body"></div>`;
    }

    getRows(objects) {
        return objects.map(obj => this.getRow(obj)).join('');
    }

    getRow(obj) {
        return `<div class="sortable-table__row">
            ${this.header
                .map(head => head.template?.(obj[head.id]) || `<div class="sortable-table__cell">${obj[head.id]}
                }</div>`)
                .join('')}
            </div>`;
    }

    destroy() {
        this.remove();
        this.element.removeEventListener('click', this.sortByHead);
    }

    remove() {
        this.element.remove();
    }
}

//npm run test:specific --findRelatedTests 07-forms-fetch-api-part-2/2-sortable-table-v3/src/index.spec.js
