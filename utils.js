function fintocURL(issueType, linkToken, page) {
    const lt = "link_token=" + linkToken;
    const it = "&issue_type=" + issueType;
    const pg = "&page=" + String(page);
    return 'https://api.fintoc.com/v1/invoices?' + lt + it  + pg;

};


function structurePetitions(pagesObject) {
    const last = pagesObject.last;
    const issuedType = last.issue_type;
    const link_token = last.link_token;
    var r = [];
    for (var i = 1; i < Number(last.page) + 1; i++) {
        r.push(
            fintocURL(issuedType, link_token, i)
        );
    };
    return r;
};

function returnTaxPeriods(historical){
    var uniquePeriods = [];
    historical.map( invoice =>{
        const month = invoice.tax_period;
        !uniquePeriods.includes(month) && uniquePeriods.push(month);
    })
    return uniquePeriods;
};


module.exports = {
    fintocURL,
    structurePetitions,
    returnTaxPeriods
}