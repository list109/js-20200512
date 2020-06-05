export default class SortableTable {
    element;
    subElements = {};

    sortByHead = event => {
        const head = event.target.closest('[data-sortable]');
        if (!head || head.dataset.sortable !== "true") return;

        const order = (head.dataset.order === 'asc') ? 'desc' : 'asc';
        const field = head.dataset.id;
        this.sort({ id: field, order: order });
    }

    constructor(header, {
        data = [],
        sorted = { id: 'title', order: 'asc' }
    } = {}) {
        this.header = header;
        this.data = data;

        this.render();
        this.initEventListeners();
        this.sort(sorted);
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;

        const cell = this.element.querySelector('.sortable-table__cell');
        cell.insertAdjacentHTML('beforeend', this.arrowTemplate);

        this.subElements = this.getSubElements(this.element);
    }

    initEventListeners() {
        this.element.addEventListener('click', this.sortByHead);
    }

    getSubElements() {
        const elements = this.element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;
            return accum;
        }, {})
    }

    get template() {
        return `<div class="sortable-table">${this.headerTemplate} ${this.bodyTemplate}</div>`;
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
        return `<div data-element="body" class="sortable-table__body">
            ${this.data
                .map(obj => this.getRow(obj))
                .join('')}
            </div>`;
    }

    getRow(obj) {
        return `<div class="sortable-table__row">
            ${this.header
                .map(head => head.template?.(obj[head.id]) || `<div class="sortable-table__cell">${obj[head.id]}</div>`)
                .join('')}
            </div>`;
    }

    sort({ id: field='title', order='asc'}) {
        const fieldIndex = this.header.findIndex(item => item.id === field);
        const body = this.subElements.body;
        const { sortType, customSorting } = this.header[fieldIndex];
        const currentHead = this.subElements.header.children[fieldIndex];

        currentHead.append(this.subElements.arrow);
        currentHead.dataset.order = order;

        const options = {
            asc: -1,
            desc: 1,
        }

        const direction = options[order] || 1;

        body.append(...sortMethod([...body.children], direction));

        function sortMethod(arr, direction) {
            return arr.sort((a, b) => {
                a = a.children[fieldIndex].textContent;
                b = b.children[fieldIndex].textContent;
                switch (sortType) {
                    case 'custom':
                        return direction * customSorting(a, b);
                    case 'string':
                    case 'number':
                    default:
                        return direction * a.localeCompare(b, 'ru', { caseFirst: 'upper', numeric: true });
                }
            })
        }
    }

    destroy() {
        this.remove();
        this.element.removeEventListener('click', this.sortByHead);
    }

    remove() {
        this.element.remove();
    }
}