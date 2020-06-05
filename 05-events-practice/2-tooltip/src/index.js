class Tooltip {
    static instance;
    element;
    hoveredElement = null;

    hideTooltip = event => {
        const isParent = this.hoveredElement.contains(event.relatedTarget);
        const isNextTooltip = event.relatedTarget?.matches('[data-tooltip]');

        if(isParent && !isNextTooltip) return;
        this.destroy();
    }

    computeCoord = (event) => {
        this.element.style.left = `${event.pageX + 10}px`;
        this.element.style.top = `${event.pageY + 10}px`;
    }

    constructor() {
        if(Tooltip.instance) return Tooltip.instance;
        Tooltip.instance = this;
    }

    initialize() {
        document.addEventListener('pointerover', () => {
            const hoveredElement = event.target.closest('[data-tooltip]');
            if(!hoveredElement) return;

            this.hoveredElement = hoveredElement;

            const tip = this.hoveredElement.dataset.tooltip;

            this.render(tip);
            this.computeCoord(event);
            this.initEventListeners(this.hoveredElement);
        })
    }

    initEventListeners(elem) {
        elem.addEventListener('mousemove', this.computeCoord);
        elem.addEventListener('pointerout', this.hideTooltip);
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
        this.hoveredElement?.removeEventListener('mousemove', this.computeCoord);
        this.hoveredElement?.removeEventListener('pointerout', this.hideTooltip);
        this.hoveredElement = null;
    }
}


const tooltip = new Tooltip();

export default tooltip;
