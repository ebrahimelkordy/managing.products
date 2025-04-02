let customerName = document.getElementById('customerName');
let customerEmail = document.getElementById('customerEmail');
let customerPhone = document.getElementById('customerPhone');
let addCustomer = document.getElementById('addCustomer');
let customerData = JSON.parse(localStorage.getItem('customers')) || [];

function displayCustomers() {
    let table = '';
    customerData.forEach((customer, index) => {
        table += `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>
                    <button onclick="deleteCustomer(${index})">Delete</button>
                    <button onclick="viewCustomerAccount(${index})">View Account</button>
                </td>
            </tr>`;
    });
    document.getElementById('customerBody').innerHTML = table || '<tr><td colspan="4">No customers found</td></tr>';
}

function updateCustomerDropdown() {
    let customerSelect = document.getElementById('customerSelect');
    if (customerSelect) {
        let customers = JSON.parse(localStorage.getItem('customers')) || [];
        customerSelect.innerHTML = '<option value="">Select Customer</option>';
        customers.forEach((customer, index) => {
            customerSelect.innerHTML += `<option value="${index}">${customer.name}</option>`;
        });
    }
}

addCustomer.addEventListener('click', () => {
    if (!customerName.value.trim() || !customerEmail.value.trim() || !customerPhone.value.trim()) {
        alert('All fields are required!');
        return;
    }

    customerData.push({
        name: customerName.value.trim(),
        email: customerEmail.value.trim(),
        phone: customerPhone.value.trim()
    });

    localStorage.setItem('customers', JSON.stringify(customerData));
    customerName.value = '';
    customerEmail.value = '';
    customerPhone.value = '';
    displayCustomers();
    updateCustomerDropdown();
});

function deleteCustomer(index) {
    if (confirm('Are you sure you want to delete this customer?')) {
        customerData.splice(index, 1);
        localStorage.setItem('customers', JSON.stringify(customerData));
        displayCustomers();
        updateCustomerDropdown();
    }
}

function deleteAllCustomers() {
    if (confirm('Are you sure you want to delete all customers?')) {
        customerData = [];
        localStorage.setItem('customers', JSON.stringify(customerData));
        displayCustomers();
        updateCustomerDropdown();
    }
}

function viewCustomerAccount(index) {
    alert(`Viewing account for customer: ${customerData[index].name}`);
}

displayCustomers();
updateCustomerDropdown();
