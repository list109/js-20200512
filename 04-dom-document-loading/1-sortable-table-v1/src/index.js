export default class SortableTable {
    constructor(header, { data } = {}) {
        this.header = header;
        this.data = data;

        this.element;
        this.subElements = {};

        this.render();
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements(this.element);
    }

    getSubElements(element) {
        return {
            header: element.querySelector('.sortable-table__header'),
            body: element.querySelector('.sortable-table__body'),
        }
    }

    get template() {
        return `<div class="sortable-table">${this.headerTemplate + this.bodyTemplate}</div>`;
    }

    get headerTemplate() {
        return this.header.reduce((prev, item) => `${prev}
            <div class="sortable-table__cell" data-id="${item.id}">${item.title}</div>`,
        '<div class="sortable-table__header sortable-table__row">') + '</div>';
    }

    get bodyTemplate() {
        return this.data.reduce((prev, obj) => prev + this.getRow(obj),
            '<div class="sortable-table__body">') + '</div>';
    }

    getRow(obj) {
        return this.header.reduce((prev, head) => 
            prev + (head.template?.(obj[head.id]) || `<div class="sortable-table__cell">${obj[head.id]}</div>`),
        '<div class="sortable-table__row">') + '</div>';
    }

    sort(field, order) {
        const fieldIndex = this.header.findIndex(item => item.id === field);
        const body = this.subElements.body;

        const options = {
            asc: 1,
            desc: -1, 
        }

        order = options[order] || 1;

        function sortMethod(arr, order) {
            return arr.sort((a, b) => {
                a = a.children[fieldIndex].textContent;
                b = b.children[fieldIndex].textContent;
                return order * a.localeCompare(b, 'ru', {caseFirst: 'upper', numeric: true});
            })
        }

        body.append(...sortMethod([...body.children], order));
    }

    destroy() {
        this.remove();
    }

    remove() {
        this.element.remove();
    }
}

