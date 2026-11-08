let medicines = JSON.parse(
    localStorage.getItem("medicines") || "[]"
);

let sales = JSON.parse(
    localStorage.getItem("sales") || "[]"
);

// Save data
function saveData() {
    localStorage.setItem("medicines", JSON.stringify(medicines));
    localStorage.setItem("sales", JSON.stringify(sales));
}

// Add medicine
document.getElementById("medicineForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    let name = document.getElementById("name").value.trim();
    let category = document.getElementById("category").value.trim();
    let price = Number(document.getElementById("price").value);
    let quantity = Number(document.getElementById("quantity").value);
    let expiry = document.getElementById("expiry").value;

    if (price <= 0 || quantity < 0) {
        alert("Enter valid price and quantity");
        return;
    }

    if (medicines.some(m => m.name.toLowerCase() === name.toLowerCase())) {
        alert("Medicine already exists!");
        return;
    }

    medicines.push({
        id: Date.now(),
        name,
        category,
        price,
        quantity,
        expiry
    });

    saveData();
    this.reset();
    displayMedicines();
});

// Display medicines
function displayMedicines() {

    let list = document.getElementById("medicineList");
    let search = document.getElementById("search").value.toLowerCase();

    list.innerHTML = "";

    let filtered = medicines.filter(m =>
        m.name.toLowerCase().includes(search) ||
        m.category.toLowerCase().includes(search)
    );

    filtered.forEach(m => {

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(m.name)}</td>
            <td>${escapeHTML(m.category)}</td>
            <td>₹${m.price.toFixed(2)}</td>
            <td>${m.quantity}</td>
            <td>${m.expiry}</td>
            <td>
                <button class="delete-btn"
                    onclick="deleteMedicine(${m.id})">
                    Delete
                </button>
            </td>
        `;

        list.appendChild(row);
    });

    updateDashboard();
    updateSaleOptions();
}

// Prevent HTML injection in medicine names
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[c]);
}

// Delete medicine
function deleteMedicine(id) {

    if (confirm("Are you sure you want to delete this medicine?")) {

        medicines = medicines.filter(m => m.id !== id);

        saveData();
        displayMedicines();
    }
}

// Update dashboard
function updateDashboard() {

    document.getElementById("totalMedicines").innerText =
        medicines.length;

    let stock = medicines.reduce(
        (total, m) => total + Number(m.quantity), 0
    );

    document.getElementById("totalStock").innerText = stock;

    let today = new Date().toLocaleDateString();

    let todayTotal = sales
        .filter(s => s.date === today)
        .reduce((total, s) => total + s.total, 0);

    document.getElementById("totalSales").innerText =
        "₹" + todayTotal.toFixed(2);
}

// Update medicine dropdown
function updateSaleOptions() {

    let select = document.getElementById("saleMedicine");

    select.innerHTML = '<option value="">Select Medicine</option>';

    medicines
        .filter(m => m.quantity > 0 && m.expiry >= getToday())
        .forEach(m => {

            let option = document.createElement("option");

            option.value = m.id;
            option.textContent = m.name + " (Stock: " + m.quantity + ")";

            select.appendChild(option);
        });
}

// Today's date in YYYY-MM-DD format
function getToday() {
    let d = new Date();
    let month = String(d.getMonth() + 1).padStart(2, "0");
    let day = String(d.getDate()).padStart(2, "0");

    return `${d.getFullYear()}-${month}-${day}`;
}

// Sell medicine
document.getElementById("salesForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    let id = Number(document.getElementById("saleMedicine").value);
    let quantity = Number(document.getElementById("saleQuantity").value);

    let medicine = medicines.find(m => m.id === id);
    let message = document.getElementById("message");

    if (!medicine || quantity < 1 || !Number.isInteger(quantity)) {
        message.innerText = "Please enter valid sale details.";
        return;
    }

    if (medicine.expiry < getToday()) {
        message.innerText = "Expired medicine cannot be sold.";
        return;
    }

    if (quantity > medicine.quantity) {
        message.innerText = "Not enough stock available!";
        return;
    }

    medicine.quantity -= quantity;

    let total = medicine.price * quantity;

    let sale = {
        name: medicine.name,
        quantity: quantity,
        total: total,
        date: new Date().toLocaleDateString()
    };

    sales.unshift(sale);

    saveData();
    displayMedicines();
    displaySales();

    message.innerText =
        "Sale successful! Total amount: ₹" + total.toFixed(2);

    this.reset();
});

// Display sales history
function displaySales() {

    let list = document.getElementById("salesList");

    list.innerHTML = "";

    sales.forEach(s => {

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(s.name)}</td>
            <td>${s.quantity}</td>
            <td>₹${s.total.toFixed(2)}</td>
            <td>${escapeHTML(s.date)}</td>
        `;

        list.appendChild(row);
    });
}

// Initial display
displayMedicines();
displaySales();