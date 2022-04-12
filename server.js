
const bodyParser = require('body-parser');
const express = require("express");
const app = express();
const axios = require('axios');
const cors = require("cors");
const parse = require('parse-link-header');
const utils = require("./utils")

const corsOptions = {
    origin: '*',
    "Access-Control-Allow-Origin": '*',
};

const requestHeaders = { 
    Accept: 'application/json', 
    Authorization: 'sk_live_DWeF3Tfp2YCsVQoB3a-MPYAuz8JMLsb6' 
};

const options = { headers: requestHeaders }; 


app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());


async function fetchHeaders(issueType, linkToken, page) {
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

        return axios.all(listOfURLs.map((endpoint) =>
            axios.get(endpoint, options))).then(
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


async function parseTaxPeriods(token, issueType) {

    const headers = await fetchHeaders(issueType, token, 1);
    const petitionsList = utils.structurePetitions(headers);
    const historicalData = await requestHistoricalData(petitionsList);
    const taxPeriods = utils.returnTaxPeriods(historicalData);

    return { taxPeriods }
}


app.get('/api/link_token/', async (req, res) => {
    const link_token = req.query.link_token;
    const issueType = req.query.issued_type;

    try {
        const summary = await parseTaxPeriods(link_token, issueType);
        return res.send(summary);
    } catch (error) {
        console.log(error);
    }
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});


