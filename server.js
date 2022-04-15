const bodyParser = require('body-parser');
const express = require("express");
const app = express();
const axios = require('axios');
const cors = require("cors");
const parse = require('parse-link-header');
const utils = require("./utils")
require("dotenv").config({ path: "./config.env" });


const corsOptions = {
    origin: '*',
    "Access-Control-Allow-Origin": '*',
};

const requestHeaders = {
    Accept: 'application/json',
    Authorization: process.env.PRIVATE
};

const options = { headers: requestHeaders };


app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());


async function fetchPagination(issueType, linkToken, page) {
    try {

        const requestURL = utils.fintocURL(issueType, linkToken, page);
        return axios.get(requestURL, options)
            .then(response =>
                parse(response.headers.link)
            );

    } catch (error) {
        console.log(error);
    }
};


async function requestHistoricalData(listOfURLs) {
    try {

        return axios.all(listOfURLs.map((request) =>
            axios.get(request, options)))
            .then(
                (response) => {
                    var parsed = [];
                    response.map(r => {
                        r.data.map(individual => parsed.push(individual));
                    });
                    return parsed;
                }
            );

    } catch (error) {
        console.log(error);
    }
};


app.get('/api/link_token/', async (req, res) => {
    const issueType = req.query.issued_type;
    const link_token = req.query.link_token;

    try {
        // Fetch first page.
        const headers = await fetchPagination(issueType, link_token, 1);

        // Structure list of petitions from first to last page.
        const petitionsList = utils.structurePetitions(headers);

        // Request all pages at once.
        const historicalData = await requestHistoricalData(petitionsList);

        // Parse & return tax periods.
        const taxPeriods = utils.returnTaxPeriods(historicalData);

        return res.send(taxPeriods);

    } catch (error) {

        res.send(error)
    }
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});


