if ( ! RegExp.quote) {
    RegExp.quote = function(str) {
        return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    };
}
class AppCtrl {
    categories = {};
    products = {};
    showWarning = false;
    showFilterWarning = false;
    showClearResearchButton = false;
    showPartialResultWarning = false;
    isSearching = false;
    selectedCategoryKey = '';
    selectedCategory = {};
    selectedIndexKey = '';
    selectedIndex = {};
    resultCategoryName = '';
    resultIndexName = '';
    selectedCopyType = '';
    selectedCopyOption = '';
    selectedResolution = '';
    selectedImageOption = '';
    selectedPhotocopyOption = '';
    selectedFileTypeJpg = false;
    selectedFileTypePdf = false;
    selectedFileTypeTiff = false;
    productId = '';
    quantity = '1';
    price = '';
    productFound = false;
    attribute1 = '';
    attribute2 = '';
    warningHeader = '';
    warningMessage = '';
    datatableId = 'qsa-result-table';
    filters = [];
    suggestions = [];
    searchResultStyle = {
        display: 'none'
    };

    constructor(ProductService, CategoryService, DataTablesProvider, $timeout) {
        this.ProductService = ProductService;
        this.CategoryService = CategoryService;
        this.DataTablesProvider = DataTablesProvider;

        this.ProductService.getProducts((products) => {
            this.products = products;
        });

        this.CategoryService.getCategories((categories) => {
            this.categories = categories;
        });

        this.DataTablesProvider.setTableId(this.datatableId);

        /* The SWE framework set the height of .article to 630px.
         * This waits for half second to set the height back to auto.
         * Otherwise, the index list can't be seen.
         */
        $timeout(() => {
            angular.element('.article')[0].style.height = 'auto';
        }, 500);
    }

    changeCategory() {
        this.showWarning = false;
        this.showFilterWarning = false;
        this.selectedCategory = this.categories[this.selectedCategoryKey];
        this.filters = [];
        this.selectedIndex = {};
        this.selectedIndexKey = '';
    }

    changeIndex(indexKey) {
        this.showWarning = false;
        this.showFilterWarning = false;
        this.selectedIndex = this.selectedCategory.indexes[indexKey];
        this.filters = this.getFilters(this.selectedIndex.searchable);
        this.scrollTo('search-by');
    }

    changeOrderType() {
        if ( ! this.selectedCopyType) {
            return
        }
        if (this.selectedCopyType !== 'Physical copy') {
            this.selectedCopyOption = '';
        }
        this.productFound = false;
        for (let i = 0; i < this.products.records.length; i++) {
            let re = new RegExp('^' + RegExp.quote(this.selectedIndex.indexName), 'g');
            if (this.products.records[i].Title.match(re) !== null) {
                /*
                console.log(
                    'matched',
                    this.products.records[i],
                    `selectedCopyType: ${this.selectedCopyType}`,
                    `selectedCopyOption: ${this.selectedCopyOption}`,
                    `DeliveryEmail: ${this.products.records[i].DeliveryEmail}`,
                    `DeliveryPost: ${this.products.records[i].DeliveryPost}`
                );
                */
                if (this.selectedCopyType === 'Email') {
                    if (this.products.records[i].DeliveryEmail === 'TRUE') {
                        this.productFound = this.products.records[i];
                        break;
                    }
                }
                if (this.selectedCopyType === 'Physical copy') {
                    if (this.products.records[i].DeliveryPost === 'TRUE') {
                        if ((this.selectedCopyOption === 'CD') && (this.products.records[i].Title.match(/to CD/g) !== null)) {
                            this.productFound = this.products.records[i];
                            break;
                        }
                        if ((this.selectedCopyOption === 'USB') && (this.products.records[i].Title.match(/to USB/g) !== null)) {
                            this.productFound = this.products.records[i];
                            break;
                        }
                        if ((this.selectedCopyOption === 'Printed photographic image') && (this.products.records[i].Title.match(/paper copy/g) !== null)) {
                            this.productFound = this.products.records[i];
                            break;
                        }
                        if ((this.selectedCopyOption === 'Photocopy') && (this.products.records[i].Title.match(/paper copy/g) !== null)) {
                            this.productFound = this.products.records[i];
                            break;
                        }
                    }
                }
            }
        }
        if (this.productFound) {
            // console.log('Found Product', this.productFound);
            this.productId = this.productFound.ProductID;
            // this.price = this.productFound.CostExGST * this.quantity;
            this.price = '$' + parseFloat(this.productFound.CostExGST.replace(/\$/g, '')) * this.quantity;
            // this.productFound.GST
        } else {
            this.productId = '';
            this.price = '';
        }
    }

    validateProduct() {
        for (let i = 0; i < this.products.records.length; i++) {
            let re = new RegExp('^' + RegExp.quote(this.selectedIndex.indexName), 'g');
            if (this.products.records[i].Title.match(re) !== null) {
                return true;
            }
        }
        return false;
    }
    validateCopyOption() {
        return (this.selectedCopyType === 'Physical copy');
    }
    validateFileType() {
        if (this.validateCopyOption()) {
            switch (this.selectedCopyOption) {
                case 'CD':
                case 'USB':
                    return ( ! this.selectedFileTypeJpg && ! this.selectedFileTypePdf && ! this.selectedFileTypeTiff);
                    break;
                default:
                    return false;
            }
        } else {
            return false;
        }
    }
    validateResolution() {
        if (this.validateCopyOption()) {
            switch (this.selectedCopyOption) {
                case 'CD':
                case 'USB':
                    return true;
                    break;
                default:
                    return false;
            }
        } else {
            return false;
        }
    }
    validateImageOption() {
        if (this.validateCopyOption()) {
            if (this.selectedCopyOption === 'Printed photographic image') {
                return true;
            }
        }
        return false;
    }
    validatePhotocopyOption() {
        if (this.validateCopyOption()) {
            if (this.selectedCopyOption === 'Photocopy') {
                return true;
            }
        }
        return false;
    }
    validateAddToCart() {
        return (this.price.length === 0);
    }
    addToCart($event) {

        let selectedAttributes = [];
        let selectedFileTypes = [];
        let selectedResolution = '';
        let form = angular.element($event.target).parents('form');

        if (this.productFound) {

            selectedAttributes.push('Type: ' + this.selectedCopyType);

            if (this.selectedCopyType === 'Physical copy') {

                switch (this.selectedCopyOption) {
                    case 'CD':
                    case 'USB':
                        if (this.selectedFileTypeJpg) selectedFileTypes.push(form.find('[name="file-type-jpg"]').val());
                        if (this.selectedFileTypePdf) selectedFileTypes.push(form.find('[name="file-type-pdf"]').val());
                        if (this.selectedFileTypeTiff) selectedFileTypes.push(form.find('[name="file-type-tiff"]').val());
                        if (this.selectedResolution === 'Other') {
                            selectedResolution = `${this.selectedResolution} (${form.find('[name="other-resolution"]').val()})`;
                        } else {
                            selectedResolution = this.selectedResolution;
                        }
                        selectedAttributes.push(`Option: ${this.selectedCopyOption} (File Type: ${selectedFileTypes.join(', ')}; Resolution: ${selectedResolution})`);
                        break;
                    case 'Printed photographic image':
                        selectedAttributes.push(`Option: ${this.selectedCopyOption} (${this.selectedImageOption})`);
                        break;
                    case 'Photocopy':
                        selectedAttributes.push(`Option: ${this.selectedCopyOption} (${this.selectedPhotocopyOption})`);
                        break;
                    default:
                }
            }

            this.attribute1 = selectedAttributes.join(', ');
            form.find('[name="attribute1"]').val(this.attribute1);

        } else {
            this.attribute1 = '';
            this.attribute2 = '';
            $event.preventDefault();
        }
    }

    getIndexIdentifier(categoryKey, indexKey) {
        return `${categoryKey}_${indexKey}`;
    }

    // Create filter objects based on definition in categories.js
    getFilters(searchable) {
        return searchable.map((searchableField) => {
            return {
                field: searchableField,
                value: ''
            }
        });
    }

    validateFilters() {
        for (let filter of this.filters) {
            if (filter.value && filter.value !== '') {
                return true;
            }
        }

        return false;
    }

    displayWarning(header, message) {
        this.warningHeader = header;
        this.warningMessage = message;
        this.showWarning = true;
        this.isSearching = false;
        this.scrollTo('app-header');
    }

    searchResults() {
        this.isSearching = true;
        this.showWarning = false;
        this.searchResultStyle.display = 'block';

        if (!this.validateFilters()) {
            this.showFilterWarning = true;
            this.isSearching = false;
            return;
        } else {
            this.showFilterWarning = false;
        }

        const resourceId = this.selectedIndex.resources[0].resourceId;

        this.CategoryService.getResourceFields(resourceId, (fields) => {
            const queries = this.CategoryService.formatQueries(this.selectedIndex.resources, fields, this.filters);

            this.CategoryService.getSearchResults(queries, (data) => {
                if (data.success && data.success !== 'NONE') {
                    this.DataTablesProvider.destroy();

                    let columns = this.DataTablesProvider.setColumns(this.selectedIndex.primary);

                    let renderSuccess = this.DataTablesProvider.renderTable(this.selectedIndex, columns, data.records,
                        () => {
                            this.isSearching = false;
                            this.showClearResearchButton = true;
                            this.resultCategoryName = this.selectedCategory.categoryName;
                            this.resultIndexName = this.selectedIndex.indexName;
                            this.scrollTo('result-block');
                        },
                        () => {
                            this.selectedCopyType = '';
                            this.selectedCopyOption = '';
                        },
                        () => {
                            if ( ! this.validateProduct()) { // Disable to show the order form if no product data is found in CSV file
                                angular.element('.order-form').hide();
                            }
                        },
                    );

                    if (!renderSuccess) {
                        this.searchResultStyle.display = 'none';
                        this.displayWarning('Cannot Display Results', 'Please contact QSA');
                    }
                } else {
                    this.searchResultStyle.display = 'none';
                    this.displayWarning('There seems to be a problem', 'The index search is not currently available.');
                    this.scrollTo('top-warning-msg');
                }

                if (data.success && data.success === 'PART') {
                    this.showPartialResultWarning = true;
                    this.isSearching = false;
                }
            });
        }, (err) => {
            this.searchResultStyle.display = 'none';
            this.displayWarning('There seems to be a problem', `The index search is not currently available.`);
            this.scrollTo('top-warning-msg');

            console.error(`Failed to get index fields from ${this.selectedIndex.indexName}`);
            console.log(err);
        });
    }

    scrollTo(elementId) {
        angular.element('body').scrollTo(`#${elementId}`);
    }

    clearSearch() {
        this.showWarning = false;
        this.showFilterWarning = false;
        this.showClearResearchButton = false;
        this.isSearching = false;
        this.selectedCategoryKey = '';
        this.selectedCategory = {};
        this.selectedIndexKey = '';
        this.selectedIndex = {};
        this.resultCategoryName = '';
        this.selectedResolution = '';
        this.selectedImageOption = '';
        this.selectedPhotocopyOption = '';
        this.selectedFileTypeJpg = false;
        this.selectedFileTypePdf = false;
        this.selectedFileTypeTiff = false;
        this.productId = '';
        this.quantity = '1';
        this.price = '';
        this.productFound = false;
        this.attribute1 = '';
        this.attribute2 = '';
        this.resultIndexName = '';
        this.selectedCopyType = '';
        this.selectedCopyOption = '';
        this.filters = [];
        this.suggestions = [];
        this.searchResultStyle.display = 'none';
        this.scrollTo('index-categories');
    }
}

AppCtrl.$inject = ['ProductService', 'CategoryService', 'DataTablesProvider', '$timeout'];

export default AppCtrl;
