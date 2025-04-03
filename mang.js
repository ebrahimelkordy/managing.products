let clear = document.getElementById('clear');
let tmb;
let productName = document.getElementById('name');
let price = document.getElementById('price');
let discount = document.getElementById('discount');
let ads = document.getElementById('ads');
let taxs = document.getElementById('taxs');
let total = document.getElementById('total');
let quantity = document.getElementById('quantity');
let category = document.getElementById('category');
let search = document.getElementById('searchbyname');
let searchinpot = document.getElementById("search");
let searchcategory = document.getElementById('searchbycategory');
let creat = document.getElementById('creat');
let mood = 'creat';
let srmood = 'name';

function searchh(id) {
    if (id === "searchbyname") {
        srmood = "name";
        searchinpot.placeholder = "search by name";
    } else {
        srmood = "category";
        searchinpot.placeholder = "search by category";
    }
    searchinpot.focus();
    searchinpot.value = '';
    display();
}

function searchpoint(value) {
    value = value.trim().toLowerCase();
    let table = '';
    data.forEach((product, i) => {
        if (
            (srmood === 'name' && product.name.toLowerCase().includes(value)) ||
            (srmood === 'category' && product.category.toLowerCase().includes(value))
        ) {
            let customers = JSON.parse(localStorage.getItem('customers')) || [];
            let customerName = product.customerIndex !== null ? customers[product.customerIndex]?.name || "Unassigned" : "In Stock";
            table += `
            <tr>
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.discount}</td>
                <td>${product.ads}</td>
                <td>${product.taxs}</td>
                <td>${product.total}</td>
                <td>${product.category}</td>
                <td>
                    <input type="number" value="${product.quantity}" onchange="updateProductQuantity(${i}, parseInt(this.value))" />
                </td>
                <td>${customerName}</td>
                <td>${product.timestamp || "N/A"}</td>
                <td>
                    ${product.customerIndex === null ? `
                        <button onclick="showAvailableStock(${i})">Show Stock</button>
                        <div>
                            <select id="customerSelect_${i}">
                                <option value="">Select Customer</option>
                                ${customers.map((customer, index) => `<option value="${index}">${customer.name}</option>`).join('')}
                            </select>
                            <input type="number" id="assignQuantity_${i}" placeholder="Quantity" min="1" />
                            <button onclick="assignProductToCustomer(${i}, parseInt(document.getElementById('customerSelect_${i}').value), parseInt(document.getElementById('assignQuantity_${i}').value))">Assign</button>
                        </div>
                    ` : ""}
                    <button onclick="delet(${i})">delete</button>
                    <button onclick="update(${i})">update</button>
                </td>
            </tr>`;
        }
    });
    document.getElementById('tbody').innerHTML = table || '<tr><td colspan="11">No results found</td></tr>';
}

window.onload = function () {
    const cruds = document.getElementById('cruds');
    if (cruds) {
        cruds.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        window.scrollTo(0, 0);
    }
    display();
};

function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleString();
}

creat.addEventListener('click', function () {
    if (mood === 'update') {
        if (tmb !== undefined && tmb >= 0 && tmb < data.length) {
            let product = {
                name: productName.value.trim(),
                price: parseFloat(price.value),
                discount: parseFloat(discount.value) || 0,
                ads: parseFloat(ads.value) || 0,
                taxs: parseFloat(taxs.value) || 0,
                total: parseFloat(total.innerText.replace("Total Price: ", "")) || 0,
                quantity: parseInt(quantity.value) || 1,
                category: category.value.trim(),
                customerIndex: null,
                timestamp: getCurrentTimestamp()
            };
            data[tmb] = product;
            mood = 'creat';
            creat.innerHTML = "add";
            quantity.style.display = 'block';
            localStorage.setItem('products', JSON.stringify(data));
            clearInputs();
            display();
            showToast("Product updated successfully!", "success");
        }
    } else {
        if (!validateInputs()) return;
        let product = {
            name: productName.value.trim(),
            price: parseFloat(price.value),
            discount: parseFloat(discount.value) || 0,
            ads: parseFloat(ads.value) || 0,
            taxs: parseFloat(taxs.value) || 0,
            total: parseFloat(total.innerText.replace("Total Price: ", "")) || 0,
            quantity: parseInt(quantity.value) || 1,
            category: category.value.trim(),
            customerIndex: null,
            timestamp: getCurrentTimestamp()
        };
        if (mood === 'creat') {
            let existingProduct = data.find(p => p.name === product.name && p.category === product.category && p.customerIndex === null);
            if (existingProduct) {
                if (confirm("Do you want to add the new quantity with the same price as the existing product?")) {
                    product.price = existingProduct.price;
                    product.total = (existingProduct.price + (existingProduct.ads || 0) + (existingProduct.taxs || 0) - (existingProduct.discount || 0)) * product.quantity;
                }
                existingProduct.quantity += product.quantity;
                existingProduct.timestamp = getCurrentTimestamp();
            } else {
                data.push(product);
            }
        } else {
            if (tmb !== undefined && tmb >= 0 && tmb < data.length) {
                product.quantity = data[tmb].quantity;
                product.timestamp = getCurrentTimestamp();
                data[tmb] = product;
                mood = 'creat';
                creat.innerHTML = "add";
                quantity.style.display = 'block';
            }
        }
        localStorage.setItem('products', JSON.stringify(data));
        clearInputs();
        display();
    }
});

function clearInputs() {
    productName.value = "";
    price.value = "";
    discount.value = "";
    ads.value = "";
    taxs.value = "";
    total.innerText = "";
    quantity.value = "";
    category.value = "";
}

function validateInputs() {
    const errors = [];
    if (!productName.value || productName.value.trim().length < 2) {
        errors.push('Product name must be at least 2 characters');
    }
    if (!price.value || isNaN(price.value) || Number(price.value) <= 0) {
        errors.push('Price must be a valid number greater than 0');
    }
    if (!category.value.trim()) {
        errors.push('Category is required');
    }
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return false;
    }
    return true;
}

function gettotal() {
    if (price.value !== "") {
        const priceVal = parseFloat(price.value) || 0;
        const adsVal = parseFloat(ads.value) || 0;
        const taxsVal = parseFloat(taxs.value) || 0;
        const discountVal = parseFloat(discount.value) || 0;
        let totalprice = priceVal + adsVal + taxsVal - discountVal;
        totalprice = Math.max(0, totalprice);
        total.innerText = "Total Price: " + totalprice.toFixed(2);
    } else {
        total.innerText = "";
    }
}

let data;
if (localStorage.products != null) {
    data = JSON.parse(localStorage.products);
} else {
    data = [];

}

function assignProductToCustomer(productIndex, customerIndex, quantity) {
    if (isNaN(customerIndex) || customerIndex < 0 || customerIndex >= JSON.parse(localStorage.getItem('customers')).length) {
        alert("Please select a valid customer.");
        return;
    }
    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }
    let product = data[productIndex];
    if (product.quantity < quantity) {
        alert(`Insufficient stock for product: ${product.name}`);
        return;
    }
    product.quantity -= quantity;
    let customerProduct = { ...product, quantity, customerIndex };
    data.push(customerProduct);
    if (product.quantity === 0) {
        data.splice(productIndex, 1);
    }
    localStorage.setItem('products', JSON.stringify(data));
    display();
    showToast("Product assigned to customer successfully!");
}

function showAvailableStock(productIndex) {
    if (productIndex < 0 || productIndex >= data.length) {
        alert("Invalid product index");
        return;
    }
    const product = data[productIndex];
    if (product.customerIndex !== null) {
        alert(`This product is already assigned to a customer.`);
        return;
    }
    alert(`Available stock for "${product.name}": ${product.quantity}`);
}

function display() {
    let table = "";
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = ""; // Clear existing content

    data.forEach((product, i) => {
        let status = product.customerIndex !== null
            ? `With Customer: ${customers[product.customerIndex]?.name || "Unknown"}`
            : "In Stock";

        table += `
        <tr>
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.discount}</td>
            <td>${product.ads}</td>
            <td>${product.taxs}</td>
            <td>${product.total}</td>
            <td>${product.category}</td>
            <td>
                <input type="number" value="${product.quantity}" onchange="updateProductQuantity(${i}, parseInt(this.value))" />
            </td>
            <td>${status}</td> <!-- New column for stock/customer status -->
            <td>${product.timestamp || "N/A"}</td>
            <td>
                ${product.customerIndex === null ? `
                    <button onclick="showAvailableStock(${i})">Show Stock</button>
                    <div>
                        <select id="customerSelect_${i}">
                            <option value="">Select Customer</option>
                            ${customers.map((customer, index) => `<option value="${index}">${customer.name}</option>`).join('')}
                        </select>
                        <input type="number" id="assignQuantity_${i}" placeholder="Quantity" min="1" />
                        <button onclick="assignProductToCustomer(${i}, parseInt(document.getElementById('customerSelect_${i}').value), parseInt(document.getElementById('assignQuantity_${i}').value))">Assign</button>
                    </div>
                ` : ""}
                <button onclick="delet(${i})">delete</button>
                <button onclick="update(${i})">update</button>
            </td>
        </tr>`;
    });

    tbody.innerHTML = table || '<tr><td colspan="11">No products found</td></tr>';
}

function update(i) {
    if (i < 0 || i >= data.length) {
        alert('Invalid product index');
        return;
    }
    mood = 'update';
    tmb = i;
    const product = data[i];
    productName.value = product.name;
    price.value = product.price;
    discount.value = product.discount;
    ads.value = product.ads;
    taxs.value = product.taxs;
    total.innerText = `Total Price: ${product.total}`;
    category.value = product.category;
    quantity.value = product.quantity;
    creat.innerHTML = 'Update';
    quantity.style.display = 'none';
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function deletall() {
    if (data.length === 0) {
        alert("No data to delete");
        return;
    }
    if (confirm('Are you sure you want to delete all items?')) {
        data = [];
        localStorage.setItem('products', JSON.stringify(data));
        display();
        showToast("All products cleared successfully!", "success");
    }
}

function exportToCSV() {
    if (data.length === 0) {
        alert("No data to export");
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Price,Discount,Ads,Taxs,Total,Category,Quantity,Customer,Timestamp\n";
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    data.forEach(product => {
        let customerName = product.customerIndex !== null ? customers[product.customerIndex]?.name || "Unassigned" : "In Stock";
        csvContent += `${product.name},${product.price},${product.discount},${product.ads},${product.taxs},${product.total},${product.category},${product.quantity},${customerName},${product.timestamp || "N/A"}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}