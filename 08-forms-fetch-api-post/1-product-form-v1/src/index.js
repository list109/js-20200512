//import SortableList from '../../../08-tests-routes-browser-history-api/2-sortable-list/solution/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import SortableList from './sortable-list.js'
import RequestNotification from './notification.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
    categoriesData = [];
    productData = {};
    imageFile;
    sortableList;

    constructor(productId) {
        this.productId = productId;
    }

    async render() {
        await this.loadData();

        this.element = document.createElement('div');
        this.element.className = 'product-form';
        this.element.innerHTML = this.getTemplate;

        this.subElements = this.getSubElements();

        const { productForm, imageListContainer } = this.subElements;
        const { subcategory, status } = this.productData;

        const items = [...imageListContainer.children];
        const { element: sortableList } = new SortableList({ items });
        imageListContainer.append(sortableList);
        this.sortableList = sortableList;

        // с коротким синтаксисом без elements не проходят тесты
        productForm.elements.subcategory.value = subcategory;
        productForm.elements.status.value = status;

        this.initEventListeners();

        return this.element;
    }

    async loadData() {
        this.categoriesData = await this.loadCategoriesData();
        if (this.productId) this.productData = await this.loadProductData();
        this.productData = this.productData?.[0] || {};
    }

    async loadCategoriesData() {
        const url = new URL('api/rest/categories', BACKEND_URL);

        url.searchParams.set('_sort', 'weight');
        url.searchParams.set('_refs', 'subcategory');

        return await fetchJson(url);
    }

    async loadProductData() {
        const url = new URL('api/rest/products', BACKEND_URL);

        url.searchParams.set('id', this.productId);

        return await fetchJson(url);
    }

    initEventListeners() {
        const { uploadBtn } = this.subElements;
        uploadBtn.addEventListener('pointerdown', this.initImageUploading);

        this.element.addEventListener('submit', this.uploadData);
    }

    uploadData = async (event) => {
        event.preventDefault();

        const { element: notification } = new RequestNotification();

        const url = new URL('api/rest/products', BACKEND_URL);

        try {
            await fetchJson(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body: this.getRequestBody(),
            });
        } catch (err) {
            notification.firstElementChild.textContent = err.message;
            notification.classList.add('show', 'notification_error');
            return;
        }

        notification.classList.add('show', 'notification_success');
        notification.firstElementChild.textContent = 'Товар сохранен';

        this.element.dispatchEvent(new CustomEvent('product-saved', {
            bubbles: true,
        }))
    }

    getRequestBody() {
        const { productForm } = this.subElements;
        const sortableList = this.sortableList;
        const fields = ['id', 'title', 'description', 'discount', 'price',
            'quantity', 'status', 'subcategory',];

        const body = fields.reduce((obj, field) => {
            const value = productForm[field].value;
            obj[field] = parseInt(value, 10) || value;
            return obj;
        }, {})

        const imagesBody = [...sortableList.children].map(item => {
            const url = item.children[0].value;
            const source = item.children[1].value;
            return { url, source };
        })

        body.id = this.productData.id;
        body.images = imagesBody;

        return JSON.stringify(body);
    }

    initImageUploading = event => {
        this.imageFile = document.createElement('input');
        this.imageFile.type = 'file';
        this.imageFile.name = 'image';
        this.imageFile.oninput = this.uploadImage;
        this.imageFile.click();
    }

    uploadImage = async () => {
        const { uploadBtn } = this.subElements;

        uploadBtn.classList.add('is-loading');

        const fileName = this.imageFile.value.split('\\').slice(-1);
        const form = document.createElement('form');

        form.append(this.imageFile);

        const url = 'https://api.imgur.com/3/image';

        try {

           const response = await fetchJson(url, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    authorization: `Client-ID ${IMGUR_CLIENT_ID}`
                }
            })

            uploadBtn.classList.remove('is-loading');
            this.insertImage(fileName, response.data);

        } catch (err) {

            uploadBtn.classList.remove('is-loading');
            throw err;

        }
    }

    insertImage(name, { link }) {
        const sortableList = this.sortableList;

        sortableList.insertAdjacentHTML('beforeEnd', this.getImageTemplate({
            url: link,
            source: name,
        }));
    }

    get getTemplate() {
        return `
        <form data-element="productForm" class="form-grid">
            ${this.formDescriptionTeplate}
            ${this.formParametersTemplate}
            <div class="form-buttons">
                <button type="submit" name="save" class="button-primary-outline">
                    Сохранить товар
                </button>
            </div>
        </form>`
    }

    get formDescriptionTeplate() {
        const { title = '', description = '', images = [] } = this.productData;

        return `
        <div class="form-group form-group__half_left">
            <fieldset>
            <label class="form-label">Название товара</label>
            ${this.getInputTemplate({ value: title, name: 'title', placeholder: 'Название товара' })}
            </fieldset>
        </div>

        <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            ${this.getTextareaTemplate({ text: description, placeholder: 'Описание товара' })}
        </div>

        <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            ${this.getImagesListTemplate(images)}

            <div data-element="fileInputList"></div>

            <button data-element="uploadBtn" type="button" class="button-primary-outline">
                <span>Загрузить</span>
            </button>
        </div>`
    }

    get formParametersTemplate() {
        const { price = 100, discount = 10, quantity = 1, subcategory } = this.productData;

        return `
        <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            ${this.getCategoriesTemplate(this.categoriesData)}
        </div>

        <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
                <label class="form-label">Цена ($)</label>
                ${this.getInputTemplate({ value: price, type: 'number', name: 'price', placeholder: '100' })}
            </fieldset>
            <fieldset>
                <label class="form-label">Скидка ($)</label>
                ${this.getInputTemplate({ value: discount, type: 'nimber', name: 'discount', placeholder: '0' })}
            </fieldset>
        </div>

        <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            ${this.getInputTemplate({ value: quantity, type: 'nimber', name: 'quantity', placeholder: '1' })}
        </div>

        <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status">
                <option value="1">Активен</option>
                <option value="0">Неактивен</option>
            </select>
        </div>`
    }

    getInputTemplate({ value = '', type = 'text', name = '', placeholder = '' }) {
        return `<input required="" value="${value}" type="${type}" name="${name}" class="form-control" placeholder="${placeholder}">`
    }

    getTextareaTemplate({ text = '', placeholder = '' }) {
        return `
            <textarea required="" class="form-control" name="description" 
            data-element="productDescription" placeholder="${placeholder}">${text}</textarea>`
    }

    getImagesListTemplate(images = []) {
        return `
        <div data-element="imageListContainer">
          ${images.map(image => this.getImageTemplate(image)).join('')}   
        </div>`
    }

    getImageTemplate({ url, source }) {
        return `
        <li class="sortable-list__item products-edit__imagelist-item">
            <input type="hidden" name="url" value="${url}">
            <input type="hidden" name="source" value="${source}">
            <span>
              <img src="./icon-grab.svg" data-grab-handle alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src="${url}">
              <span>${source}</span>
            </span>
            <button type="button">
              <img src="./icon-trash.svg" data-delete-handle alt="delete">
            </button>
        </li>`
    }

    getCategoriesTemplate(categories = []) {
        return `
        <select class="form-control" name="subcategory">
            ${categories.map(category => this.getSubCategories(category))}
        </select>`
    }

    getSubCategories(category = []) {
        const { subcategories } = category;

        return subcategories
            .map(({ id, title }) => `
          <option value="${id}">
            ${category.title} &gt; ${title}
          </option>
        `)
    }

    getSubElements() {
        const elements = this.element.querySelectorAll('[data-element]');
        return [...elements].reduce((obj, elem) => {
            const name = elem.dataset.element;
            obj[name] = elem;

            return obj;
        }, {})
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        

        console.log(this);

        //this.uploadImage.removeEventListener('pointerdown', this.initImageUploading);
        //this.element.removeEventListener('submit', this.uploadData);

        //this.remove();

        this.imageFile = null;
        this.categoriesData = [];
        this.productData = {};


    }
}


//npm run test:specific --findRelatedTests 08-forms-fetch-api-post/1-product-form-v1/src/index.spec.js