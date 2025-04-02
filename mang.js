// f clean data
let clear = document.getElementById('clear');
let tmb;
let productName = document.getElementById('name');
let price = document.getElementById('price');
let discount = document.getElementById('discount');
let ads = document.getElementById('ads');
let taxs = document.getElementById('taxs'); // updated to match HTML id
let total = document.getElementById('total');
let quantity = document.getElementById('quantity');
let category = document.getElementById('category');
let description = document.getElementById('description');
let search = document.getElementById('searchbyname');
let searchinpot = document.getElementById("search")
let searchcategory = document.getElementById('searchbycategory')
let creat = document.getElementById('creat');
let mood = 'creat';

let srmood = 'name'
function searchh(id) {
    if (id == "searchbyname") {
        srmood = "name";
        searchinpot.placeholder = "search by name";  // Fixed placeholder property
    } else {
        srmood = "category";
        searchinpot.placeholder = "search by category";
    }
    searchinpot.focus();
    searchinpot.value = '';
    display();
}

// Scroll to the top of the page on refresh
window.onload = function () {
    const cruds = document.getElementById('cruds');
    if (cruds) {
        cruds.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        window.scrollTo(0, 0); // Fallback if #cruds is not found
    }
    display();
};

// تحديث دالة generateTableRow لإزالة الصور
function generateTableRow(product, index) {
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    let customerName = customers[product.customerIndex]?.name || "Unassigned";
    return `
        <tr>
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.discount}</td>
            <td>${product.ads}</td>
            <td>${product.taxs}</td>
            <td>${product.total}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>${customerName}</td>
            <td>
                <button onclick="delet(${index})">delete</button>
                <button onclick="update(${index})">update</button>
            </td>
        </tr>`;
}

// Simplified search function using the common table generator
function searchpoint(value) {
    value = value.trim().toLowerCase();
    let table = '';
    for (let i = 0; i < data.length; i++) {
        if ((srmood === "name" && data[i].name.toLowerCase().includes(value)) ||
            (srmood === "category" && data[i].category.toLowerCase().includes(value))) {
            table += generateTableRow(data[i], i);
        }
    }
    document.getElementById('tbody').innerHTML = table || '<tr><td colspan="10">No results found</td></tr>';
}

// Improved validation function
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

// Improved total calculation
function gettotal() {
    if (price.value !== "") {
        const priceVal = parseFloat(price.value) || 0;
        const adsVal = parseFloat(ads.value) || 0;
        const taxsVal = parseFloat(taxs.value) || 0;
        const discountVal = parseFloat(discount.value) || 0;

        let totalprice = priceVal + adsVal + taxsVal - discountVal;
        totalprice = Math.max(0, totalprice); // Ensure total is not negative
        total.innerText = "Total Price: " + totalprice.toFixed(2);
    } else {
        total.innerText = "";
    }
}

let data;
if (localStorage.products != null) {
    data = JSON.parse(localStorage.products);
} else {
    data = []; // Ensure the data array is initialized
}

// Improved create/update function
creat.addEventListener('click', function () {
    if (!validateInputs()) return;

    let product = {
        name: productName.value.trim(),
        price: parseFloat(price.value),
        discount: parseFloat(discount.value) || 0,
        ads: parseFloat(ads.value) || 0,
        taxs: parseFloat(taxs.value) || 0,
        total: parseFloat(total.innerText.replace("Total Price: ", "")) || 0,
        quantity: parseInt(quantity.value) || 1, // Keep the entered quantity
        category: category.value.trim(),
        customerIndex: null
    };

    if (mood === 'creat') {
        let existingProduct = data.find(p => p.name === product.name && p.category === product.category && p.customerIndex === null);

        if (existingProduct) {
            if (confirm("Do you want to add the new quantity with the same price as the existing product?")) {
                product.price = existingProduct.price; // Use the existing product's price
                product.total = (existingProduct.price + (existingProduct.ads || 0) + (existingProduct.taxs || 0) - (existingProduct.discount || 0)) * product.quantity;
            }
            existingProduct.quantity += product.quantity; // Add new quantity to existing product
        } else {
            data.push(product); // Add new product to the array
        }
    } else {
        if (tmb !== undefined && tmb >= 0 && tmb < data.length) {
            product.quantity = data[tmb].quantity; // Preserve the original quantity
            data[tmb] = product;
            mood = 'creat';
            creat.innerHTML = "add";
            quantity.style.display = 'block';
        }
    }

    localStorage.setItem('products', JSON.stringify(data)); // Save updated data to localStorage
    clearInputs();
    display(); // Refresh the table to show the new product
});

// Function to clear input fields
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

// Deduct product quantity from stock when assigning to a customer
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

    // Create a new product entry for the customer
    let customerProduct = { ...product, quantity, customerIndex };
    data.push(customerProduct);

    if (product.quantity === 0) {
        data.splice(productIndex, 1); // Remove product from stock if quantity is zero
    }

    localStorage.setItem('products', JSON.stringify(data));
    display();
    showToast("Product assigned to customer successfully!");
}

// Function to display available stock for a product
function showAvailableStock(productIndex) {
    const product = data[productIndex];
    alert(`Available stock for "${product.name}": ${product.quantity}`);
}

// Update product quantity directly from the table
function updateProductQuantity(index, newQuantity) {
    if (newQuantity < 0) {
        alert("Quantity cannot be negative!");
        return;
    }

    data[index].quantity = newQuantity;

    if (newQuantity === 0) {
        data.splice(index, 1); // Remove product if quantity is zero
    }

    localStorage.setItem('products', JSON.stringify(data));
    display();
    showToast("Product quantity updated successfully!");
}

// Add loading indicator
function showLoading() {
    let loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = 'Loading...';
    document.body.appendChild(loader);
    setTimeout(() => loader.remove(), 500);
}

// Add count of products
function showCount() {
    let count = document.getElementById('count');
    if (!count) {
        count = document.createElement('div');
        count.id = 'count';
        document.getElementById('tbody').before(count);
    }
    count.innerHTML = `Total Products: ${data.length}`;
}

// Add sort functionality 
function sortData(column) {
    data.sort((a, b) => {
        if (column === 'price' || column === 'total') {
            return parseFloat(a[column]) - parseFloat(b[column]);
        }
        return a[column].localeCompare(b[column]);
    });
    display();
}

// Optimized display function
function display() {
    let table = "";
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = ""; // Clear existing content

    data.forEach((product, i) => {
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

    tbody.innerHTML = table || '<tr><td colspan="10">No products found</td></tr>';
    showCount();
}

// Initial display of data
display();

function delet(i) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    if (i >= 0 && i < data.length) {
        data.splice(i, 1);
        localStorage.setItem('products', JSON.stringify(data));
        display();
        showToast("Product deleted successfully!", "error");
    }
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
    }
}

// Improved update function
function update(i) {
    if (i < 0 || i >= data.length) {
        alert('Invalid product index');
        return;
    }

    // تحديث mood قبل أي شيء آخر
    mood = 'update';
    tmb = i;
    const product = data[i];

    // تحديث الحقول بالقيم الصحيحة
    productName.value = product.name;
    price.value = product.price;
    discount.value = product.discount;
    ads.value = product.ads;
    taxs.value = product.taxs;
    category.value = product.category;

    gettotal(); // تحديث الإجمالي

    // إخفاء حقل الكمية وتغيير نص الزر
    quantity.style.display = 'none';
    creat.innerHTML = 'Update';

    // التمرير إلى أعلى الصفحة
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Function to export data to CSV
function exportToCSV() {
    if (data.length === 0) {
        alert("No data to export");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Price,Discount,Ads,Taxs,Total,Category,Quantity,Customer\n";
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    data.forEach(product => {
        let customerName = customers[product.customerIndex]?.name || "Unassigned";
        csvContent += `${product.name},${product.price},${product.discount},${product.ads},${product.taxs},${product.total},${product.category},${product.quantity},${customerName}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to show toast notifications
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}