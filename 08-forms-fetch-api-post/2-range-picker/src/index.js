export default class RangePicker {
    currentMonth;
    prevMonth;
    pickedCell = null;

    onClick = event => {
        if (event.target.closest('[data-elem="input"]')) this.toggleCalendar();

        const arrow = event.target.closest('[class^="rangepicker__selector-control"]');
        if (arrow) this.changeMonths(arrow);

        const chosenCell = event.target.closest('.rangepicker__cell');
        if (chosenCell) this.pickCells(chosenCell);
    }

    closeCalendar = event => {
        const isNotWithinElement = !this.element.contains(event.target);

        if (isNotWithinElement) {
            if (this.pickedCell) this.to = null;

            this.element.classList.remove('rangepicker_open');
        }
    }

    constructor({ from, to }) {
        this.from = from;
        this.to = to;

        [this.currentMonth, this.prevMonth] = this.getInitMonths(to);
        this.render()
    }

    getInitMonths(currentDate) {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const day = 1;

        const currentMonth = new Date(year, month, day);
        const prevMonth = new Date(year, month - 1, day);

        return [currentMonth, prevMonth];
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.getTemplate;
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements();
        this.initEventListeners();
    }

    initEventListeners() {
        const { input, selector } = this.subElements;

        input.addEventListener('click', this.onClick);
        selector.addEventListener('click', this.onClick, true);
        document.addEventListener('click', this.closeCalendar, true);
    }

    toggleCalendar() {
        const { selector } = this.subElements;

        this.element.classList.toggle('rangepicker_open');
        selector.append(...this.getSelectorElements());

        if (this.pickedCell) this.to = null;
    }

    changeMonths(arrow) {
        const { selector } = this.subElements;
        const prevMonth = this.prevMonth;
        const currentMonth = this.currentMonth;

        const arrowDirection = (arrow.matches('[class$="right"]')) ? 'right' : 'left';

        if (arrowDirection === 'right') {
            this.prevMonth = new Date(currentMonth);
            this.currentMonth.setMonth(currentMonth.getMonth() + 1);
        } else {
            this.currentMonth = new Date(prevMonth);
            this.prevMonth.setMonth(prevMonth.getMonth() - 1);
        };

        selector.append(...this.getCalendarElements({
            prevMonth: this.prevMonth,
            currentMonth: this.currentMonth,
        }));
    }

    pickCells(chosenCell) {
        const { selector, input } = this.subElements;
        const { value } = chosenCell.dataset;
        const chosenDate = new Date(value);

        if (this.pickedCell) {
            const prevDate = new Date(this.from);

            this.to = chosenDate;

            if (chosenDate < prevDate) {
                this.from = chosenDate;
                this.to = prevDate;
            }

            chosenCell.classList.add('rangepicker__selected-to');

            this.element.classList.remove('rangepicker_open');
            this.pickedCell = null;

            input.innerHTML = this.getInputTemplate();

            return;
        }

        const cells = selector.querySelectorAll('.rangepicker__cell');
        [...cells].forEach(item => item.className = 'rangepicker__cell');

        this.from = chosenDate;
        chosenCell.classList.add('rangepicker__selected-from');

        this.pickedCell = chosenCell;
    }

    get getTemplate() {
        return `
        <div class="rangepicker">
            <div class="rangepicker__input" data-elem="input">
                ${this.getInputTemplate()}
            </div>
            <div class="rangepicker__selector" data-elem="selector"></div>
        </div>`
    }

    getInputTemplate({ from = this.from, to = this.to } = {}) {
        return ` 
            <span data-elem="from">${this.getInputDateFormat(from)}</span> - 
            <span data-elem="to">${this.getInputDateFormat(to)}</span>`
    }

    getInputDateFormat(date) {
        const formatter = new Intl.DateTimeFormat("ru");

        return formatter.format(date);
    }

    getSelectorElements() {
        const selector = document.createElement('div');

        selector.append(...this.getCalendarElements());

        const template = `<div class="rangepicker__selector-arrow"></div>
                    <div class="rangepicker__selector-control-left"></div>
                    <div class="rangepicker__selector-control-right"></div>`;

        selector.insertAdjacentHTML('afterbegin', template);

        return selector.children;
    }

    getCalendarElements({ prevMonth = this.prevMonth, currentMonth = this.currentMonth } = {}) {
        const { selector } = this.subElements;
        const calendars = selector.querySelectorAll('.rangepicker__calendar');

        [...calendars].forEach(item => item.remove());

        return [
            this.getMonthElement(prevMonth),
            this.getMonthElement(currentMonth)]
    }

    getMonthElement(month) {
        const monthName = this.getMonthName(month);
        const daysTotal = this.getMonthDaysTotal(month);
        const element = document.createElement('div');

        element.innerHTML = ` 
            <div class="rangepicker__calendar">
                <div class="rangepicker__month-indicator">
                  <time datetime="${monthName}">${monthName}</time>
                </div>
                <div class="rangepicker__day-of-week">
                  <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                </div>
                <div class="rangepicker__date-grid">
                    ${this.getDaysTemplate(month, daysTotal)}
                </div>
            </div>`

        return element.firstElementChild;
    }

    getMonthName(date) {
        const locale = 'ru';

        const formatter = new Intl.DateTimeFormat(locale, {
            month: 'long',
        });

        return formatter.format(date);
    }

    getMonthDaysTotal(date) {
        const month = date.getMonth();
        const year = date.getFullYear();
        const firstDay = 1;

        const monthMsAmount = new Date(year, month + 1, firstDay).setDate(0);
        const daysTotal = new Date(monthMsAmount).getDate();

        return daysTotal;
    }

    getDaysTemplate(month, daysTotal) {
        const year = month.getFullYear();
        const sunday = 7;

        const dayOfWeek = month.getDay() || sunday;

        let day = 1;
        const dateForFirstDay = new Date(year, month.getMonth(), day);
        const classForFirstDay = this.getClassByDate(dateForFirstDay);

        let template = `<button type="button" 
                              class="${classForFirstDay}" 
                              data-value="${dateForFirstDay}" 
                              style="--start-from: ${dayOfWeek}">
                      ${day}
                    </button>`;


        while (++day <= daysTotal) {
            const date = new Date(year, month.getMonth(), day);
            const dateClass = this.getClassByDate(date);

            template += `
          <button type="button" class="${dateClass}" 
          data-value="${date}">
            ${day}
          </button>`
        }

        return template;
    }
    getClassByDate(date) {
        let className = 'rangepicker__cell';
        if (date > this.from && date < this.to) className += ' rangepicker__selected-between';
        if (String(date) === String(this.from)) className += ' rangepicker__selected-from';
        if (String(date) === String(this.to)) className += ' rangepicker__selected-to';

        return className;
    }

    getSubElements() {
        const elements = this.element.querySelectorAll('[data-elem]');

        return [...elements].reduce((obj, item) => {
            obj[item.dataset.elem] = item;
            return obj;
        }, {})
    }
    remove() {
        this.element.remove();
    }

    destroy() {
        const { input, selector } = this.subElements;

        this.currentMonth = null;
        this.prevMonth = null;
        this.pickedCell = null;

        this.remove();

        input.removeEventListener('click', this.onClick);
        selector.removeEventListener('click', this.onClick, true);
        document.removeEventListener('click', this.closeCalendar, true);
    }

}

//npm run test:specific --findRelatedTests 08-forms-fetch-api-post/2-range-picker/src/index.spec.js 