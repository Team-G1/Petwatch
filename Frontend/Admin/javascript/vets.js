document.addEventListener('DOMContentLoaded', function () {
    //COMMON ELEMENTS
    const params = new URLSearchParams(window.location.search);
    const vetId = params.get('id');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    //LIST PAGE LOGIC (vets.html)
    const vetsContainer = document.getElementById('vets-container');
    const branchFilter = document.getElementById('branch-filter'); // New filter element

    if (vetsContainer) {
        let allVets = []; // Store the full list for local filtering
        const addBtn = document.getElementById('add-vet-btn');
        const refreshBtn = document.getElementById('refresh-btn');
        const searchInput = document.querySelector('.search-input');

        addBtn?.addEventListener('click', () => window.location.href = 'vetsAdd.html');

        async function loadVets() {
            try {
                vetsContainer.innerHTML = '<p>Loading...</p>';
                const response = await fetch('http://localhost:5001/api/vets');
                allVets = await response.json();
                renderVets(allVets); // Use a helper to display them
            } catch (err) {
                vetsContainer.innerHTML = '<p style="color: red;">Failed to connect.</p>';
            }
        }

        //Helper function to render cards based on a list
        function renderVets(vetsToDisplay) {
            vetsContainer.innerHTML = '';
            if (vetsToDisplay.length === 0) {
                vetsContainer.innerHTML = '<p>No veterinarians found matching your criteria.</p>';
                return;
            }

            vetsToDisplay.forEach(vet => {
                const card = document.createElement('div');
                card.className = 'vet-card';
                card.innerHTML = `
                    <div class="vet-header">
                        <span class="vet-badge">${vet.role || 'Vet'}</span>
                        <div class="vet-actions">
                            <button class="btn-action edit" data-id="${vet._id}"><i class="fas fa-edit"></i></button>
                        </div>
                    </div>
                    <div class="vet-avatar">
                        <img src="${vet.image ? 'http://localhost:5001' + vet.image : 'https://via.placeholder.com/100'}">
                        <span class="online-status ${vet.status === 'on-duty' ? 'active' : 'away'}"></span>
                    </div>
                    <div class="vet-info">
                        <h3>${vet.name}</h3>
                        <p class="vet-title">${vet.designation}</p>
                        <div class="vet-meta">
                            <span class="vet-location"><i class="fas fa-map-marker-alt"></i> ${vet.location}</span>
                        </div>
                    </div>`;
                
                card.querySelector('.edit').addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    window.location.href = `vetsEdit.html?id=${id}`;
                });
                vetsContainer.appendChild(card);
            });

            document.getElementById('stat-total').textContent = allVets.length;
            document.getElementById('stat-active').textContent = allVets.filter(v => v.status === 'on-duty').length;
        }

        //Branch Filter Event
        branchFilter?.addEventListener('change', (e) => {
            const selectedBranch = e.target.value.toLowerCase();
            if (selectedBranch === 'all') {
                renderVets(allVets);
            } else {
                const filtered = allVets.filter(vet => 
                    vet.location.toLowerCase().includes(selectedBranch)
                );
                renderVets(filtered);
            }
        });

        //Search Input Filter
        searchInput?.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allVets.filter(vet => 
                vet.name.toLowerCase().includes(term) || 
                vet.designation.toLowerCase().includes(term)
            );
            renderVets(filtered);
        });

        loadVets();
    }

    //DD/EDIT PAGE SHARED LOGIC
    const imageUpload = document.getElementById('image-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const currentImage = document.getElementById('current-image');

    if (uploadBtn && imageUpload) {
        uploadBtn.addEventListener('click', () => imageUpload.click());
        imageUpload.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => currentImage.src = e.target.result;
                reader.readAsDataURL(file);
            }
        });
    }

    //EDIT PAGE SPECIFIC
    const deleteBtn = document.getElementById('delete-btn');
    if (vetId && deleteBtn) {
        fetch(`http://localhost:5001/api/vets/${vetId}`)
            .then(res => res.json())
            .then(vet => {
                document.getElementById('vet-name').value = vet.name || '';
                document.getElementById('vet-designation').value = vet.designation || '';
                document.getElementById('vet-location').value = vet.location || '';
                if(document.getElementById('vet-phone')) document.getElementById('vet-phone').value = vet.phone || '';
            });

        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Delete this profile?')) return;
            const res = await fetch(`http://localhost:5001/api/vets/${vetId}`, { method: 'DELETE' });
            if (res.ok) window.location.href = 'vets.html';
        });
    }

    //SAVE BUTTON LOGIC
    if (saveBtn) {
        saveBtn.addEventListener('click', async function () {
            const vetData = {
                name: document.getElementById('vet-name').value,
                designation: document.getElementById('vet-designation').value,
                location: document.getElementById('vet-location').value,
                phone: document.getElementById('vet-phone')?.value || '',
                // Ensure we capture the extra fields if present
                role: document.getElementById('vet-role')?.value || 'General Practitioner',
                status: document.getElementById('duty-status')?.value || 'off-duty'
            };

            const isEdit = !!vetId;
            const url = isEdit ? `http://localhost:5001/api/vets/${vetId}` : 'http://localhost:5001/api/vets';
            const method = isEdit ? 'PUT' : 'POST';

            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            try {
                let response;
                const formData = new FormData();
                Object.keys(vetData).forEach(key => formData.append(key, vetData[key]));
                if (imageUpload?.files[0]) formData.append('image', imageUpload.files[0]);

                response = await fetch(url, { method: method, body: formData });

                if (response.ok) {
                    alert('Success!');
                    window.location.href = 'vets.html';
                } else {
                    alert('Error saving data.');
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-save"></i> Save';
                }
            } catch (err) {
                alert('Server Error');
                this.disabled = false;
            }
        });
    }

    //CANCEL BUTTON
    cancelBtn?.addEventListener('click', () => {
        if (confirm('Discard changes?')) window.location.href = 'vets.html';
    });
});