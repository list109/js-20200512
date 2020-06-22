import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';


export default class SortableTable {
    element;
    subElements = {};
    isLoading = false;

    sort = 'title';
    order = 'asc';
    start = 0;
    end = 30;
    maxRequestRows = 30;

    onClick = event => {
        const head = event.target.closest('[data-sortable]');

        if (head && head.dataset.sortable === "true") this.sortByHead(head);
    }

    onScroll = async () => {
        const html = document.documentElement;
        const { bottom } = html.getBoundingClientRect();
        const fullHeight = bottom + pageYOffset;
        const restBottomScroll = fullHeight - pageYOffset - html.clientHeight;

        if (restBottomScroll < 50 && this.isLoading === false) {

            this.isLoading = true;

            this.start += this.maxRequestRows;
            this.end += this.maxRequestRows;

            this.url.searchParams.set('_start', this.start);
            this.url.searchParams.set('_end', this.end);

            const response = await fetch(this.url);
            const isRestData = response.headers.get('x-total-count');
            
            if(Number(isRestData)) {
                this.element.classList.add('sortable-table_loading');

                const data = await response.json();

                this.update(data);
            }

            this.isLoading = false;
        }
    }

    constructor(header, { url = 'api/rest/products' } = {}) {
        this.url = new URL(url, BACKEND_URL);
        this.header = header;

        this.render();
    }

    async render() {
        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;
        const titleHead = this.element.querySelector('[data-id="title"]');
        titleHead.insertAdjacentHTML('beforeend', this.arrowTemplate);

        this.subElements = this.getSubElements(this.element);

        this.initEventListeners();

        const data = await this.sortOnServer();

        this.update(data);
    }

    getSubElements() {
        const elements = this.element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;
            return accum;
        }, {})
    }

    initEventListeners() {
        this.element.addEventListener('pointerdown', this.onClick);
        document.addEventListener('scroll', this.onScroll);
    }

    async sortByHead(head) {
        const { body } = this.subElements;
        body.innerHTML = '';
        
        const order = (head.dataset.order === 'asc') ? 'desc' : 'asc';
        const sort = head.dataset.id;

        head.dataset.order = order;
        head.append(this.subElements.arrow);
        this.element.classList.add('sortable-table_loading');

        this.sort = sort;
        this.order = order;
        this.start = 0;
        this.end = this.maxRequestRows;

        const data = await this.sortOnServer(sort, order);

        this.update(data);
    }
    
    async sortOnServer(sort = this.sort, order = this.order, { start = this.start, end = this.end } = {}) {
        this.url.searchParams.set('_sort', sort);
        this.url.searchParams.set('_order', order);
        this.url.searchParams.set('_start', start);
        this.url.searchParams.set('_end', end);

        return await fetchJson(this.url);
    }

    update(data) {
        const { body } = this.subElements;
        this.element.classList.remove('sortable-table_loading');

        body.insertAdjacentHTML('beforeend', this.getRows(data));
    }

    get template() {
        return `<div class="sortable-table sortable-table_loading">
                  ${this.headerTemplate} 
                  ${this.bodyTemplate}
                  ${this.loadingTemplate}
                  ${this.placeholderTemplate}
              </div>`;
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

    get placeholderTemplate() {
        return `
        <div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder"><div>
            <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
            <button type="button" class="button-primary-outline">Очистить фильтры</button>
        </div></div>`;
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
                .map(head => head.template?.(obj[head.id]) || `<div class="sortable-table__cell">${obj[head.id]}</div>`)
                .join('')}
            </div>`;
    }

    get loadingTemplate() {
        return `<div data-element="loading" class="loading-line sortable-table__loading-line"></div>`;
    }

    destroy() {
        this.remove();

        this.element.removeEventListener('click', this.onClick);
        document.removeEventListener('scroll', this.onScroll);
    }

    remove() {
        this.element.remove();
    }
}

