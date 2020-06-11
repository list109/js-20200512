export default class DoubleSlider {
  element;
  subElements = {};

  onThumbPointerMove = event => {
    event.preventDefault();

    const MIN_PERCENTAGE = 0;
    const MAX_PERCENTAGE = 100;
    const { thumbLeft, thumbRight, inner, progress, from, to } = this.subElements;
    const { left: innerLeft, right: innerRight, width } = inner.getBoundingClientRect();

    if (this.dragging === thumbLeft) {
      // Рассчитываем положение "левого" ползунка в пропорциональном соотношении к длине слайдера
      let newLeft = (event.clientX - innerLeft + this.shiftX) / width;

      // Если вышли за пределы левой границы - сбросили положение ползунка в 0
      if (newLeft < MIN_PERCENTAGE) {
        newLeft = MIN_PERCENTAGE;
      }

      // Переводим положение "левого" ползунка в проценты
      newLeft *= MAX_PERCENTAGE;

      // Получаем положение "правого" ползунка
      const right = parseFloat(thumbRight.style.right);

      // Уменьшаем значение "левого" ползунка, если вышли за пределы 100-тов
      if (newLeft + right > MAX_PERCENTAGE) {
        newLeft = MAX_PERCENTAGE - right;
      }

      // изменяем позицию перетаскиваемого ползунка
      // на изображении отмечено знаком "*" | start ----*=========*----- end |
      this.dragging.style.left = `${newLeft}%`;
      // изменяем полосу "прогресса" - индикатора выбранного диапазона
      // на изображении отмечено знаком "=" | start ----*=========*----- end |
      progress.style.left = `${newLeft}%`;
      // обновляем значение "start" выбранного диапазона | start ----*=========*----- end |
      from.innerHTML = this.formatValue(this.getValue().from);
    } else {
      let newRight = (innerRight - event.clientX - this.shiftX) / width;

      if (newRight < MIN_PERCENTAGE) {
        newRight = MIN_PERCENTAGE;
      }
      newRight *= MAX_PERCENTAGE;

      let left = parseFloat(this.subElements.thumbLeft.style.left);

      if (left + newRight > MAX_PERCENTAGE) {
        newRight = MAX_PERCENTAGE - left;
      }
      this.dragging.style.right = `${newRight}%`;
      progress.style.right = `${newRight}%`;
      to.innerHTML = this.formatValue(this.getValue().to);
    }
  };

  onThumbPointerUp = () => {
    this.element.classList.remove('range-slider_dragging');

    document.removeEventListener('pointermove', this.onThumbPointerMove);
    document.removeEventListener('pointerup', this.onThumbPointerUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: this.getValue(),
      bubbles: true
    }));
  };

  constructor({
    min = 100,
    max = 200,
    formatValue = value => '$' + value,
    selected = {
      from: min,
      to: max
    }
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    this.render();
  }

  get template() {
    const { from, to } = this.selected;

    return `<div class="range-slider">
      <span data-element="from">${this.formatValue(from)}</span>
      <div data-element="inner" class="range-slider__inner">
        <span data-element="progress" class="range-slider__progress"></span>
        <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
        <span data-element="thumbRight" class="range-slider__thumb-right"></span>
      </div>
      <span data-element="to">${this.formatValue(to)}</span>
    </div>`;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.element.ondragstart = () => false;

    this.subElements = this.getSubElements(element);

    // Инициализируем обработчики событий
    this.initEventListeners();

    // Инициализируем начальные положения "ползунков"
    this.update();
  }

  initEventListeners() {
    const { thumbLeft, thumbRight } = this.subElements;

    thumbLeft.addEventListener('pointerdown', event => this.onThumbPointerDown(event));
    thumbRight.addEventListener('pointerdown', event => this.onThumbPointerDown(event));
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointermove', this.onThumbPointerMove);
    document.removeEventListener('pointerup', this.onThumbPointerUp);
  }

  update() {
    const { progress, thumbLeft, thumbRight } = this.subElements;
    const rangeTotal = this.max - this.min;
    // Переводим абсолютные значения в процентные
    const left = Math.floor((this.selected.from - this.min) / rangeTotal * 100) + '%';
    const right = Math.floor((this.max - this.selected.to) / rangeTotal * 100) + '%';

    progress.style.left = left;
    progress.style.right = right;

    thumbLeft.style.left = left;
    thumbRight.style.right = right;
  }

  onThumbPointerDown(event) {
    const thumbElem = event.target;

    event.preventDefault();

    const { left, right } = thumbElem.getBoundingClientRect();

    if (thumbElem === this.subElements.thumbLeft) {
      this.shiftX = right - event.clientX;
    } else {
      this.shiftX = left - event.clientX;
    }

    this.dragging = thumbElem;

    this.element.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onThumbPointerMove);
    document.addEventListener('pointerup', this.onThumbPointerUp);
  }

  getValue() {
    const { thumbLeft, thumbRight } = this.subElements;
    const rangeTotal = this.max - this.min;
    const { left } = thumbLeft.style;
    const { right } = thumbRight.style;

    // Преобразовываем процентные значения в абсолютные
    const from = Math.round(this.min + parseFloat(left) * 0.01 * rangeTotal);
    const to = Math.round(this.max - parseFloat(right) * 0.01 * rangeTotal);

    return { from, to };
  }
}
