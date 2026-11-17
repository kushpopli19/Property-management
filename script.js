// Rentora - Property Rental Management Portal
// Data is stored in the browser using localStorage.

let properties = JSON.parse(localStorage.getItem("rentoraProperties")) || [
    { id: 1, name: "Maple Residency", location: "Sector 45, Gurgaon", type: "Apartment", rent: 18000, status: "Occupied" },
    { id: 2, name: "Palm Heights", location: "Sector 62, Noida", type: "Flat", rent: 22000, status: "Available" },
    { id: 3, name: "Green Villa", location: "DLF Phase 2, Gurgaon", type: "House", rent: 35000, status: "Occupied" }
];

let tenants = JSON.parse(localStorage.getItem("rentoraTenants")) || [
    { id: 1, name: "Aarav Sharma", propertyId: 1, phone: "9876543210", lease: "Jan 2026 - Dec 2026" },
    { id: 2, name: "Riya Mehta", propertyId: 3, phone: "9876501234", lease: "Mar 2026 - Feb 2027" }
];

let requests = JSON.parse(localStorage.getItem("rentoraRequests")) || [
    { id: 1, title: "Bathroom tap repair", propertyId: 1, date: "17 Nov 2026", status: "Pending" },
    { id: 2, title: "Kitchen light replacement", propertyId: 3, date: "14 Nov 2026", status: "Completed" }
];

let nextId = Date.now();
let currentForm = "";
const modalBackdrop = document.getElementById("modalBackdrop");
const modalFields = document.getElementById("modalFields");
const modalForm = document.getElementById("modalForm");

function saveData() {
    localStorage.setItem("rentoraProperties", JSON.stringify(properties));
    localStorage.setItem("rentoraTenants", JSON.stringify(tenants));
    localStorage.setItem("rentoraRequests", JSON.stringify(requests));
}

function propertyName(propertyId) {
    const property = properties.find(item => item.id === propertyId);
    return property ? property.name : "Property removed";
}

function money(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2300);
}

function updateDashboard() {
    document.getElementById("totalProperties").textContent = properties.length;
    document.getElementById("occupiedProperties").textContent = properties.filter(p => p.status === "Occupied").length;
    document.getElementById("availableProperties").textContent = properties.filter(p => p.status === "Available").length;
    document.getElementById("openRequests").textContent = requests.filter(r => r.status === "Pending").length;
    document.getElementById("overviewTenants").textContent = tenants.length;
    document.getElementById("overviewRequests").textContent = requests.length;
    document.getElementById("completedRequests").textContent = requests.filter(r => r.status === "Completed").length;

    const recent = document.getElementById("recentProperties");
    recent.innerHTML = "";
    properties.slice(-4).reverse().forEach(property => {
        recent.innerHTML += `
            <tr>
                <td>${escapeHTML(property.name)}</td>
                <td>${escapeHTML(property.location)}</td>
                <td>${money(property.rent)}</td>
                <td><span class="status-pill status-${property.status.toLowerCase()}">${property.status}</span></td>
            </tr>`;
    });
    document.getElementById("recentEmpty").style.display = properties.length ? "none" : "block";
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
}

function renderProperties() {
    const search = document.getElementById("propertySearch").value.toLowerCase();
    const filter = document.getElementById("propertyFilter").value;
    const table = document.getElementById("propertyTable");
    table.innerHTML = "";

    const filtered = properties.filter(property => {
        const matchesSearch = property.name.toLowerCase().includes(search) || property.location.toLowerCase().includes(search);
        const matchesStatus = filter === "all" || property.status === filter;
        return matchesSearch && matchesStatus;
    });

    filtered.forEach(property => {
        table.innerHTML += `
            <tr>
                <td>${escapeHTML(property.name)}</td>
                <td>${escapeHTML(property.location)}</td>
                <td>${escapeHTML(property.type)}</td>
                <td>${money(property.rent)}</td>
                <td><span class="status-pill status-${property.status.toLowerCase()}">${property.status}</span></td>
                <td><button class="action-button delete" onclick="deleteProperty(${property.id})">Delete</button></td>
            </tr>`;
    });
    document.getElementById("propertyEmpty").style.display = filtered.length ? "none" : "block";
}

function renderTenants() {
    const search = document.getElementById("tenantSearch").value.toLowerCase();
    const table = document.getElementById("tenantTable");
    table.innerHTML = "";

    const filtered = tenants.filter(tenant =>
        tenant.name.toLowerCase().includes(search) || propertyName(tenant.propertyId).toLowerCase().includes(search)
    );

    filtered.forEach(tenant => {
        table.innerHTML += `
            <tr>
                <td>${escapeHTML(tenant.name)}</td>
                <td>${escapeHTML(propertyName(tenant.propertyId))}</td>
                <td>${escapeHTML(tenant.phone)}</td>
                <td>${escapeHTML(tenant.lease)}</td>
                <td><button class="action-button delete" onclick="deleteTenant(${tenant.id})">Remove</button></td>
            </tr>`;
    });
    document.getElementById("tenantEmpty").style.display = filtered.length ? "none" : "block";
}

function renderRequests() {
    const search = document.getElementById("maintenanceSearch").value.toLowerCase();
    const filter = document.getElementById("maintenanceFilter").value;
    const list = document.getElementById("maintenanceList");
    list.innerHTML = "";

    const filtered = requests.filter(request => {
        const matchesSearch = request.title.toLowerCase().includes(search) || propertyName(request.propertyId).toLowerCase().includes(search);
        const matchesStatus = filter === "all" || request.status === filter;
        return matchesSearch && matchesStatus;
    });

    filtered.forEach(request => {
        const action = request.status === "Pending"
            ? `<button class="action-button" onclick="completeRequest(${request.id})">Mark complete</button>`
            : `<span class="status-pill status-completed">Completed</span>`;
        list.innerHTML += `
            <article class="request-card">
                <div class="request-info">
                    <div class="request-icon">⚒</div>
                    <div>
                        <strong>${escapeHTML(request.title)}</strong>
                        <small>${escapeHTML(propertyName(request.propertyId))} · ${escapeHTML(request.date)}</small>
                    </div>
                </div>
                <div class="request-actions">
                    <span class="status-pill status-${request.status.toLowerCase()}">${request.status}</span>
                    ${action}
                    <button class="action-button delete" onclick="deleteRequest(${request.id})">Delete</button>
                </div>
            </article>`;
    });
    document.getElementById("maintenanceEmpty").style.display = filtered.length ? "none" : "block";
}

function refreshPage() {
    saveData();
    updateDashboard();
    renderProperties();
    renderTenants();
    renderRequests();
}

function openModal(title, fields, formType) {
    currentForm = formType;
    document.getElementById("modalTitle").textContent = title;
    modalFields.innerHTML = fields;
    modalBackdrop.classList.add("show");
}

function closeModal() {
    modalBackdrop.classList.remove("show");
    modalForm.reset();
}

function textField(label, name, placeholder, type = "text") {
    return `<div class="form-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" required></div>`;
}

function propertyOptions() {
    return properties.map(property =>
        `<option value="${property.id}">${escapeHTML(property.name)} (${property.status})</option>`
    ).join("");
}

function addPropertyForm() {
    openModal("Add a property", `
        ${textField("Property name", "name", "e.g. Sunrise Apartments")}
        ${textField("Location", "location", "e.g. Sector 21, Gurgaon")}
        <div class="form-field"><label for="type">Property type</label>
            <select id="type" name="type" required>
                <option value="">Select type</option><option>Apartment</option><option>Flat</option><option>House</option><option>Shop</option><option>Studio</option>
            </select>
        </div>
        ${textField("Monthly rent (₹)", "rent", "e.g. 18000", "number")}
        <div class="form-field"><label for="status">Availability</label>
            <select id="status" name="status"><option>Available</option><option>Occupied</option></select>
        </div>`, "property");
}

function addTenantForm() {
    const available = properties.filter(property => property.status === "Available");
    if (!available.length) {
        showToast("Add an available property before adding a tenant.");
        return;
    }
    openModal("Add a tenant", `
        ${textField("Tenant name", "name", "Enter full name")}
        <div class="form-field"><label for="propertyId">Assign property</label><select id="propertyId" name="propertyId" required>${available.map(p => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("")}</select></div>
        ${textField("Contact number", "phone", "10-digit mobile number", "tel")}
        ${textField("Lease period", "lease", "e.g. Jan 2026 - Dec 2026")}`, "tenant");
}

function addRequestForm() {
    if (!properties.length) {
        showToast("Add a property before creating a request.");
        return;
    }
    openModal("New maintenance request", `
        ${textField("Request title", "title", "e.g. Water leakage repair")}
        <div class="form-field"><label for="propertyId">Property</label><select id="propertyId" name="propertyId" required>${properties.map(p => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("")}</select></div>`, "request");
}

modalForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(modalForm);
    const data = Object.fromEntries(formData.entries());

    if (currentForm === "property") {
        if (Number(data.rent) <= 0) {
            showToast("Enter a valid monthly rent.");
            return;
        }
        properties.push({
            id: nextId++, name: data.name.trim(), location: data.location.trim(),
            type: data.type, rent: Number(data.rent), status: data.status
        });
        showToast("Property added successfully.");
    }

    if (currentForm === "tenant") {
        if (!/^[0-9]{10}$/.test(data.phone)) {
            showToast("Enter a valid 10-digit contact number.");
            return;
        }
        const propertyId = Number(data.propertyId);
        tenants.push({
            id: nextId++, name: data.name.trim(), propertyId,
            phone: data.phone, lease: data.lease.trim()
        });
        const property = properties.find(p => p.id === propertyId);
        if (property) property.status = "Occupied";
        showToast("Tenant added and property assigned.");
    }

    if (currentForm === "request") {
        requests.push({
            id: nextId++, title: data.title.trim(), propertyId: Number(data.propertyId),
            date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            status: "Pending"
        });
        showToast("Maintenance request created.");
    }

    closeModal();
    refreshPage();
});

function deleteProperty(id) {
    const hasTenant = tenants.some(tenant => tenant.propertyId === id);
    if (hasTenant) {
        showToast("Remove the tenant before deleting this property.");
        return;
    }
    if (!confirm("Delete this property?")) return;
    properties = properties.filter(property => property.id !== id);
    requests = requests.filter(request => request.propertyId !== id);
    refreshPage();
    showToast("Property deleted.");
}

function deleteTenant(id) {
    if (!confirm("Remove this tenant?")) return;
    const tenant = tenants.find(item => item.id === id);
    tenants = tenants.filter(item => item.id !== id);
    if (tenant) {
        const property = properties.find(item => item.id === tenant.propertyId);
        if (property) property.status = "Available";
    }
    refreshPage();
    showToast("Tenant removed and property marked available.");
}

function completeRequest(id) {
    const request = requests.find(item => item.id === id);
    if (request) request.status = "Completed";
    refreshPage();
    showToast("Request marked as completed.");
}

function deleteRequest(id) {
    if (!confirm("Delete this maintenance request?")) return;
    requests = requests.filter(item => item.id !== id);
    refreshPage();
    showToast("Request deleted.");
}

// Navigation updates the page heading and selected menu item.
document.querySelectorAll(".nav-link, .brand, .welcome-row a").forEach(link => {
    link.addEventListener("click", function() {
        const target = this.getAttribute("href");
        if (target && target.startsWith("#")) {
            document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
            const activeLink = document.querySelector(`.nav-link[href="${target}"]`);
            if (activeLink) activeLink.classList.add("active");
            const title = target.substring(1);
            document.getElementById("pageTitle").textContent = title.charAt(0).toUpperCase() + title.slice(1);
        }
    });
});

document.getElementById("addPropertyBtn").addEventListener("click", addPropertyForm);
document.getElementById("addTenantBtn").addEventListener("click", addTenantForm);
document.getElementById("addRequestBtn").addEventListener("click", addRequestForm);
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", event => {
    if (event.target === modalBackdrop) closeModal();
});

document.getElementById("propertySearch").addEventListener("input", renderProperties);
document.getElementById("propertyFilter").addEventListener("change", renderProperties);
document.getElementById("tenantSearch").addEventListener("input", renderTenants);
document.getElementById("maintenanceSearch").addEventListener("input", renderRequests);
document.getElementById("maintenanceFilter").addEventListener("change", renderRequests);

document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
});

refreshPage();
