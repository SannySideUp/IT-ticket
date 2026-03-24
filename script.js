const ticketForm = document.getElementById("ticketForm");
const ticketList = document.getElementById("ticketList");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const totalTicketsEl = document.getElementById("totalTickets");
const openTicketsEl = document.getElementById("openTickets");
const inProgressTicketsEl = document.getElementById("inProgressTickets");
const resolvedTicketsEl = document.getElementById("resolvedTickets");

let tickets = JSON.parse(localStorage.getItem("supportTickets")) || [];

function saveTickets() {
  localStorage.setItem("supportTickets", JSON.stringify(tickets));
}

function createTicketObject(formData) {
  return {
    id: Date.now().toString(),
    userName: formData.userName.trim(),
    issueTitle: formData.issueTitle.trim(),
    issueCategory: formData.issueCategory,
    priority: formData.priority,
    status: formData.status,
    issueDescription: formData.issueDescription.trim(),
    createdAt: new Date().toLocaleString()
  };
}

function renderStats() {
  totalTicketsEl.textContent = tickets.length;
  openTicketsEl.textContent = tickets.filter(t => t.status === "Open").length;
  inProgressTicketsEl.textContent = tickets.filter(t => t.status === "In Progress").length;
  resolvedTicketsEl.textContent = tickets.filter(t => t.status === "Resolved").length;
}

function getFilteredTickets() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedStatus = statusFilter.value;

  return tickets.filter(ticket => {
    const matchesSearch =
      ticket.userName.toLowerCase().includes(searchTerm) ||
      ticket.issueTitle.toLowerCase().includes(searchTerm) ||
      ticket.issueCategory.toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "All" || ticket.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });
}

function getPriorityClass(priority) {
  return `tag-${priority.toLowerCase()}`;
}

function getStatusClass(status) {
  return `tag-${status.toLowerCase().replace(" ", "-")}`;
}

function renderTickets() {
  const filteredTickets = getFilteredTickets();

  if (filteredTickets.length === 0) {
    ticketList.innerHTML = `
      <div class="empty-state">
        No tickets found. Add a ticket or change your filters.
      </div>
    `;
    renderStats();
    return;
  }

  ticketList.innerHTML = filteredTickets
    .map(ticket => `
      <article class="ticket-card">
        <div class="ticket-top">
          <div>
            <h4>${ticket.issueTitle}</h4>
            <div class="ticket-meta">
              ${ticket.userName} • ${ticket.createdAt}
            </div>
          </div>
        </div>

        <p class="ticket-description">${ticket.issueDescription}</p>

        <div class="ticket-tags">
          <span class="tag tag-category">${ticket.issueCategory}</span>
          <span class="tag ${getPriorityClass(ticket.priority)}">${ticket.priority}</span>
          <span class="tag ${getStatusClass(ticket.status)}">${ticket.status}</span>
        </div>

        <div class="ticket-actions">
          ${
            ticket.status !== "Resolved"
              ? `<button class="action-btn resolve-btn" onclick="markResolved('${ticket.id}')">Mark Resolved</button>`
              : ""
          }
          <button class="action-btn" onclick="toggleInProgress('${ticket.id}')">Toggle In Progress</button>
          <button class="action-btn delete-btn" onclick="deleteTicket('${ticket.id}')">Delete</button>
        </div>
      </article>
    `)
    .join("");

  renderStats();
}

function markResolved(id) {
  tickets = tickets.map(ticket =>
    ticket.id === id ? { ...ticket, status: "Resolved" } : ticket
  );
  saveTickets();
  renderTickets();
}

function toggleInProgress(id) {
  tickets = tickets.map(ticket => {
    if (ticket.id !== id) return ticket;

    if (ticket.status === "Open") {
      return { ...ticket, status: "In Progress" };
    }

    if (ticket.status === "In Progress") {
      return { ...ticket, status: "Open" };
    }

    return ticket;
  });

  saveTickets();
  renderTickets();
}

function deleteTicket(id) {
  tickets = tickets.filter(ticket => ticket.id !== id);
  saveTickets();
  renderTickets();
}

ticketForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = {
    userName: document.getElementById("userName").value,
    issueTitle: document.getElementById("issueTitle").value,
    issueCategory: document.getElementById("issueCategory").value,
    priority: document.getElementById("priority").value,
    status: document.getElementById("status").value,
    issueDescription: document.getElementById("issueDescription").value
  };

  const newTicket = createTicketObject(formData);
  tickets.unshift(newTicket);
  saveTickets();
  renderTickets();
  ticketForm.reset();
  document.getElementById("status").value = "Open";
});

searchInput.addEventListener("input", renderTickets);
statusFilter.addEventListener("change", renderTickets);

renderTickets();
renderStats();
