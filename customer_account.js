const urlParams = new URLSearchParams(window.location.search);
const customerIndex = parseInt(urlParams.get('customerIndex'), 10);

const customers = JSON.parse(localStorage.getItem('customers')) || [];
const products = JSON.parse(localStorage.getItem('products')) || [];

if (isNaN(customerIndex) || customerIndex < 0 || customerIndex >= customers.length) {
    alert('Invalid customer index');
    window.location.href = 'customers.html';
}

const customer = customers[customerIndex];
document.getElementById('customerName').innerText = `Name: ${customer.name}`;
document.getElementById('customerEmail').innerText = `Email: ${customer.email}`;
document.getElementById('customerPhone').innerText = `Phone: ${customer.phone}`;

function displayCustomerProducts() {
    const customerProducts = products.filter(product => product.customerIndex === customerIndex);
    let table = '';
    customerProducts.forEach(product => {
        table += `
            <tr>
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.discount}</td>
                <td>${product.ads}</td>
                <td>${product.taxs}</td>
                <td>${product.total}</td>
                <td>${product.category}</td>
            </tr>`;
    });
    document.getElementById('customerProductsBody').innerHTML = table || '<tr><td colspan="7">No products found</td></tr>';
}

function printAccount() {
    window.print();
}

displayCustomerProducts();
