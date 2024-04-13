const { Client } = require("@elastic/elasticsearch");

require("dotenv").config({ path: "../.env/elastic.env" });

// https://www.elastic.co/guide/en/enterprise-search/current/mongodb-start.html

const elasticClient = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID,
  },
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
});



module.exports = elasticClient;