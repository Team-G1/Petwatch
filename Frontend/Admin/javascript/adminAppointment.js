document.addEventListener('DOMContentLoaded', function() {
        // --- configuration ---
        const API_BASE_URL = 'http://localhost:5001/api';
        const tableBody = document.querySelector('.appointments-table tbody');
        const refreshBtn = document.getElementById('refresh-btn');

        // MAIN LOAD FUNCTION
         //Fetches both the list of bookings and the dashboard statistics
         
        async function refreshDashboard() {
            try {
                const [bookingsRes, statsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/admin/bookings`),
                    fetch(`${API_BASE_URL}/admin/stats`)
                ]);

                if (!bookingsRes.ok || !statsRes.ok) throw new Error("Server error");

                const bookings = await bookingsRes.json();
                const stats = await statsRes.json();

                renderStats(stats);
                renderTable(bookings);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
                // Show user-friendly error on UI
            }
        }

        // RENDER STATISTICS CARDS
        
        function renderStats(stats) {
            document.querySelector('.total-appointments h3').textContent = stats.total || 0;
            document.querySelector('.today-appointments h3').textContent = stats.today || 0;
            document.querySelector('.completed-appointments h3').textContent = stats.completed || 0;
            document.querySelector('.cancelled-appointments h3').textContent = stats.cancelled || 0;

            // Render Location Progress Bars
            const locContainer = document.querySelector('.location-stats');
            if (locContainer) {
                locContainer.innerHTML = '';
                stats.locations.forEach(loc => {
                    if(!loc._id) return;
                    const percentage = (loc.count / stats.total) * 100;
                    const locHTML = `
                        <div class="location-stat">
                            <div class="location-info">
                                <span class="location-name">${loc._id}</span>
                                <span class="location-count">${loc.count}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${percentage}%"></div>
                            </div>
                        </div>`;
                    locContainer.insertAdjacentHTML('beforeend', locHTML);
                });
            }
        }


        //RENDER APPOINTMENTS TABLE
        
        function renderTable(bookings) {
            tableBody.innerHTML = ''; 
            const todayStr = new Date().toISOString().split('T')[0];

            bookings.forEach(appt => {
                // LOGIC: Requirement for status labels
                // Confirmed -> Pending (If current date matches appointment date)
                let displayStatus = appt.status || 'Confirmed';
                
                if (displayStatus === 'Confirmed' && appt.date === todayStr) {
                    displayStatus = 'Pending';
                }

                const statusClass = displayStatus.toLowerCase();
                
                const rowHTML = `
                    <tr>
                        <td>
                            <div class="user-info">
                                <div class="user-details">
                                    <span class="user-name">${appt.userName || 'Unknown'}</span>
                                    <span class="user-location">${appt.userPhone || 'No Contact'}</span>
                                </div>
                            </div>
                        </td>
                        <td><strong>${appt.appointmentNumber || 'N/A'}</strong></td>
                        <td>
                            <div class="date-info">
                                <span class="date">${appt.date}</span>
                                <span class="time">${appt.time}</span>
                            </div>
                        </td>
                        <td>
                            <div class="date-info">
                                <span class="date">${new Date(appt.createdAt).toLocaleDateString()}</span>
                            </div>
                        </td>
                        <td>
                            <span class="status-badge ${statusClass}">
                                <i class="fas fa-circle" style="font-size: 8px; margin-right: 5px;"></i>
                                ${displayStatus}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button onclick="updateStatus('${appt._id}', 'Completed')" class="btn-action complete" title="Mark as Attended">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button onclick="updateStatus('${appt._id}', 'Cancelled')" class="btn-action cancel" title="Cancel Booking">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', rowHTML);
            });
        }

        //UPDATE STATUS ACTION
         // Attached to window so the HTML onclick can find it
         
        window.updateStatus = async (id, newStatus) => {
            if (!confirm(`Are you sure you want to mark this as ${newStatus}?`)) return;

            try {
                const response = await fetch(`${API_BASE_URL}/book/status/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });

                if (response.ok) {
                    refreshDashboard(); // Reload data to show updated stats and labels
                } else {
                    alert("Failed to update status.");
                }
            } catch (err) {
                console.error("Update Error:", err);
            }
        };

        // Initial Execution
        refreshDashboard();


        // Refresh functionality
        refreshBtn.addEventListener('click', () => {
            refreshBtn.classList.add('refreshing');
            refreshDashboard().finally(() => {
                setTimeout(() => refreshBtn.classList.remove('refreshing'), 500);
            });
        });

    
        
    });