document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('appointmentsWrapper');
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user'));
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    // Prevent the 'null' error if the container is missing
    if (!container) return;

    if (!user || !token) {
        window.location.href = 'signin.html';
        return;
    }

    // Use the MongoDB ID
    const userId = user._id || user.id;
    
    console.log('Fetching appointments for user:', userId);

    try {
        const response = await fetch(`http://localhost:5001/api/my-bookings/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error(`Server returned ${response.status}`);
        }

        const appointments = await response.json();
        console.log('Appointments loaded:', appointments);
        
        if (appointments.length === 0) {
            container.innerHTML = '<p class="no-appointments">No appointments found. Book your first appointment!</p>';
            return;
        }
        
        // Render appointments
        container.innerHTML = '';
        appointments.forEach(appt => {
            const card = createAppointmentCard(appt);
            container.appendChild(card);
        });
        
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="error">Unable to load appointments. Please try again later.</p>';
    }
});

function createAppointmentCard(appt) {
    const card = document.createElement('div');
    card.className = 'appt-card';
    
    // Format date
    const apptDate = appt.date || appt.dateFrom || 'Date not set';
    const serviceType = appt.serviceType || 'General';
    
    card.innerHTML = `
        <div class="card-section qr-section">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${appt.appointmentNumber}" alt="QR Code" class="qr-img">
            <button class="btn-download" onclick="downloadQR('${appt.appointmentNumber}')">Download</button>
        </div>

        <div class="card-section details-section">
            <h3 class="appt-no-title">Appointment No : ${appt.appointmentNumber}</h3>
            
            <div class="info-grid">
                <div class="info-row"><span class="label">Customer Name :</span> <span class="val">${appt.userName || 'N/A'}</span></div>
                <div class="info-row"><span class="label">Location :</span> <span class="val">${appt.location || 'N/A'}</span></div>
                <div class="info-row"><span class="label">Date :</span> <span class="val">${apptDate}</span></div>
                <div class="info-row"><span class="label">Contact :</span> <span class="val">${appt.userPhone || 'N/A'}</span></div>
                <div class="info-row"><span class="label">Address :</span> <span class="val">${appt.userAddress || 'N/A'}</span></div>
            </div>
        </div>

        <div class="card-section pet-section">
            <h3 class="service-title">${serviceType}</h3>
            
            <div class="info-grid">
                <div class="info-row"><span class="label">Pet :</span> <span class="val">${appt.petType || 'N/A'}</span></div>
                <div class="info-row"><span class="label">Pet Name :</span> <span class="val">${appt.petName || 'N/A'}</span></div>
                <div class="info-row"><span class="label">Age :</span> <span class="val">${appt.age || 'N/A'}</span></div>
                <div class="info-row"><span class="label">Service :</span> <span class="val">${serviceType}</span></div>
            </div>

            <div class="card-footer-actions">
                <button class="btn-cancel" onclick="cancelAppointment('${appt._id}')">Cancel appointment</button>
                <span class="date-stamp">${new Date(appt.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Add global functions
window.downloadQR = function(apptNumber) {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${apptNumber}`;
    window.open(url, '_blank');
};

window.cancelAppointment = async function(apptId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:5001/api/book/status/${apptId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'Cancelled' })
        });
        
        if (response.ok) {
            alert('Appointment cancelled successfully');
            location.reload();
        } else {
            alert('Failed to cancel appointment');
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Error cancelling appointment');
    }
};