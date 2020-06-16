export default class RangePicker {
    currentMonth = null;
    prevMonth = null;
    
    toggleCalendar = event => {
        const {selector} = this.subElements;
      
        if(event.target.closest('[data-elem="input"]')) {
          selector.innerHTML = this.getCalendarTemplate();
          this.element.classList.toggle('rangepicker_open'); 
        }
    }

    moveMonths(arrow) {
        const {selector} = this.subElements;

        if(arrow.matches('[data-elem="arrowRight"]')) {
          this.prevMonth = this.currentMonth;
          this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
        } else {
          this.currentMonth = this.prevMonth;
          this.prevMonth = new Date(this.prevMonth.getFullYear(), this.currentMonth.getMonth() - 1);
        };
      
        selector.innerHTML = this.getCalendarTemplate({
          prevMonth: this.prevMonth, 
          currentMonth: this.currentMonth, 
        });
    }
  
    constructor({ from, to }) {
        this.from = from;
        this.to = to;

        [this.currentMonth, this.prevMonth] = this.getMonths(to);
        this.render()
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.getTemplate;

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements();

        this.initEventListeners();
    }

    initEventListeners() {
        const {input, arrowLeft, arrowRight} = this.subElements;
        input.addEventListener('click', this.toggleCalendar);
        arrowLeft.addEventListener('click', this.moveMonths);
        arrowRight.addEventListener('click', this.moveMonths);
    }

    get getTemplate() {
        return `
        <div class="rangepicker">
            ${this.getInputTemplate()}
            <div class="rangepicker__selector" data-elem="selector"></div>
        </div>`
    }

    getInputTemplate() {
        return `    
        <div class="rangepicker__input" data-elem="input">
            <span data-elem="from">${this.gateCorrectDate(this.from)}</span> - 
            <span data-elem="to">${this.gateCorrectDate(this.to)}</span>
        </div>`
    }

    getCalendarTemplate({prevMonth = this.prevMonth, currentMonth = this.currentMonth} = {}) {
        return `
            <div class="rangepicker__selector-arrow"></div>
            <div class="rangepicker__selector-control-left" data-elem="arrowLeft"></div>
            <div class="rangepicker__selector-control-right" data-elem="arrowRight"></div>
            ${this.getMonthTemplate(prevMonth)}
            ${this.getMonthTemplate(currentMonth)} `
    }


    getMonths(currentDate) {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const day = 1;
 
        const currentMonth = new Date(year, month, day);
        const prevMonth = new Date(year, month - 1, day);

        return [currentMonth, prevMonth];
     }

    getMonthsDaysAmount(date) {
        const month = date.getMonth();
        const year = date.getFullYear();
        const day = 1;
      
        const mothMsAmount = new Date(year, month + 1, day).setDate(0);
        const days = new Date(mothMsAmount).getDate();
      
        return days;
    }



    getMonthTemplate(month) {
        const monthName = this.getMonthName(month);
        const daysAmoun = this.getMonthsDaysAmount(month);

        return ` 
            <div class="rangepicker__calendar">
                <div class="rangepicker__month-indicator">
                  <time datetime="${monthName}">${monthName}</time>
                </div>
                <div class="rangepicker__day-of-week">
                  <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                </div>
                <div class="rangepicker__date-grid">
                    ${this.getDaysTemplate(daysAmoun, month)}
                </div>
            </div>`
    }

    getDaysTemplate(days, month) {
      const year = month.getFullYear();
      const sunday = 7;
      const firstDay = month.getDay() || sunday;
      
      
      let day = 1;
      const dateForFirstDay = new Date(year, month.getMonth(), day);
      const classForFirstDay = this.getClassByDate(dateForFirstDay);
      
      let template = `<button type="button" 
                              class="${classForFirstDay}" 
                              data-value="${dateForFirstDay}" 
                              style="--start-from: ${firstDay}">
                      ${day}
                    </button>`;
      
      
      while (day++ <= days) {
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

      if(date > this.from && date < this.to) className += ' rangepicker__selected-between';
      if(String(date) === String(this.from)) className += ' rangepicker__selected-from';
      if(String(date) === String(this.to)) className += ' rangepicker__selected-to';
      return className;
    }

    gateCorrectDate(date) {
        const formatter = new Intl.DateTimeFormat("ru");
      
        return formatter.format(date);
    }

    getMonthName(date) {
        const months = ['январь', 'февраль', 'март', 'апрель', 
         'май', 'июнь', 'июль', 'август', 
         'сентябрь', 'октябрь', 'ноябрь', 'декабрь']

         return months[date.getMonth()];
    }

    getSubElements() {
        const elements = this.element.querySelectorAll('[data-elem]');
        console.log(elements)
        return [...elements].reduce((obj, item) => {
            obj[item.dataset.elem] = item;
            return obj;
        }, {})
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
    }
}