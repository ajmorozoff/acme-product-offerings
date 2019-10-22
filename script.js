//GLOBAL CONSTANTS
const container = document.getElementById('container');
console.log(container);

//FUNCTION DECLARATIONS
window.addEventListener('hashchange', ev => {
    const id = window.location.hash.slice(1);

    Promise.all([fetchCompanies(), fetchProducts(), fetchOfferings()])
    .then(responses => {
        const [companies, products, offerings] = responses;

        let productList = products;

        if (id.length) {
            productList = products.filter(prod => prod.id === id);
        }

        const processedProducts = processProducts(productList, offerings, companies);
        return processedProducts;
    })
    .then(data => {
        renderPage(data);
    })
    .catch(error => console.log(error));

})

const fetchCompanies = () => new Promise((resolve, reject) => {
    return window.fetch('https://acme-users-api-rev.herokuapp.com/api/companies')
            .then(response => response.json())
            .then(jsonData => resolve(jsonData))
            .catch(e => reject(e));
});

const fetchProducts = () => new Promise((resolve, reject) => {
    return window.fetch('https://acme-users-api-rev.herokuapp.com/api/products')
            .then(response => response.json())
            .then(jsonData => resolve(jsonData))
            .catch(e => reject(e));
});

const fetchOfferings = () => new Promise((resolve, reject) => {
    return window.fetch('https://acme-users-api-rev.herokuapp.com/api/offerings')
            .then(response => response.json())
            .then(jsonData => resolve(jsonData))
            .catch(e => reject(e));
});

const processProducts = (productList, offeringList, companyList) => {
    let processed = [];
    productList.forEach(prod => {
        let _id = prod.id;
        let processedProd = {};
        processedProd.product = prod;
        processedProd.offers = [];
        offeringList.forEach(offer => {
            if (offer.productId === _id) {
                processedProd.offers.push(offer);
            }
        })
        companyList.forEach(company => {
            processedProd.offers.forEach(offer => {
                if (company.id === offer.companyId) {
                    offer.company = company;
                }
            })
        })
        processed.push(processedProd);
    })

    return processed;
}

const renderCard = (product, offers) => {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    let header = document.createElement('div');
    header.classList.add('card-header');
    header.innerHTML = `<h2><a href=#${product.id}>${product.name.toUpperCase()}</a></h2><p>${product.description}</p><p>\$${product.suggestedPrice}</p>`;
    cardDiv.appendChild(header);

    let body = document.createElement('div');
    body.classList.add('card-body');
    let bodyHtml = `<ul>`;
    offers.forEach(offer => {
        bodyHtml += `<li>Offered by: ${offer.company.name} \$${offer.price}</li>`;
    })
    bodyHtml += `</ul>`;
    body.innerHTML = bodyHtml;
    cardDiv.appendChild(body)
    return cardDiv;
}

const renderPage = (processedArr) => {
    container.innerHTML = '';
    processedArr.forEach(prod => {
        const card = renderCard(prod.product, prod.offers);
        container.appendChild(card);
    })
}


//ON PAGE LOAD

Promise.all([fetchCompanies(), fetchProducts(), fetchOfferings()])
    .then(responses => {
        const [companies, products, offerings] = responses;
        console.log('COMPANIES', companies);
        console.log('PRODUCTS', products);
        console.log('OFFERINGS', offerings);
        const processed = processProducts(products, offerings, companies);
        console.log(processed);
        return processed;
    })
    .then(processed => {
        window.location.hash = '#';
        renderPage(processed);
    })
    .catch(error => console.log(error));

