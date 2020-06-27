export default class SortableList {
    element;
    currentDragItem;
    dragItemParent;
    placeholder;
    leftCursorShift;
    topCursorShift;
    prevClientY;

    prevElemenetMiddle;
    nextElementMiddle;

    onPointerdown = event => {
        const dragItem = event.target.closest('.sortable-list__item');
        const dragItemParent = event.target.closest('.sortable-list');

        const isDragBtnExist = dragItem?.querySelector('[data-grab-handle]');
        const isDragBtnClicked = event.target.closest('[data-grab-handle]');
        
        if(isDragBtnExist) {
            if(isDragBtnClicked) this.initDragElement({ dragItem, dragItemParent });
            return;
        }

        this.initDragElement({ dragItem, dragItemParent });
    }

    onClick = event => {
        const binBtn = event.target.closest('[data-delete-handle]');
        const dragItem = event.target.closest('.sortable-list__item');
        
        if (binBtn && dragItem) dragItem.remove();
    }

    moveDragElement = event => {
        const { clientY } = event;
        const placeholder = this.placeholder;
        const dragItem = this.currentDragItem;
        const {previousElementSibling: prevElem, nextElementSibling: nextElem} = placeholder;

        if(clientY < this.prevElemenetMiddle) {
            prevElem.before(placeholder);
        }

        if(clientY > this.nextElementMiddle && nextElem !== dragItem) {
            nextElem.after(placeholder);
        }

        [this.prevElemenetMiddle, this.nextElementMiddle] = this.getNeighborElementsMiddles(placeholder);

        this.setPosition(dragItem, event);
    }

    dropDragElement = () => {
        const dragItem = this.currentDragItem;
        const placeholder = this.placeholder;

        placeholder.replaceWith(dragItem);

        dragItem.style.top = '';
        dragItem.style.left = '';
        dragItem.style.width = '';

        dragItem.classList.remove('sortable-list__item_dragging');

        this.clearDragInformation();
    }

    constructor({ items = [] }) {
        this.items = items;

        this.render();
        this.initEventListener();
    }

    render() {
        const items = this.items;

        const element = document.createElement('div');
        element.innerHTML = this.getTemplate;

        this.element = element.firstElementChild;

        items.forEach(item => item.classList.add('sortable-list__item'));

        this.element.append(...items);
    }

    get getTemplate() {
        return `<ul class="sortable-list"></ul>`
    }

    initEventListener() {
        this.element.addEventListener('pointerdown', this.onPointerdown);
        this.element.addEventListener('click', this.onClick);
    }

    initDragItemEventListeners(dragItem) {
        document.addEventListener('pointermove', this.moveDragElement);
        document.addEventListener('pointerup', this.dropDragElement);
        dragItem.ondragstart = () => false;
    }

    initDragElement({ dragItem, dragItemParent }) {

        event.preventDefault();

        if(this.placeholder) return;

        const { left, top } = dragItem.getBoundingClientRect();
        const width = dragItem.offsetWidth;
        const height = dragItem.offsetHeight;
        const placeholder = this.getPlaceholder({ width, height });

        dragItem.style.width = `${dragItem.offsetWidth}px`;
        dragItem.classList.add('sortable-list__item_dragging');

        dragItem.replaceWith(placeholder);
        dragItemParent.after(dragItem);

        this.leftCursorShift = event.clientX - left;
        this.topCursorShift = event.clientY - top;

        this.setPosition(dragItem, event);

        [this.prevElemenetMiddle, this.nextElementMiddle] = this.getNeighborElementsMiddles(placeholder);

        this.initDragItemEventListeners(dragItem);

        this.dragItemParent = dragItemParent;
        this.currentDragItem = dragItem;
        this.placeholder = placeholder;
        this.prevClientY = event.clientY;
    }

    getPlaceholder({ width, height }) {
        const placeholder = document.createElement('div');

        placeholder.className = 'sortable-list__placeholder';

        placeholder.style.width = `${width}px`;
        placeholder.style.height = `${height}px`;

        return placeholder;
    }

    setPosition(elem, { clientX, clientY }) {
        const {clientHeight: documentHeight, clientWidth: documentWidth} = document.documentElement;
        const {offsetHeight: elemHeight} = elem;
        const positionDiff = clientY - this.prevClientY;

        let topPosition = clientY - this.topCursorShift;
        let leftPosition = clientX - this.leftCursorShift;

        if(topPosition < 0) {
            topPosition = 0;
            window.scrollBy(0, -Math.abs(positionDiff));
        }
        if(topPosition + elemHeight > documentHeight) {
            topPosition = documentHeight - elemHeight;
            window.scrollBy(0, Math.abs(positionDiff));
        }
        
        const definitiveTop = topPosition;
        const definitiveLeft = (leftPosition < 0) ? 0 : leftPosition;
        //if(leftPosition + elemWidth > documentWidth) leftPosition = documentWidth - elemWidth;

        elem.style.top = `${definitiveTop}px`
        elem.style.left = `${definitiveLeft}px`;

        this.prevClientY = clientY;
    }

    getNeighborElementsMiddles(placeholder) {
        const {previousElementSibling: prevElemenet, nextElementSibling: nextElement} = placeholder;
        
        const prevElemenetHalf = prevElemenet?.offsetHeight / 2;
        const nextElemenHalf = nextElement?.offsetHeight / 2;

        const prevElemenetMiddle = prevElemenet?.getBoundingClientRect().top + prevElemenetHalf;
        const nextElementMiddle = nextElement?.getBoundingClientRect().top + nextElemenHalf;
        
        return [prevElemenetMiddle, nextElementMiddle];
    }

    clearDragInformation() {
        document.removeEventListener('pointermove', this.moveDragElement);
        document.removeEventListener('pointerup', this.dropDragElement);

        this.currentDragItem = null;
        this.placeholder = null;
        this.leftCursorShift = null;
        this.topCursorShift = null;
        this.dragItemParent = null;
        this.prevClientY = null;
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.element.removeEventListener('pointerdown', this.onPointerdown);
        this.element.removeEventListener('click', this.onClick);
        this.remove();
        this.clearDragInformation();
    }
}