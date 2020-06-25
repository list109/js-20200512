export default class DoubleSlider {
  element;
  currentThumb = null;
  cursorOffest = null;

  initThumb = event => {
    const thumb = event.target.closest('[data-element^="thumb"]');
    if (!thumb) return;

    this.currentThumb = thumb;

    this.element.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.moveThumb);
    document.addEventListener('pointerup', this.dropThumb);
  }

  moveThumb = event => {
    const { inner } = this.subElements;
    const { left: parentLeftEdge, width: parentWidth } = inner.getBoundingClientRect();
    const currentThumbName = this.currentThumb.dataset.element;
    const siblingThumbName = currentThumbName === "thumbRight" ? "thumbLeft" : "thumbRight";
    const edges = { 'thumbRight': 'right', 'thumbLeft': 'left' };
    const siblingThumbPosition = parseFloat(this.subElements[siblingThumbName].style[edges[siblingThumbName]], 4);
    
    let changedPosition = event.clientX - parentLeftEdge - this.cursorOffest;
      
    if(changedPosition <= 0) changedPosition = 0;
    if(changedPosition >= parentWidth) changedPosition = parentWidth;
     
    changedPosition = currentThumbName === 'thumbRight' ? parentWidth - changedPosition : changedPosition;
    changedPosition = this.getRelatableValue(changedPosition, parentWidth);
    

    changedPosition = Math.min(changedPosition, 100 - siblingThumbPosition);

    this.currentThumb.style[edges[currentThumbName]] = `${changedPosition}%`;

    this.changeProgress();
    this.changeNumericFields();
  }

  dropThumb = event => {
    this.sendEvent();

    this.element.classList.remove('range-slider_dragging');
    this.clearThumbData();
  }

  constructor({
    min = 0,
    max = 1000,
    formatValue = value => '$' + value,
    selected = {}
  } = {}) {0
    this.formatValue = formatValue;
    this.min = min;
    this.max = max;

    this.render();
    this.initThumbsPosition(selected);
    this.initEventListeners();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.sliderTemplate;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
  }

  get sliderTemplate() {
    return `
          <div class="range-slider">
              <span data-element="from"></span>
              <div data-element="inner" class="range-slider__inner">
                  <span data-element="progress" class="range-slider__progress"></span>
                  <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
                  <span data-element="thumbRight" class="range-slider__thumb-right"></span>
              </div>
              <span data-element="to"></span>
          </div>
      `
  }

  initThumbsPosition({from = this.min, to = this.max} = {}) {
    const { thumbLeft, thumbRight } = this.subElements;
    const diff = this.max - this.min;
    const absoluteFrom = from - this.min;
    const absoluteTo = to - this.min;
    
    thumbLeft.style.left = `${absoluteFrom / diff * 100}%`;
    thumbRight.style.right = `${100 - absoluteTo / diff * 100}%`;

    this.changeProgress();
    this.changeNumericFields();
  }

  changeProgress() {
    const { thumbLeft, thumbRight, progress } = this.subElements;

    progress.style.left = thumbLeft.style.left;
    progress.style.right = thumbRight.style.right;
  }

  changeNumericFields() {
    const { from, to, progress } = this.subElements;
    const diff = this.max - this.min;

    const amount1 = diff / 100 * parseFloat(progress.style.left);
    from.textContent = this.formatValue(Math.round(amount1 + this.min));

    const amount2 = diff / 100 * (100 - parseFloat(progress.style.right));
    to.textContent = this.formatValue(Math.round(amount2 + this.min));
  }

  initEventListeners() {
    document.addEventListener('pointerdown', this.initThumb);
  }

  getRelatableValue(dividend, divider) {
    return parseFloat(dividend, 4) / divider * 100;
  }

  getSubElements(element) {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((prev, item) => {
      prev[item.dataset.element] = item;

      return prev;
    }, {});
  }

  sendEvent() {
    const {from, to} = this.subElements;

    this.element.dispatchEvent(new CustomEvent('range-select', {
      bubbles: true,
      detail: {
        from: Number(from.textContent.slice(1)), 
        to: Number(to.textContent.slice(1)),
      },
    }));
  }

  remove() {
    this.element.remove();
  }

  clearThumbData() {
    this.currentThumb = null;
    this.cursorOffest = null;
    
    document.removeEventListener('pointermove', this.moveThumb);
    document.removeEventListener('pointerup', this.dropThumb);
  }

  destroy() {
    this.clearThumbData();
    this.remove();
  }
}


