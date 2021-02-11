const pornhub = require('@justalk/pornhub-api')

async function ph() {
    const video =  pornhub.page(url, ['title','pornstars','download_urls']);
    console.log(video)
}

ph()

