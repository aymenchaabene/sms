import React, {useState, useEffect, useCallback} from "react";
import MaterialTable, { MTableToolbar } from '@material-table/core';
import axios from "axios";
import moment from "moment/moment";
import {Button, Grid, Paper, TextField, Typography} from "@material-ui/core";


function App() {

    const baseUrl = 'http://localhost:3001';

    // add state for material ui table colums
    const [columns] = useState([
        { title: 'City', field: 'city' },
        { title: 'Start date', field: 'start_date', type: 'date', dateSetting: { locale: "de-DE"}, render: rowData =>
                <>
                    {moment(rowData.start_date, 'MM/DD/YYYY').format('DD.MM.YYYY')}
                </>
        },
        { title: 'End date', field: 'end_date', type: 'date', dateSetting: { locale: "de-DE"}, render: rowData =>
                <>
                    {moment(rowData.start_date, 'MM/DD/YYYY').format('DD.MM.YYYY')}
                </>
        },
        { title: 'Price', field: 'price' },
        { title: 'Status', field: 'status' },
        { title: 'Color', field: 'color', render: rowData =>
                <svg width="20" height="20">
                    <rect width="20" height="20" style={{fill: rowData.color, strokeWidth: 3}} />
                </svg>
        },
    ]);

    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState();   /* add state for starting date range filtering */
    const [endDate, setEndDate] = useState();    /* add state for ending date range filtering */

    const getAllOperations = useCallback(() => {
        axios.get(baseUrl + '/operations').then((response) => {
            setData(response.data);
        });
    }, []);

    useEffect(() => {
        getAllOperations();
    }, [getAllOperations]);

    const FilterByDateRange = () => {
        return (
            <>
                <Grid alignItems="center" container justify="center">
                    <Grid item xs={12} sm={6} md={4} lg={4}>
                        <Paper
                            elevation={3}
                            style={{
                                margin: "10px auto",
                                textAlign: "center",
                                padding: "10px",
                            }}
                        >
                            <Typography> Search by Date Range </Typography>
                            <TextField
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                type="date"
                                id="date"
                                label='Start Date'
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                style={{ margin: "10px" }}
                            />
                            <TextField
                                value={endDate}
                                label='End Date'
                                onChange={(e) => setEndDate(e.target.value)}
                                type="date"
                                id="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                style={{ margin: "10px" }}
                            />
                            <div>
                                <Button
                                    onClick={() => {
                                        setStartDate("");
                                        setEndDate("");
                                    }}
                                    variant="contained"
                                    color="primary"
                                >
                                    Clear
                                </Button>
                            </div>
                        </Paper>
                    </Grid>
                </Grid>
            </>
        );
    };

    /* function to determine the data to be rendered to the table */
    const filteredData = () => {
        let filteredArray = [];
        if (startDate && endDate) {
            data.map((item) =>
                item.start_date >= startDate && item.end_date <= endDate ? filteredArray?.push(item) : null
            );
        } else {
            filteredArray = data;
        }

        return filteredArray;
    };

    return (
        <MaterialTable
            title="SMS Operations Table"
            columns={columns}
            data={filteredData()}
            options={{
                search: true
            }}
            components={{
                Toolbar: (props) => (
                    <>
                        <MTableToolbar {...props} />
                        <FilterByDateRange />
                    </>
                ),
            }}
            editable={{
                onRowAdd: newData =>
                    axios.post(baseUrl + '/create', newData).then((response) => {
                        console.log(response);
                        setData([...data, newData])
                    }),
                onRowUpdate: (newData, oldData) =>
                    axios.put(baseUrl + '/update/', newData).then((response) => {
                        console.log(response);
                        const elementIndex = data.findIndex((e) => e.id === newData.id);
                        setData([
                            ...data.slice(0, elementIndex),
                            newData,
                            ...data.slice(elementIndex + 1),
                        ]);
                    }),
                onRowDelete: oldData =>
                    axios.delete(baseUrl + '/delete/' + oldData.tableData.id).then((response) => {
                        console.log(response);
                        const elementIndex = data.findIndex((e) => e.id === oldData.tableData.id);
                        setData([
                                        ...data.slice(0, elementIndex),
                                        ...data.slice(elementIndex + 1),
                        ]);
                    }),
            }}
        />
    )
}

export default App;