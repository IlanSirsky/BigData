const bigml = require('bigml');

process.env.BIGML_USERNAME = 'ilan1il1000';
process.env.BIGML_API_KEY = 'c873501d60fe9e2981301d10a3895cf351165ad8';
const apiUsername = process.env.BIGML_USERNAME;
const apiKey = process.env.BIGML_API_KEY;
const BIGML_AUTH = `username=${apiUsername};api_key=${apiKey}`;

const sourcePath = './toppings.csv';

const bigmlClient = new bigml.BigML(apiUsername, apiKey);

const source = new bigml.Source(bigmlClient);

async function getResourceURL() {
    return new Promise((resolve, reject) => {
        source.create(sourcePath, (err, sourceInfo) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("Source created")
                const dataset = new bigml.Dataset(bigmlClient);
                dataset.create(sourceInfo.resource, (err, datasetInfo) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log("Dataset created");
                        association = new bigml.Association(bigmlClient);
                        association.create(datasetInfo.resource, (err, associationInfo) => {
                            if (err) {
                                console.log(err);
                                reject(err);
                            } else {
                                console.log("Model created");
                                console.log('Association info:', associationInfo);

                                resource_uri = associationInfo.location + associationInfo.resource.split('/')[1] + '?' + BIGML_AUTH;
                                console.log(resource_uri);
                                resolve(resource_uri);
                            }
                        });
                    }
                });
            }
        });
    });
}


const getData = async function (url) {
    var data = await fetch(url)
    data = await data.json()
    return data
}

function getAssociations(data) {
    let items = data.associations.items
    let rules = data.associations.rules
    let result = {}
    let i = 0
    for (let rule of rules) {
        let lhs = rule.lhs[0]
        let rhs = rule.rhs[0]
        let lhsItem = items[lhs]
        let rhsItem = items[rhs]
        let confidence = rule.confidence
        let support = rule.support[0]
        let data = {
            Antecedent: lhsItem.name,
            Consequent: rhsItem.name,
            "Support (\%)": (support * 100).toFixed(2),
            "Confidence (\%)": (confidence * 100).toFixed(2)
        }
        result[i] = data
        i++
    }
    return result
}

module.exports = {
    getResourceURL,
    getData,
    getAssociations
}