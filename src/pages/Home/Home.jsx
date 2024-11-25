import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useLoaderData, useSearchParams } from 'react-router-dom';

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';

const columnHelper = createColumnHelper();

const columns = [
    columnHelper.accessor('name', {
        header: 'Full Name',
    }),
    columnHelper.accessor('email', {
        header: 'Email Address',
    }),
    columnHelper.accessor('age', {
        header: 'Age',
    })
]

// A debounced input react component
function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value);
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value])

    return (
        <TextField {...props} value={value} onChange={e => setValue(e.target.value)}>
        </TextField>
    )
}

const Home = () => {
    const users = useLoaderData();
    const [sorting, setSorting] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });
    const [columnFilters, setColumnFilters] = useState([]);
    const table = useReactTable({
        data: users.data,
        columns,
        state: {
            sorting,
            pagination,
            columnFilters
        },
        manualSorting: true,
        sortDescFirst: false,
        pageCount: users.totalCount / users.count,
        manualPagination: true,
        manualFiltering: true,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
    });

    //column filtering
    useEffect(() => {
        if (columnFilters.length > 0) {
            if(sorting.length > 0){
                const { id, desc } = sorting[0];
                setSearchParams({
                    sort: `${id}:${desc ? 'desc' : 'asc'}`,
                    search: columnFilters.map((el) => `${el.id}:${el.value}`).join(','),
                    page: table.getState().pagination.pageIndex + 1,
                    limit: table.getState().pagination.pageSize,
                })
            }
            else {
                setSearchParams(() => {
                    const newParams = Object.fromEntries(searchParams);
                    delete newParams.sort;
                    newParams.search = columnFilters.map((el) => `${el.id}:${el.value}`).join(',');
                    newParams.page = table.getState().pagination.pageIndex + 1;
                    newParams.limit = table.getState().pagination.pageSize;

                    return newParams;
                })
            }
            
        }
        else {
            setSearchParams(() => {
                const newParams = Object.fromEntries(searchParams);
                delete newParams.search;
                if(sorting.length > 0){
                    const { id, desc } = sorting[0];
                    newParams.sort = `${id}:${desc ? 'desc' : 'asc'}`;
                    newParams.page = table.getState().pagination.pageIndex + 1;
                    newParams.limit = table.getState().pagination.pageSize;
                }
                else {
                    delete newParams.sort;
                    newParams.page = table.getState().pagination.pageIndex + 1;
                    newParams.limit = table.getState().pagination.pageSize;
                }

                return newParams;
              });
            }
        }
    ,[columnFilters, pagination, sorting]);

    console.log(columnFilters);
    return (
        <div>
            <TableContainer component={Paper}>
                <Stack sx={{ p: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">
                            show items per page
                        </InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={table.getState().pagination.pageSize}
                            label="show items per page"
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                        >
                            {[5, 10, 20, 40, 50, 100, 200, 500].map((el) => (
                                <MenuItem key={el} value={el}>
                                    {el}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
                <Table className='min-w-[650px]' aria-label='simple table'>
                    <TableHead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id} className='bg-green-300'>
                                {
                                    headerGroup.headers.map(header => (
                                        <TableCell key={header.id} className='text-2xl font-bold cursor-pointer hover:bg-green-400'
                                            onClick={header.column.getToggleSortingHandler()}>
                                            <Stack spacing={1}>
                                                <span>
                                                    {' '}
                                                    {
                                                        header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header, header.getContext()
                                                            )
                                                    }
                                                    {
                                                        { "asc": "☝️", "desc": "👇" }[header.column.getIsSorted()]
                                                    }
                                                </span>
                                                <DebouncedInput
                                                    value={header.column.getFilterValue()}
                                                    onChange={(value) =>
                                                        header.column.setFilterValue(value)
                                                    }
                                                    size="small"
                                                    placeholder={`Search By ${flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}....`}
                                                />
                                            </Stack>
                                        </TableCell>
                                    ))
                                }
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {
                                        row.getVisibleCells().map(cell => (
                                            <TableCell key={cell.id}>
                                                {
                                                    flexRender(cell.column.columnDef.cell, cell.getContext())
                                                }
                                            </TableCell>
                                        ))
                                    }
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
                <Stack direction="row" justifyContent={'space-between'} sx={{ p: 3 }}>
                    <Button
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.previousPage()}
                        color="primary"
                        variant="contained"
                    >
                        previous page
                    </Button>
                    <Typography>
                        Page {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                    </Typography>
                    <Button
                        disabled={!table.getCanNextPage()}
                        onClick={() => table.nextPage()}
                        color="primary"
                        variant="contained"
                    >
                        next page
                    </Button>
                </Stack>
            </TableContainer>
        </div>
    );
};

export default Home;