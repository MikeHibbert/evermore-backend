const axios = require('axios');

exports.detail = async function(req, res, next) {
    try {
        const query = {
            query: `query {
            transactions(
              ids: ["${req.params.tx_id}"]
            ) {
              pageInfo {
                hasNextPage
              }
              edges {
                cursor
                node {
                  owner {
                    address
                  }
                  id
                  tags {
                      name
                      value
                  }
                  data {
                    size
                  }
                  block {
                    timestamp
                  }
                }
              }
            }
          }`,
        };
  
        const response = await axios.post('https://arweave.net/graphql', query);
        const { data } = response.data;
        const { transactions } = data;
  
        const edge = transactions.edges[0];

        for(let i in edge.tags) {
            const tag = edge.tags[i]
            edge[tag.name] = tag.value;
        }

        console.log(edge)

        res.render('nfts/detail', {nft: {id: edge.id, name: edge.name, description: edge.description}});
    } catch (err) {
        
        console.log (err);
        return null;
    }
}
