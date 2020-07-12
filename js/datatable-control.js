function initTable() {

    var table = jQuery('#sample');

    /* Fixed header extension: http://datatables.net/extensions/keytable/ */

    var oTable = table.dataTable({
        "order": [
            [0, 'asc']
        ],
        "lengthMenu": [
            [5, 15, 20, -1],
            [5, 15, 20, "All"] // change per page values here
        ],
        "pageLength": 1, // set the initial value,
        "columnDefs": [{  // set default column settings
            'orderable': false,
            'targets': [0]
        }, {
            "searchable": false,
            "targets": [0]
        }],
        "order": [
            [1, "asc"]
        ]
    });

    var oTableColReorder = new $.fn.dataTable.ColReorder(oTable);

    var tableWrapper = jQuery('#sample_6_wrapper'); // datatable creates the table wrapper by adding with id {your_table_jd}_wrapper
    tableWrapper.find('.dataTables_length select').select2(); // initialize select2 dropdown
}


// Table Init
initTable();