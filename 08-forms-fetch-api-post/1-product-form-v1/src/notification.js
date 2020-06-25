export default class RequestNotification {
    static element = null;
  
    constructor(timeOut = 3000) {
      this.timeOut = timeOut;
      
      this.render();
      this.show();
    }
  
    render() {  
        this.destroy();  
      
        const element = document.createElement('div');
        element.innerHTML = this.getTemplate;
      
        this.element = element.firstElementChild
        RequestNotification.element = this.element;
    }

    show(parent = document.body) {
        parent.append(this.element);
        setTimeout(() => this.element.remove(), this.timeOut)
    };

    get getTemplate() {
        return `
        <div class="notification">
            <div class="notification__content"></div>
        </div>`
    }

    remove() {
        RequestNotification.element?.remove();
    }

    destroy() {
        this.remove();
    }
}