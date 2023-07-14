// import "datatables.net-dt";
// TODO: Search the npm package equivalent of
// "https://cdn.datatables.net/v/dt/dt-1.10.24/sp-1.2.2/sl-1.3.3/datatables.min.js"
// On language choice, fetch/cache tags
$(document).ready(function () {
    let table
    $('select').on('change', function () {
        const endpoint = this.value
        if (!endpoint) {
            return
        }
        if (table) {
            table.destroy()
        }
        $.getJSON(`/data/${endpoint}`, function (result) {
            const events = $('#events')
            table = $('#table_id').DataTable({
                select: true,
                searchPanes: {
                    cascadePanes: true,
                },
                data: result.tags,
                dom: 'Plfrtip',
                // data: dataSet,
                columns: [{ title: 'Category_1' }, { title: 'Category_2' }, { title: 'Category_3' }],
                columnDefs: [
                    {
                        targets: '_all',
                        searchPanes: {
                            show: true,
                        },
                    },
                ],
            })
            table.on('select', function (e, dt, type, indexes) {
                const rowData = table.rows(indexes).data().toArray()
                events.val(rowData[0][2])
                // events.prepend( rowData[2] );
                $('.next-step').text('Please go back to market page and paste the copied tag')
            })
        })
    })
})
