class Tooltip {
  static instance;

  element;

  onMouseOver = event => {
    const element = event.target.closest('[data-tooltip]');

    if (element) {
      this.render(element.dataset.tooltip);
      this.onMoveTooltip(event);

      document.addEventListener('pointermove', this.onMoveTooltip);
    }
  };

  removeTooltip = () => {
    if (this.element) {
      this.element.remove();
      this.element = null;

      document.removeEventListener('pointermove', this.onMoveTooltip);
    }
  }

  onMoveTooltip = event => {
    const left = event.clientX + 10;
    const top = event.clientY + 10;

    // TODO: Add logic for window borders

    this.element.style.left = left + 'px';
    this.element.style.top = top + 'px';
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.onMouseOver);
    document.addEventListener('pointerout', this.removeTooltip);
  }

  initialize() {
    this.initEventListeners();
  }

  render(html) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = html;

    document.body.append(this.element);
  }

  destroy() {
    document.removeEventListener('pointerover', this.onMouseOver);
    document.removeEventListener('pointerout', this.removeTooltip);
    this.removeTooltip();
  }
}

const tooltip = new Tooltip();

export default tooltip;
