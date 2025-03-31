document.addEventListener('DOMContentLoaded', () => {
    const products = [
        { type: 'fruit', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'fruit', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'fruit', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'fruit', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'fruit', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'vegetable', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'vegetable', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'vegetable', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'vegetable', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'vegetable', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'herb', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'herb', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'herb', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'herb', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'herb', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'flower', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'flower', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'flower', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'flower', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
        { type: 'flower', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: '' },
    ];
    const productGrid = document.getElementById('product-grid');
    const groupedProducts = products.reduce((acc, product) => {
        if (!acc[product.type]) acc[product.type] = [];
        acc[product.type].push(product);
        return acc;
    }, {});
    for (const [type, items] of Object.entries(groupedProducts)) {
        const section = document.createElement('div');
        section.classList.add('product-section')
        section.innerHTML = `<h3>${type.charAr(0).toUpperCase() + type.slice(1)}</h3>`;
        items.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-item');
            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <p>Price: $${product.price}</p>
                <p>Zone: ${product.zone}</p>
                <p>Experience: ${product.experience}</p>
                <p>Space: ${product.space}</p>
                <a href="#" class="btn2">Add to your next order?</a>
            `;
            section.appendChild(productDiv);
        });
        productGrid.appendChild(section);
    }
});

// product copy string (- {type: '', name: '', desciption: '', image: '', price: '', zone: '', experience: '', space: ''}, -)