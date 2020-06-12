class Tooltip {
    static instance;
    element;
    hoveredElement = null;

    constructor() {
        if(Tooltip.instance) return Tooltip.instance;
        Tooltip.instance = this;
    }

    initialize() {
        this.initEventListeners();
    }

    initEventListeners() {
        document.addEventListener('pointerover', this.showTooltip);
    }

    showTooltip = event => {
        const hoveredElement = event.target.closest('[data-tooltip]');
        if(!hoveredElement) return;

        this.hoveredElement = hoveredElement;

        const tip = this.hoveredElement.dataset.tooltip;

        this.render(tip);
        this.computeCoord(event);
        
        document.addEventListener('mousemove', this.computeCoord);
        document.addEventListener('pointerout', this.hideTooltip);
    }

    computeCoord = event => {
        const offsetFromCursor = 10;
        this.element.style.left = `${event.pageX + offsetFromCursor}px`;
        this.element.style.top = `${event.pageY + offsetFromCursor}px`;
    }

    hideTooltip = event => {
        const isChild = this.hoveredElement.contains(event.relatedTarget);
        const isTooltip = event.relatedTarget?.matches('[data-tooltip]');

        if(isChild && !isTooltip) return;
        this.destroy();
    }

    render(tip = '') {
        const element = document.createElement('div');

        element.innerHTML = this.tooltipTemplate;

        this.element = element.firstElementChild;
        this.element.textContent = tip;

        document.body.append(this.element);
    }

    get tooltipTemplate() {
        return `<div class="tooltip"></div>`;
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
        document.removeEventListener('mousemove', this.computeCoord);
        document.removeEventListener('pointerout', this.hideTooltip);
        this.hoveredElement = null;
    }
}

const tooltip = new Tooltip();

export default tooltip;
