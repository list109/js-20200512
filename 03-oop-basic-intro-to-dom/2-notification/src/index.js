export default class NotificationMessage {
    constructor(message = 'Hello World', { duration = 5000, type = 'success' } = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;
        this.element;

        this.render();
    }

    render() {
        const element = document.createElement('div');
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
    }

    get template() {
        return `
            <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
                <div class="timer"></div>
                <div class="inner-wrapper">
                    <div class="notification-header">${this.type}</div>
                    <div class="notification-body">
                        ${this.message}
                    </div>
                </div>
            </div>
        `;
    }

    show(elem) {
        //незнаю как лучше, вынести во внешние переменные вместо this.constructor... 
        //или использовать конструктор для хранения данныx? 
        // да и тоже не уверен, сброс таймера нужен здесь здесь, чтобы по второму разу не удалять из док-та элемент?
        this.constructor.prevElem?.remove();

        this.element = this.constructor.prevElem = elem || this.element;
        document.body.append(this.element)
        setTimeout(() => { this.destroy() }, this.duration);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
    }
}
