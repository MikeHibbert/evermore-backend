const axios = require('axios');

function getMediaElement(nft) {
  const contentType = nft['Content-Type'];

  if(nft['Content-Type'].indexOf('image') != -1) {
    return `<img src="/nfts/image/${nft.id}" title="${nft.name}" class="img-fluid" style="object-fit: cover; height: auto; width: auto;"></img>`;
    
  }

  if(nft['Content-Type'].indexOf('video') != -1) {
    let poster = "/nfts/image/c1mNDCo3Mh1PdimUr5OEYyVdbgOowXV2Ct_JN5irnRE";
        
    return `<div class="embed-responsive embed-responsive-16by9" style="object-fit: cover; height: auto; width: auto;" >
            <video preload="auto" controls poster="${poster}">
                <source src="/image/${nft.id}" type=${contentType} />
            </video>
          </div>`;
  }

  if(nft['Content-Type'].indexOf('audio') != -1) {
    return `<div style="text-align: center;">
            <img src="/nfts/image/c1mNDCo3Mh1PdimUr5OEYyVdbgOowXV2Ct_JN5irnRE" title={initialStateTag.name} class="img-fluid" style="object-fit: cover; height: auto; width: auto;"></img>
            <audio preload="auto" controls autoplay >
                <source src="/image/${nft.id}" type=${contentType} />
            </audio>
        </div>`;
  }

  return `<img src="/nfts/image/c1mNDCo3Mh1PdimUr5OEYyVdbgOowXV2Ct_JN5irnRE" title="${nft.name}" class="img-fluid" style="object-fit: cover; height: auto; width: auto;"></img>`
}

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
  
        const node = transactions.edges[0].node;

        let owner = null;
        for(let i in node.tags) {
            const tag = node.tags[i]
            node[tag.name] = tag.value;

            if(tag.name === 'Init-State') {
              node['Init-State'] = JSON.parse(tag.value);

              node['name'] = node['Init-State'].name;
              node['description'] = node['Init-State'].description;

              owner = Object.keys(node['Init-State'].balances).filter(owner => node['Init-State'].balances[owner] == 1)[0];
            }
        }

        const detail_url = `https://www.evermoredata.store/ntfs/nft-detail/${node.id}`;

        let image_url = "/image/c1mNDCo3Mh1PdimUr5OEYyVdbgOowXV2Ct_JN5irnRE";

        if(node['Content-Type'].indexOf('image') != -1) {
          image_url = `/image/${node.id}`;
        }

        const initalState = node['Init-State'];
        const keywords = `nft nfts ${initalState.name} ${initalState.description}`.split(' ');

        const media_embed = getMediaElement(node);

        res.render('nfts/detail', {nft: node, year: new Date().getFullYear(), owner, detail_url, image_url, keywords, media_embed});
    } catch (err) {
        
        console.log (err);
        return null;
    }
}
