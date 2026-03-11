// Frontend/javascript/profile.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');
    
    // Check if user is logged in
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null');
    
    if (!user || !user.id) {
        console.log('No user found, redirecting to signin');
        window.location.href = 'signin.html';
        return;
    }
    
    console.log('User data:', user);
    
    // Store user data globally
    window.currentUser = user;
    
    // State for editing
    window.editingState = {
        details: false,
        petId: null // ID of pet being edited, null if none
    };
    
    // Initialize the page
    initializePage();
});

async function initializePage() {
    try {
        // Set user details
        setUserDetails();
        
        // Load user's pets
        await loadUserPets();
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing page:', error);
        showMessage('Error loading profile data', 'error');
    }
}

function setUserDetails() {
    const user = window.currentUser;
    
    // Format username
    let userName = user.username || user.name || '';
    if (!userName && user.email) {
        userName = user.email.split('@')[0];
    }
    userName = userName.charAt(0).toUpperCase() + userName.slice(1);
    
    // Set form values
    document.getElementById('userName').value = userName;
    document.getElementById('email').value = user.email || '';
    document.getElementById('mobile').value = user.mobile || '';
    document.getElementById('password').value = '********';
}

function setupEventListeners() {
    // Edit details button
    document.getElementById('editDetailsBtn').addEventListener('click', function(e) {
        e.preventDefault();
        toggleDetailsEdit(true);
    });
    
    // Save details button
    document.getElementById('saveDetailsBtn').addEventListener('click', function() {
        saveUserDetails();
    });
    
    // Add new pet button
    document.getElementById('addNewPetBtn').addEventListener('click', function() {
        addNewPetForm();
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Cancel delete button
    document.getElementById('cancelDelete').addEventListener('click', function() {
        hideDeleteModal();
    });
    
    // Confirm delete button
    document.getElementById('confirmDelete').addEventListener('click', function() {
        confirmDeletePet();
    });
}

async function loadUserPets() {
    try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const userId = window.currentUser.id;
        
        if (!token || !userId) {
            console.log('No token or user ID found');
            document.getElementById('petsContainer').innerHTML = '<p class="loading">Please log in to see your pets</p>';
            return;
        }
        
        console.log('Loading pets for user:', userId);
        
        const response = await fetch(`http://localhost:5001/api/users/${userId}/pets`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const pets = await response.json();
            console.log('Pets loaded:', pets);
            window.userPets = pets || [];
            renderPets();
        } else {
            console.log('Failed to load pets:', response.status);
            document.getElementById('petsContainer').innerHTML = '<p class="loading">No pets found. Add your first pet!</p>';
            window.userPets = [];
        }
    } catch (error) {
        console.error('Error loading pets:', error);
        showMessage('Error loading pets', 'error');
        document.getElementById('petsContainer').innerHTML = '<p class="loading">Error loading pets. Please try again.</p>';
        window.userPets = [];
    }
}

function renderPets() {
    const container = document.getElementById('petsContainer');
    const pets = window.userPets || [];
    
    if (pets.length === 0) {
        container.innerHTML = '<p class="loading">No pets added yet. Click "Add New Pet" to get started!</p>';
        return;
    }
    
    let html = '';
    pets.forEach(pet => {
        html += renderPetCard(pet);
    });
    
    container.innerHTML = html;
    
    // Attach event listeners to pet buttons
    pets.forEach(pet => {
        attachPetEventListeners(pet._id);
    });
}

function renderPetCard(pet) {
    const isEditing = window.editingState.petId === pet._id;
    
    if (isEditing) {
        return renderPetEditForm(pet);
    } else {
        return `
            <div class="pet-card" data-pet-id="${pet._id}">
                <div class="pet-header">
                    <h3>${pet.petName}</h3>
                    <div class="pet-actions">
                        <button class="edit-pet-btn" onclick="editPet('${pet._id}')" title="Edit pet">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button class="delete-pet-btn" onclick="deletePet('${pet._id}')" title="Delete pet">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </div>
                <div class="pet-form-grid">
                    <div class="form-group">
                        <label>Pet Name</label>
                        <input type="text" class="form-control" value="${escapeHtml(pet.petName)}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Pet Type</label>
                        <input type="text" class="form-control" value="${escapeHtml(pet.petType)}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Breed</label>
                        <input type="text" class="form-control" value="${escapeHtml(pet.breed || '')}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Age</label>
                        <input type="text" class="form-control" value="${escapeHtml(pet.age || '')}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Weight (kg)</label>
                        <input type="text" class="form-control" value="${escapeHtml(pet.weight || '')}" readonly>
                    </div>
                </div>
            </div>
        `;
    }
}

function renderPetEditForm(pet) {
    // Get breed options based on pet type
    const breedOptions = getBreedOptions(pet.petType);
    const ageOptions = getAgeOptions();
    const weightOptions = getWeightOptions();
    
    return `
        <div class="pet-card" data-pet-id="${pet._id}">
            <div class="pet-header">
                <h3>Edit ${pet.petName}</h3>
                <div class="pet-actions">
                    <button class="save-pet-btn" onclick="savePetEdit('${pet._id}')" title="Save">
                        <i class="fa-regular fa-floppy-disk"></i>
                    </button>
                    <button class="cancel-pet-btn" onclick="cancelPetEdit('${pet._id}')" title="Cancel">
                        <i class="fa-regular fa-circle-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="pet-form-grid">
                <div class="form-group">
                    <label>Pet Name *</label>
                    <input type="text" id="edit-petName-${pet._id}" class="form-control" value="${escapeHtml(pet.petName)}" required>
                </div>
                <div class="form-group">
                    <label>Pet Type *</label>
                    <select id="edit-petType-${pet._id}" class="form-control" onchange="updateBreedOptions('${pet._id}')" required>
                        <option value="">Select Type</option>
                        <option value="Cat" ${pet.petType === 'Cat' ? 'selected' : ''}>Cat</option>
                        <option value="Dog" ${pet.petType === 'Dog' ? 'selected' : ''}>Dog</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Breed *</label>
                    <select id="edit-breed-${pet._id}" class="form-control" required>
                        <option value="">Select Breed</option>
                        ${breedOptions.map(breed => 
                            `<option value="${breed}" ${pet.breed === breed ? 'selected' : ''}>${breed}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Age *</label>
                    <select id="edit-age-${pet._id}" class="form-control" required>
                        <option value="">Select Age</option>
                        ${ageOptions.map(age => 
                            `<option value="${age}" ${pet.age === age ? 'selected' : ''}>${age}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Weight *</label>
                    <select id="edit-weight-${pet._id}" class="form-control" required>
                        <option value="">Select Weight</option>
                        ${weightOptions.map(weight => 
                            `<option value="${weight}" ${pet.weight === weight ? 'selected' : ''}>${weight}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        </div>
    `;
}

function addNewPetForm() {
    // Check if there's already a new pet form
    if (document.getElementById('new-pet-form')) {
        return;
    }
    
    const container = document.getElementById('petsContainer');
    
    const newPetForm = `
        <div class="pet-card" id="new-pet-form">
            <div class="pet-header">
                <h3>Add New Pet</h3>
                <div class="pet-actions">
                    <button class="save-pet-btn" onclick="saveNewPet()" title="Save">
                        <i class="fa-regular fa-floppy-disk"></i>
                    </button>
                    <button class="cancel-pet-btn" onclick="cancelNewPet()" title="Cancel">
                        <i class="fa-regular fa-circle-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="pet-form-grid">
                <div class="form-group">
                    <label>Pet Name *</label>
                    <input type="text" id="new-petName" class="form-control" placeholder="Enter pet name" required>
                </div>
                <div class="form-group">
                    <label>Pet Type *</label>
                    <select id="new-petType" class="form-control" onchange="updateNewBreedOptions()" required>
                        <option value="">Select Type</option>
                        <option value="Cat">Cat</option>
                        <option value="Dog">Dog</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Breed *</label>
                    <select id="new-breed" class="form-control" required>
                        <option value="">Select Breed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Age *</label>
                    <select id="new-age" class="form-control" required>
                        <option value="">Select Age</option>
                        ${getAgeOptions().map(age => `<option value="${age}">${age}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Weight *</label>
                    <select id="new-weight" class="form-control" required>
                        <option value="">Select Weight</option>
                        ${getWeightOptions().map(weight => `<option value="${weight}">${weight}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>
    `;
    
    // Insert at the beginning of the container
    container.insertAdjacentHTML('afterbegin', newPetForm);
    
    // Scroll to the new form
    document.getElementById('new-pet-form').scrollIntoView({ behavior: 'smooth' });
}

function cancelNewPet() {
    const newPetForm = document.getElementById('new-pet-form');
    if (newPetForm) {
        newPetForm.remove();
    }
}

async function saveNewPet() {
    // Get form values
    const petName = document.getElementById('new-petName').value.trim();
    const petType = document.getElementById('new-petType').value;
    const breed = document.getElementById('new-breed').value;
    const age = document.getElementById('new-age').value;
    const weight = document.getElementById('new-weight').value;
    
    // Validate
    if (!petName || !petType || !breed || !age || !weight) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    const petData = {
        petName,
        petType,
        breed,
        age,
        weight
    };
    
    try {
        const saved = await savePetToBackend(petData);
        if (saved) {
            showMessage('Pet added successfully!', 'success');
            cancelNewPet();
            await loadUserPets(); // Reload pets
        }
    } catch (error) {
        console.error('Error saving pet:', error);
        showMessage('Error saving pet', 'error');
    }
}

function editPet(petId) {
    // Cancel any other edit
    if (window.editingState.petId) {
        cancelPetEdit(window.editingState.petId);
    }
    
    window.editingState.petId = petId;
    renderPets();
}

function cancelPetEdit(petId) {
    if (window.editingState.petId === petId) {
        window.editingState.petId = null;
        renderPets();
    }
}

async function savePetEdit(petId) {
    // Get form values
    const petName = document.getElementById(`edit-petName-${petId}`).value.trim();
    const petType = document.getElementById(`edit-petType-${petId}`).value;
    const breed = document.getElementById(`edit-breed-${petId}`).value;
    const age = document.getElementById(`edit-age-${petId}`).value;
    const weight = document.getElementById(`edit-weight-${petId}`).value;
    
    // Validate
    if (!petName || !petType || !breed || !age || !weight) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    const petData = {
        petName,
        petType,
        breed,
        age,
        weight
    };
    
    try {
        const saved = await updatePetInBackend(petId, petData);
        if (saved) {
            showMessage('Pet updated successfully!', 'success');
            window.editingState.petId = null;
            await loadUserPets(); // Reload pets
        }
    } catch (error) {
        console.error('Error updating pet:', error);
        showMessage('Error updating pet', 'error');
    }
}

let petToDelete = null;

function deletePet(petId) {
    petToDelete = petId;
    showDeleteModal();
}

function showDeleteModal() {
    document.getElementById('deleteModal').classList.remove('hidden');
}

function hideDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    petToDelete = null;
}

async function confirmDeletePet() {
    if (!petToDelete) return;
    
    try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const userId = window.currentUser.id;
        
        const response = await fetch(`http://localhost:5001/api/users/${userId}/pets/${petToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showMessage('Pet deleted successfully!', 'success');
            hideDeleteModal();
            await loadUserPets(); // Reload pets
        } else {
            showMessage('Failed to delete pet', 'error');
        }
    } catch (error) {
        console.error('Error deleting pet:', error);
        showMessage('Error deleting pet', 'error');
    }
}

async function savePetToBackend(petData) {
    try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const userId = window.currentUser.id;
        
        if (!token || !userId) {
            showMessage('You must be logged in', 'error');
            return false;
        }
        
        console.log('Saving pet for user:', userId, petData);
        
        const response = await fetch(`http://localhost:5001/api/users/${userId}/pets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(petData)
        });
        
        if (response.ok) {
            const savedPet = await response.json();
            console.log('Pet saved successfully:', savedPet);
            return true;
        } else {
            const errorText = await response.text();
            console.error('Failed to save pet:', errorText);
            showMessage('Failed to save pet', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error saving pet:', error);
        showMessage('Network error. Please try again.', 'error');
        return false;
    }
}

async function updatePetInBackend(petId, petData) {
    try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const userId = window.currentUser.id;
        
        if (!token || !userId) {
            showMessage('You must be logged in', 'error');
            return false;
        }
        
        const response = await fetch(`http://localhost:5001/api/users/${userId}/pets/${petId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(petData)
        });
        
        if (response.ok) {
            return true;
        } else {
            showMessage('Failed to update pet', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error updating pet:', error);
        showMessage('Network error. Please try again.', 'error');
        return false;
    }
}

function toggleDetailsEdit(enable) {
    const detailsInputs = ['userName', 'email', 'mobile'];
    const saveBtn = document.getElementById('saveDetailsBtn');
    const editBtn = document.getElementById('editDetailsBtn');
    
    if (enable) {
        detailsInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input && id !== 'password') { // Don't allow editing password here
                input.readOnly = false;
                input.style.backgroundColor = 'white';
                input.style.borderColor = '#17AFEF';
            }
        });
        saveBtn.style.display = 'block';
        editBtn.innerHTML = '<i class="fa-regular fa-circle-xmark"></i> Cancel';
        editBtn.onclick = function(e) {
            e.preventDefault();
            toggleDetailsEdit(false);
            setUserDetails(); // Reset to original values
        };
        window.editingState.details = true;
    } else {
        detailsInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.readOnly = true;
                input.style.backgroundColor = '#f9f9f9';
                input.style.borderColor = '#eee';
            }
        });
        saveBtn.style.display = 'none';
        editBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Edit My Details';
        editBtn.onclick = function(e) {
            e.preventDefault();
            toggleDetailsEdit(true);
        };
        window.editingState.details = false;
    }
}

async function saveUserDetails() {
    const userName = document.getElementById('userName').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    
    // Validation
    if (!userName) {
        showMessage('Name is required', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email', 'error');
        return;
    }
    
    try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const userId = window.currentUser.id;
        
        const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username: userName, email, mobile })
        });
        
        if (response.ok) {
            // Update stored user data
            window.currentUser.username = userName;
            window.currentUser.email = email;
            window.currentUser.mobile = mobile;
            
            sessionStorage.setItem('user', JSON.stringify(window.currentUser));
            if (localStorage.getItem('user')) {
                localStorage.setItem('user', JSON.stringify(window.currentUser));
            }
            
            showMessage('Details updated successfully!', 'success');
            toggleDetailsEdit(false);
            
            // Reload navbar to update username
            if (typeof loadNavbar === 'function') {
                loadNavbar();
            }
        } else {
            showMessage('Failed to update details', 'error');
        }
    } catch (error) {
        console.error('Error updating details:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Helper functions
function getBreedOptions(petType) {
    const breeds = {
        Cat: [
            'Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Sphynx',
            'Ragdoll', 'British Shorthair', 'Abyssinian', 'Scottish Fold',
            'Russian Blue', 'Birman', 'Oriental'
        ],
        Dog: [
            'Labrador Retriever', 'German Shepherd', 'Golden Retriever',
            'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier',
            'Boxer', 'Dachshund', 'Siberian Husky', 'Great Dane'
        ]
    };
    
    return breeds[petType] || [];
}

function getAgeOptions() {
    return [
        '1 year', '2 years', '3 years', '4 years', '5 years',
        '6 years', '7 years', '8 years', '9 years', '10 years',
        '11 years', '12 years', '13 years', '14 years', '15 years'
    ];
}

function getWeightOptions() {
    const weights = [];
    for (let i = 1; i <= 30; i++) {
        weights.push(`${i} Kg`);
    }
    return weights;
}

function updateBreedOptions(petId) {
    const petType = document.getElementById(`edit-petType-${petId}`).value;
    const breedSelect = document.getElementById(`edit-breed-${petId}`);
    
    breedSelect.innerHTML = '<option value="">Select Breed</option>';
    
    if (petType) {
        getBreedOptions(petType).forEach(breed => {
            const option = document.createElement('option');
            option.value = breed;
            option.textContent = breed;
            breedSelect.appendChild(option);
        });
    }
}

function updateNewBreedOptions() {
    const petType = document.getElementById('new-petType').value;
    const breedSelect = document.getElementById('new-breed');
    
    breedSelect.innerHTML = '<option value="">Select Breed</option>';
    
    if (petType) {
        getBreedOptions(petType).forEach(breed => {
            const option = document.createElement('option');
            option.value = breed;
            option.textContent = breed;
            breedSelect.appendChild(option);
        });
    }
}

function showMessage(message, type) {
    const container = document.getElementById('messageContainer');
    container.textContent = message;
    container.className = `message ${type}`;
    
    setTimeout(() => {
        container.className = 'message';
    }, 5000);
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function logout() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = 'signin.html';
}

// Make functions available globally
window.editPet = editPet;
window.deletePet = deletePet;
window.savePetEdit = savePetEdit;
window.cancelPetEdit = cancelPetEdit;
window.saveNewPet = saveNewPet;
window.cancelNewPet = cancelNewPet;
window.updateBreedOptions = updateBreedOptions;
window.updateNewBreedOptions = updateNewBreedOptions;