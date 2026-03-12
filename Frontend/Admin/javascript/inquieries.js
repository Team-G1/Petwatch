
        const API_BASE = 'http://localhost:5001/api';
        let currentInquiries = [];
        let currentInquiryId = null;

        // Fetch and display inquiries
        async function fetchInquiries() {
            try {
                const response = await fetch(`${API_BASE}/inquiries`);
                if (!response.ok) throw new Error('Failed to fetch');
                
                const inquiries = await response.json();
                currentInquiries = inquiries;
                displayInquiries(inquiries);
                updateStats(inquiries);
                
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('inquiries-table-body').innerHTML = `
                    <tr class="empty-state">
                        <td colspan="7">
                            <i class="fas fa-exclamation-circle"></i>
                            <p>Error loading inquiries. Please try again.</p>
                        </td>
                    </tr>
                `;
            }
        }

        // Display inquiries in table
        function displayInquiries(inquiries) {
            const tbody = document.getElementById('inquiries-table-body');
            
            if (inquiries.length === 0) {
                tbody.innerHTML = `
                    <tr class="empty-state">
                        <td colspan="7">
                            <i class="fas fa-inbox"></i>
                            <p>No inquiries found</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = inquiries.map(inquiry => {
                const date = new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const statusClass = `status-badge status-${inquiry.status}`;
                const statusText = inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1);

                return `
                    <tr>
                        <td>${date}</td>
                        <td><span class="inquiry-branch">${inquiry.branch}</span></td>
                        <td>${inquiry.name}</td>
                        <td>${inquiry.email}</td>
                        <td>${inquiry.message.substring(0, 50)}${inquiry.message.length > 50 ? '...' : ''}</td>
                        <td><span class="${statusClass}">${statusText}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view" onclick="viewInquiry('${inquiry._id}')">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button class="action-btn delete" onclick="deleteInquiry('${inquiry._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Update statistics
        function updateStats(inquiries) {
            const total = inquiries.length;
            const newCount = inquiries.filter(i => i.status === 'new').length;
            const readCount = inquiries.filter(i => i.status === 'read').length;
            const repliedCount = inquiries.filter(i => i.status === 'replied').length;

            document.getElementById('total-count').textContent = total;
            document.getElementById('new-count').textContent = newCount;
            document.getElementById('read-count').textContent = readCount;
            document.getElementById('replied-count').textContent = repliedCount;

            // Populate branch filter
            const branches = [...new Set(inquiries.map(i => i.branch))];
            const branchFilter = document.getElementById('branch-filter');
            branchFilter.innerHTML = '<option value="all">All Branches</option>' + 
                branches.map(b => `<option value="${b}">${b}</option>`).join('');
        }

        // View inquiry details
        async function viewInquiry(id) {
            try {
                const inquiry = currentInquiries.find(i => i._id === id);
                if (!inquiry) return;

                currentInquiryId = id;
                
                const modalBody = document.getElementById('modal-body');
                modalBody.innerHTML = `
                    <div class="inquiry-detail-item">
                        <div class="inquiry-detail-label">Date</div>
                        <div class="inquiry-detail-value">${new Date(inquiry.createdAt).toLocaleString()}</div>
                    </div>
                    <div class="inquiry-detail-item">
                        <div class="inquiry-detail-label">Branch</div>
                        <div class="inquiry-detail-value">${inquiry.branch}</div>
                    </div>
                    <div class="inquiry-detail-item">
                        <div class="inquiry-detail-label">Name</div>
                        <div class="inquiry-detail-value">${inquiry.name}</div>
                    </div>
                    <div class="inquiry-detail-item">
                        <div class="inquiry-detail-label">Email</div>
                        <div class="inquiry-detail-value">${inquiry.email}</div>
                    </div>
                    <div class="inquiry-detail-item">
                        <div class="inquiry-detail-label">Message</div>
                        <div class="inquiry-detail-value inquiry-message">${inquiry.message}</div>
                    </div>
                    <div class="inquiry-detail-item">
                        <div class="inquiry-detail-label">Status</div>
                        <div class="inquiry-detail-value">
                            <span class="status-badge status-${inquiry.status}">
                                ${inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                            </span>
                        </div>
                    </div>
                `;

                // If status is 'new', mark as read
                if (inquiry.status === 'new') {
                    updateInquiryStatus(id, 'read');
                }

                document.getElementById('view-modal').classList.add('active');
                
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to load inquiry details');
            }
        }

        // Update inquiry status
        async function updateInquiryStatus(id, status) {
            try {
                const response = await fetch(`${API_BASE}/inquiries/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status })
                });

                if (!response.ok) throw new Error('Failed to update');

                await fetchInquiries(); // Refresh the list
                
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to update status');
            }
        }

        // Delete inquiry
        async function deleteInquiry(id) {
            if (!confirm('Are you sure you want to delete this inquiry?')) return;

            try {
                const response = await fetch(`${API_BASE}/inquiries/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Failed to delete');

                // Close modal if open and it's the same inquiry
                if (currentInquiryId === id) {
                    document.getElementById('view-modal').classList.remove('active');
                }

                await fetchInquiries(); // Refresh the list
                
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to delete inquiry');
            }
        }

        // Filter inquiries
        function filterInquiries() {
            const statusFilter = document.getElementById('status-filter').value;
            const branchFilter = document.getElementById('branch-filter').value;
            const searchTerm = document.getElementById('search-input').value.toLowerCase();

            let filtered = [...currentInquiries];

            if (statusFilter !== 'all') {
                filtered = filtered.filter(i => i.status === statusFilter);
            }

            if (branchFilter !== 'all') {
                filtered = filtered.filter(i => i.branch === branchFilter);
            }

            if (searchTerm) {
                filtered = filtered.filter(i => 
                    i.name.toLowerCase().includes(searchTerm) || 
                    i.email.toLowerCase().includes(searchTerm)
                );
            }

            displayInquiries(filtered);
        }

        // Event Listeners
        document.getElementById('status-filter').addEventListener('change', filterInquiries);
        document.getElementById('branch-filter').addEventListener('change', filterInquiries);
        document.getElementById('search-input').addEventListener('input', filterInquiries);
        
        document.getElementById('refresh-btn').addEventListener('click', fetchInquiries);

        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('view-modal').classList.remove('active');
        });

        document.getElementById('mark-read-btn').addEventListener('click', () => {
            if (currentInquiryId) {
                updateInquiryStatus(currentInquiryId, 'read');
                document.getElementById('view-modal').classList.remove('active');
            }
        });

        document.getElementById('mark-replied-btn').addEventListener('click', () => {
            if (currentInquiryId) {
                updateInquiryStatus(currentInquiryId, 'replied');
                document.getElementById('view-modal').classList.remove('active');
            }
        });

        document.getElementById('delete-inquiry-btn').addEventListener('click', () => {
            if (currentInquiryId) {
                deleteInquiry(currentInquiryId);
                document.getElementById('view-modal').classList.remove('active');
            }
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('view-modal');
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Initial fetch
        fetchInquiries();
   