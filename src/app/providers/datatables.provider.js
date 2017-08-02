import angular from 'angular';

/*
 * A provider used with jQuery plugin DataTablesProvider
 * Must include jQuery and DataTables to work
 */
class DataTablesProvider {
    datatable = undefined;
    tableId = '';

    setTableId(id) {
        if (!(id && typeof id === 'string' && id.length > 0)) {
            throw 'Invalid datatable id';
        }

        this.tableId = id;
    }

    setColumns(primaryFields) {
        let firstColumn = {
            className: 'details-control',
            orderable: false,
            data: null,
            defaultContent: ''
        };

        let columns = primaryFields.reduce((allColumns, title) => {
            // Format column header with sentence case
            let columnHeader = title.charAt(0).toUpperCase() + title.substr(1).toLowerCase();

            let column = {
                title: columnHeader,
                data: title,
                orderable: title !== 'DIGITAL IMAGE',
                render: (data, type, row, meta) => {
                    if (data === undefined) {
                        if (meta.row === 0)
                            console.error(`Column ${title} has no data`);

                        return '';
                    }

                    if (data && title === 'DIGITAL IMAGE')
                        return `<a href="${data}" target="_blank">See image</a>`;

                    return data;
                }
            }

            return [...allColumns, column];
        }, [firstColumn]);

        return columns;
    }

    formatExtraInfo(index, node, data) {
        let excludedFields = [...index.primary, '_ID', '_FULL_TEXT', 'DESCRIPTION', 'INDEX NAME', 'RESOURCE ID'];

        let rowClass = angular.element(node).hasClass('even') ? 'even' : 'odd';

        let extraInfo = `<tr class="${rowClass} detailedInfoRow open">
                            <td>&nbsp;</td>
                            <td colspan="${index.primary.length}">`;

        //--As a part of order online button--
        let urlLink = "../request-form/index.html?checkbox=1&search=1";
        let attribute3;
        const redirectUrl = 'https://test.smartservice.qld.gov.au/services/test/prodi/products';

        if (!data['INDEX NAME']) data['INDEX NAME'] = 'No index name provided';
        if (!data['DESCRIPTION']) data['DESCRIPTION'] = 'No description provided';

        // Display description
        extraInfo += `<div>
                        <p>${data['INDEX NAME']}</p>
                        <p>${data['DESCRIPTION']}</p>
                      </div><ul>`;

        // Display all fields other than excluded fields
        Object.keys(data).sort().forEach((key) => {
            if (excludedFields.indexOf(key) < 0) {
                let formatedKey = key.charAt(0).toUpperCase() + key.substr(1).toLowerCase();

                extraInfo += `<li><b>${formatedKey}</b><ul><li>${data[key]}</li></ul></li>`;
            }
            // --As a part of order online button--
            if (key == '_ID') {
                let formatedKeyId = key.replace(/\w\S*/g, (txt) => {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
                urlLink += `&${formatedKeyId}=${data[key]}`;
            }
            // -- End OnlineButn--
        });
        // --As a part of order online button--
        urlLink += `&resource_id=${data['RESOURCE ID']}`;
        attribute3 = `https://www.qld.gov.au/dsiti/qsa/request-form/index-result/index.html?resource_id=${data['RESOURCE ID']}&_id=${data['ITEM ID']}`;

        if (index.itemTitleField.trim() !== '')
            urlLink += `&itemTitle=${encodeURIComponent(index.itemTitleField)}`;

        // Display an Order Online button
        extraInfo += `</ul><form class="form form-button order-form" action="https://test.smartservice.qld.gov.au/services/prodi/addProduct" method="post">
      <fieldset>
        <legend> <span class="h2">Copy type</span> <small class="hint relevance visuallyhidden">(If you chose &#x2018;Yes&#x2019; above)</small> </legend>
        <ol class="questions">
          <li>
            <fieldset>
              <legend> <span class="label">Preferred copy type</span> <abbr title="(required)" class="required">*</abbr> <small class="hint">Would you like to receive a copy by email or a physical copy? Please note: Depending on what you request, the Email option is best, however if the number of items is high we may need to send a physical copy instead.</small> </legend>
              <ul class="choices compact">
                <li>
                  <input type="radio" name="preferred-copy-type" value="Email" required id="preferred-copy-type-email" ng-model="vm.selectedCopyType" ng-change="vm.changeOrderType()" />
                  <label for="preferred-copy-type-email">Email</label>
                </li>
                <li>
                  <input type="radio" name="preferred-copy-type" value="Physical copy" required id="preferred-copy-type-physical-copy" ng-model="vm.selectedCopyType" ng-change="vm.changeOrderType()"" />
                  <label for="preferred-copy-type-physical-copy">Physical copy</label>
                </li>
              </ul>
            </fieldset>
          </li>
          <li ng-show="vm.validateCopyOption()">
            <fieldset>
              <legend> <span class="label">Physical copy options</span> <small class="hint relevance visuallyhidden">(If you chose &#x2018;Physical copy&#x2019; above)</small> <abbr title="(required)" class="required">*</abbr> <small class="hint">Would you like a photocopy, Printed photographic image (from scan) or a digital copy scanned to CD. Not all options are available for all media.</small> </legend>
              <ul class="choices compact">
                <li>
                  <input type="radio" name="physical-copy-options" value="CD" ng-required="vm.validateCopyOption()" id="physical-copy-options-cd" ng-model="vm.selectedCopyOption" ng-change="vm.changeOrderType()" />
                  <label for="physical-copy-options-cd">CD</label>
                </li>
                <li>
                  <input type="radio" name="physical-copy-options" value="USB" ng-required="vm.validateCopyOption()" id="physical-copy-options-usb" ng-model="vm.selectedCopyOption" ng-change="vm.changeOrderType()" />
                  <label for="physical-copy-options-usb">USB</label>
                </li>
                <li>
                  <input type="radio" name="physical-copy-options" value="Printed photographic image" ng-required="vm.validateCopyOption()" id="physical-copy-options-printed-photographic-image" ng-model="vm.selectedCopyOption" ng-change="vm.changeOrderType()" />
                  <label for="physical-copy-options-printed-photographic-image">Printed photographic image</label>
                </li>
                <li>
                  <input type="radio" name="physical-copy-options" value="Photocopy" ng-required="vm.validateCopyOption()" id="physical-copy-options-photocopy" ng-model="vm.selectedCopyOption" ng-change="vm.changeOrderType()" />
                  <label for="physical-copy-options-photocopy">Photocopy</label>
                </li>
              </ul>
            </fieldset>
          </li>
          <li ng-show="(vm.selectedCopyOption === 'CD') || (vm.selectedCopyOption === 'USB')">
           <fieldset id="name1">
             <legend> <span class="label">File type</span> <small class="hint relevance visuallyhidden">(If you chose &#x2018;CD or USB&#x2019; above)</small> </legend>
             <ul class="choices">
               <li>
                 <input type="checkbox" ng-required="vm.validateFileType()" ng-model="vm.selectedFileTypeJpg" name="file-type-jpg" value="JPG" id="file-type-jpg" />
                 <label for="file-type-jpg">JPG</label>
               </li>
               <li>
                 <input type="checkbox" name="file-type-pdf" ng-model="vm.selectedFileTypePdf" value="PDF" id="file-type-pdf" />
                 <label for="file-type-pdf">PDF</label>
               </li>
               <li>
                 <input type="checkbox" name="file-type-tiff" ng-model="vm.selectedFileTypeTiff" value="TIFF" id="file-type-tiff" />
                 <label for="file-type-tiff">TIFF</label>
               </li>
             </ul>
           </fieldset>
          </li>
          <li ng-show="(vm.selectedCopyOption === 'Printed photographic image')">
            <fieldset>
              <legend> <span class="label">Printed photographic image options</span> <small class="hint relevance visuallyhidden">(If you chose ‘Printed photographic image’ above)</small> <abbr title="(required)" class="required">*</abbr> </legend>
              <ul class="choices compact">
                <li>
                  <input type="radio" name="printed-photographic-image-options" value="5x7 (12.5x18cm)" required id="printed-photographic-image-options-5x7-12-5x18cm" ng-required="vm.validateImageOption()" ng-model="vm.selectedImageOption" />
                  <label for="printed-photographic-image-options-5x7-12-5x18cm">5x7 (12.5x18cm)</label>
                </li>
                <li>
                  <input type="radio" name="printed-photographic-image-options" value="8x10 (20x25cm)" required id="printed-photographic-image-options-8x10-20x25cm" ng-required="vm.validateImageOption()" ng-model="vm.selectedImageOption" />
                  <label for="printed-photographic-image-options-8x10-20x25cm">8x10 (20x25cm)</label>
                </li>
              </ul>
            </fieldset>
          </li>
          <li ng-show="(vm.selectedCopyOption === 'Photocopy')">
            <fieldset>
              <legend> <span class="label">Photocopy options</span> <small class="hint relevance visuallyhidden">(If you chose ‘Photocopy’ above)</small> <abbr title="(required)" class="required">*</abbr> </legend>
              <ul class="choices compact">
                <li>
                  <input type="radio" name="photocopy-options" value="Colour" required id="photocopy-options-colour" ng-required="vm.validatePhotocopyOption()" ng-model="vm.selectedPhotocopyOption" />
                  <label for="photocopy-options-colour">Colour</label>
                </li>
                <li>
                  <input type="radio" name="photocopy-options" value="Black and white (Grayscale)" required id="photocopy-options-black-and-white-grayscale" ng-required="vm.validatePhotocopyOption()" ng-model="vm.selectedPhotocopyOption" />
                  <label for="photocopy-options-black-and-white-grayscale">Black and white (Grayscale)</label>
                </li>
              </ul>
            </fieldset>
          </li>
          <li ng-show="(vm.selectedCopyOption === 'CD') || (vm.selectedCopyOption === 'USB')">
            <fieldset>
              <legend> <span class="label">Resolution</span> <small class="hint relevance visuallyhidden">(If you chose ‘CD or USB’ above)</small> <abbr title="(required)" class="required">*</abbr> <small class="hint">Standard resolution is 300ppi (pixels per inch)</small> </legend>
              <ul class="choices compact">
                <li>
                  <input type="radio" name="resolution" value="Standard" ng-required="vm.validateResolution()" id="resolution-standard" ng-model="vm.selectedResolution" />
                  <label for="resolution-standard">Standard</label>
                </li>
                <li>
                  <input type="radio" name="resolution" value="Other" ng-required="vm.validateResolution()" id="resolution-other" ng-model="vm.selectedResolution" />
                  <label for="resolution-other">Other</label>
                </li>
              </ul>
            </fieldset>
            <fieldset ng-show="vm.selectedResolution === 'Other'">
              <legend> <span class="label">Other resolution</span> <small class="hint relevance visuallyhidden">(If you chose ‘Other’ above)</small> <abbr title="(required)" class="required">*</abbr> <small class="hint">Only required if you prefer a resolution other than standard 300ppi (pixels per inch)</small> </legend>
              <input type="text" name="other-resolution" size="20" ng-required="vm.selectedResolution === 'Other'" id="other-resolution" />
            </fieldset>
          </li>
        </ol>
      </fieldset>
      <fieldset>
        Quantity: <input type="text" name="quantity" value="1" id="quantity" size="2" ng-change="vm.changeOrderType()" ng-model="vm.quantity" />
      </fieldset>
      <fieldset ng-show="vm.price !== ''">
        Price: <span ng-bind="vm.price"></span>
      </fieldset>

      <input type="hidden" name="attribute1" value="" ng-model="vm.attribute1" />
      <input type="hidden" name="attribute2" value="" ng-model="vm.attribute2" />
      <input type="hidden" name="attribute3" value="${attribute3}" />
      <input type="hidden" class="productId" name="productId" ng-value="vm.productId" />
      <input type="hidden" name="redirectUrl" value="${redirectUrl}" />
      <input type="hidden" name="cartId" value="` + SSQ.cart.id + `" />
      <input type="submit" value="Add To Cart" id="add-to-cart" ng-disabled="vm.validateAddToCart()" ng-click="vm.addToCart($event)" />
<!--                            <a href=${urlLink}><button class="qsa-button">Order Online</button></a> -->
                           </form></td></tr>`;

        return extraInfo;
    }

    renderTable(index, columns, data, drawCallback, preClickCallback, postRender) {
        if (!(this.tableId && typeof this.tableId === 'string' && this.tableId.length > 0)) {
            console.error('Datatable Id is not defined');
            return false;
        }

        if (angular.element(`#${this.tableId}`)[0] && angular.element(`#${this.tableId}`)[0].tagName !== 'TABLE') {
            console.error(`Element #${this.tableId} is not a TABLE`);
            return false;
        }

        this.datatable = angular.element(`#${this.tableId}`).DataTable({
            destroy: true,
            data: data,
            bSortClasses: false,
            bInfo: true,
            scrollX: true,
            dom: '<"top"<l>if>rt<"bottom"p><"clear">',
            createdRow: (row) => {
                angular.element(row).addClass('summary');
            },
            columns: columns,
            language: {
                emptyTable: `<p>No results were found.</p>
                             <p>You can try alternative spellings, read more about <a href="/recreation/arts/heritage/archives/starting/research/">researching archives</a>, 
                             download and browse the <a href="${index.noResultLink}">full index</a>,
                             or try searching our entire <a href="http://www.archivessearch.qld.gov.au/Search/BasicSearch.aspx">catalogue</a>.</p>`,
                search: 'Refine search:'
            },
            order: [
                [1, 'asc']
            ],
            drawCallback: (settings) => {
                if (drawCallback) drawCallback(settings.iDraw);
            }
        });

        angular.element(`#${this.tableId} tbody`).unbind('click');

        // Display/Hide extra information when click the row
        angular.element(`#${this.tableId} tbody`).on('click', 'td', (event) => {
            let tr = angular.element(event.target).closest('tr');
            let row = this.datatable.row(tr);

            if (angular.element(tr).hasClass('detailedInfoRow'))
                return;

            angular.forEach(angular.element(`#${this.tableId} tbody tr`), function(trTmp, key){
                if (angular.element(trTmp).hasClass('detailedInfoRow')) {
                    angular.element(trTmp).remove();
                } else {
                    angular.element(trTmp).removeClass('shown');
                }
            });
            if (preClickCallback) preClickCallback();

            if (angular.element(tr).next().hasClass('detailedInfoRow')) {
                angular.element(tr).next().remove();
                tr.removeClass('shown');
            } else {
                let extraInfo = this.formatExtraInfo(index, row.node(), row.data());
                angular.element(tr).injector().invoke(function($compile) {
                    let scope = angular.element(tr).scope();
                    angular.element(row.node()).after($compile(extraInfo)(scope));
                    scope.$digest();
                    if (postRender) postRender();
                    tr.addClass('shown');
                });
            }
        });

        // Hide extra information on table redrawn
        angular.element(`#${this.tableId}`).on('draw.dt', () => {
            let rows = angular.element('tr.shown');
            rows.map((row) => {
                angular.element(rows[row]).removeClass('shown');
            });
        });

        return true;
    }

    destroy() {
        if (this.datatable) {
            this.datatable.destroy();
            angular.element(`#${this.tableId}`).empty();
        }
    }

    $get() {
        return this;
    }
}

DataTablesProvider.$inject = [];

export default angular.module('providers.datatables', [])
    .provider('DataTablesProvider', DataTablesProvider)
    .name;
