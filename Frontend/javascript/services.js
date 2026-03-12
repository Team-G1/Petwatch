// ==========================================
// 1. TAB SWITCHING LOGIC
// ==========================================
function openTab(tabName, element) {
    const contents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contents.length; i++) contents[i].classList.remove("active");
    
    const tabs = document.getElementsByClassName("tab");
    for (let i = 0; i < tabs.length; i++) tabs[i].classList.remove("active");

    document.getElementById(tabName).classList.add("active");
    element.classList.add("active");
}

// ==========================================
// 2. FETCH PETS AND SETUP FORM MODE
// ==========================================
let userPets = [];
let currentUserToken = '';
let currentUserId = '';

document.addEventListener('DOMContentLoaded', async function() {
    
    // Convert Date/Time inputs and setup dynamic Timeslot loading
    setupDateAndTimePickers();

    // 1. Authenticate User
    currentUserToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (!currentUserToken || !userStr) {
        alert('Please sign in to book an appointment.');
        window.location.href = 'signin.html';
        return;
    }

    const user = JSON.parse(userStr);
    currentUserId = user.id || user._id;

    // 2. Fetch User's Pets with a Failsafe
    try {
        const response = await fetch(`http://localhost:5001/api/users/${currentUserId}/pets`, {
            headers: { 'Authorization': `Bearer ${currentUserToken}` }
        });
        if (response.ok) {
            userPets = await response.json();
        }
    } catch (error) {
        console.error('Error fetching pets:', error);
    } finally {
        // This ALWAYS runs, even if the backend is slow
        setupPetFields(); 
    }

    // --- SMART DATE & TIME SLOT GENERATOR ---
    function setupDateAndTimePickers() {
        // 1. Upgrade Date Inputs and add listener to populate timeslots
        document.querySelectorAll('input').forEach(inp => {
            if (inp.placeholder === 'DD.MM.YYYY' || inp.id === 'care-date-start' || inp.id === 'care-date-end') {
                inp.removeAttribute('onfocus');
                inp.removeAttribute('onblur');
                inp.type = 'date';
                
                // When a date is picked, populate the corresponding time dropdown!
                inp.addEventListener('change', function() {
                    populateTimeSlots(this);
                });
            }
        });

        // 2. Convert old Time Inputs into clean Dropdowns
        const timeInputs = [
            ...document.querySelectorAll("input[placeholder='HH.MM']"),
            document.getElementById('care-time-start'),
            document.getElementById('care-time-end')
        ].filter(Boolean);

        timeInputs.forEach(inp => {
            const wrapper = inp.parentElement;
            const select = document.createElement('select');
            
            if (inp.id) select.id = inp.id;
            select.className = "time-dropdown"; 
            
            // Ask them to pick a date first!
            select.innerHTML = '<option value="" disabled selected>Select Date First</option>';
            
            // Keep your cool clock icon
            const icon = wrapper.querySelector('.fa-clock');
            
            wrapper.innerHTML = ''; 
            wrapper.appendChild(select);
            if (icon) wrapper.appendChild(icon);
        });
    }

    function populateTimeSlots(dateInput) {
        let targetTimeSelect = null;
        
        // Find the matching time dropdown for this specific date box
        if (dateInput.id === 'care-date-start') {
            targetTimeSelect = document.getElementById('care-time-start');
        } else if (dateInput.id === 'care-date-end') {
            targetTimeSelect = document.getElementById('care-time-end');
        } else {
            const tab = dateInput.closest('.tab-content');
            if (tab) targetTimeSelect = tab.querySelector('.time-dropdown');
        }

        if (targetTimeSelect) {
            targetTimeSelect.innerHTML = '<option value="" disabled selected>Select Time</option>';
            
            // 🕒 Generate Timeslots
            const slots = [
                '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
                '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
                '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
            ];
            
            slots.forEach(slot => {
                const opt = document.createElement('option');
                opt.value = slot;
                opt.textContent = slot;
                targetTimeSelect.appendChild(opt);
            });
        }
    }

    // 3. Configure Form Layout based on Pet Data
    function setupPetFields() {
        const tabs = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            const petSelector = tab.querySelector('.pet-selector');
            if (!petSelector) return; // Safety check
            
            // 1. Ensure Name Input exists in a COMPLETELY NEW ROW
            const selectorRow = petSelector.closest('.row');
            const selectorGroup = petSelector.closest('.input-group');
            
            // Make dropdown take full width of its row
            selectorGroup.style.flex = '1';
            selectorGroup.style.width = '100%';

            let manualNameRow = tab.querySelector('.manual-name-row');
            if (!manualNameRow) {
                const newRow = document.createElement('div');
                newRow.className = 'row manual-name-row';
                newRow.style.display = 'none'; // Hidden by default
                
                newRow.innerHTML = `
                    <div class="input-group" style="width: 100%; flex: 1;">
                        <label>Pet's Name *</label>
                        <div class="input-wrapper">
                            <input type="text" class="new-pet-name-input" placeholder="Enter Pet's Name">
                        </div>
                    </div>
                `;
                // Insert the new row IMMEDIATELY AFTER the dropdown's row
                selectorRow.parentNode.insertBefore(newRow, selectorRow.nextSibling);
                manualNameRow = newRow;
            }

            const typeInput = tab.querySelector('.pet-type-input');
            const breedInput = tab.querySelector('.pet-breed-input');
            const ageInput = tab.querySelector('.pet-age-input');
            const weightInput = tab.querySelector('.pet-weight-input');

            // 2. Convert Type, Breed, Age, and Weight inputs into Dropdowns dynamically WITHOUT inline override styles
            if (typeInput && typeInput.tagName === 'INPUT') {
                const typeWrapper = typeInput.parentElement;
                typeWrapper.innerHTML = `
                    <select class="pet-type-input" disabled style="background-color: #f5f5f5;">
                        <option value="" disabled selected>Select Type</option>
                        <option value="Cat">Cat</option>
                        <option value="Dog">Dog</option>
                    </select>
                    <i class="fa-solid fa-caret-down icon-right"></i>
                `;
            }
            if (breedInput && breedInput.tagName === 'INPUT') {
                const breedWrapper = breedInput.parentElement;
                breedWrapper.innerHTML = `
                    <select class="pet-breed-input" disabled style="background-color: #f5f5f5;">
                        <option value="" disabled selected>Select Breed</option>
                    </select>
                    <i class="fa-solid fa-caret-down icon-right"></i>
                `;
            }
            if (ageInput && ageInput.tagName === 'INPUT') {
                const ageWrapper = ageInput.parentElement;
                ageWrapper.innerHTML = `
                    <select class="pet-age-input" disabled style="background-color: #f5f5f5;">
                        <option value="" disabled selected>Select Age</option>
                        ${getAgeOptions().map(age => `<option value="${age}">${age}</option>`).join('')}
                    </select>
                    <i class="fa-solid fa-caret-down icon-right"></i>
                `;
            }
            if (weightInput && weightInput.tagName === 'INPUT') {
                const weightWrapper = weightInput.parentElement;
                weightWrapper.innerHTML = `
                    <select class="pet-weight-input" disabled style="background-color: #f5f5f5;">
                        <option value="" disabled selected>Select Weight</option>
                        ${getWeightOptions().map(weight => `<option value="${weight}">${weight}</option>`).join('')}
                    </select>
                    <i class="fa-solid fa-caret-down icon-right"></i>
                `;
            }

            // Re-select them now that they are <select> dropdowns
            const currentTypeSelect = tab.querySelector('.pet-type-input');
            const currentBreedSelect = tab.querySelector('.pet-breed-input');
            const currentAgeSelect = tab.querySelector('.pet-age-input');
            const currentWeightSelect = tab.querySelector('.pet-weight-input');

            // Handle Breed dropdown population based on Type
            currentTypeSelect.addEventListener('change', function() {
                const breeds = getBreedOptions(this.value);
                currentBreedSelect.innerHTML = '<option value="" disabled selected>Select Breed</option>';
                breeds.forEach(breed => {
                    const opt = document.createElement('option');
                    opt.value = breed;
                    opt.textContent = breed;
                    currentBreedSelect.appendChild(opt);
                });
            });

            if (userPets.length === 0) {
                // SCENARIO 1: NO PETS IN PROFILE
                selectorGroup.style.display = 'none'; // Hide dropdown
                manualNameRow.style.display = 'flex'; // Show name input row

                [currentTypeSelect, currentBreedSelect, currentAgeSelect, currentWeightSelect].forEach(select => {
                    if (select) {
                        select.disabled = false;
                        select.style.backgroundColor = '#ffffff';
                        select.value = '';
                    }
                });
            } else {
                // SCENARIO 2: PETS EXIST (Show Dropdown + Manual Option)
                petSelector.innerHTML = '<option value="" disabled selected>Select Your Pet</option>';
                
                // Add existing pets
                userPets.forEach(pet => {
                    const option = document.createElement('option');
                    option.value = pet._id;
                    option.textContent = pet.petName;
                    petSelector.appendChild(option);
                });

                // Add the Manual Entry option
                const manualOpt = document.createElement('option');
                manualOpt.value = 'manual';
                manualOpt.textContent = '+ Enter pet details manually';
                manualOpt.style.color = '#17AFEF';
                manualOpt.style.fontWeight = 'bold';
                petSelector.appendChild(manualOpt);

                // Listen for dropdown changes to lock/unlock form
                petSelector.addEventListener('change', function() {
                    if (this.value === 'manual') {
                        // UNLOCK FORM FOR MANUAL ENTRY
                        manualNameRow.style.display = 'flex'; // Shows directly underneath!
                        
                        [currentTypeSelect, currentBreedSelect, currentAgeSelect, currentWeightSelect].forEach(select => {
                            if (select) {
                                select.disabled = false;
                                select.style.backgroundColor = '#ffffff';
                                select.value = '';
                            }
                        });
                        // Reset Breed specifically to default
                        currentBreedSelect.innerHTML = '<option value="" disabled selected>Select Breed</option>';

                    } else {
                        // LOCK FORM AND FILL SAVED DATA
                        manualNameRow.style.display = 'none';
                        const selectedPet = userPets.find(p => p._id === this.value);
                        
                        if (selectedPet) {
                            currentTypeSelect.value = selectedPet.petType || '';
                            
                            // Load correct breeds for this saved pet
                            const breeds = getBreedOptions(selectedPet.petType);
                            currentBreedSelect.innerHTML = '<option value="" disabled selected>Select Breed</option>';
                            breeds.forEach(breed => {
                                const opt = document.createElement('option');
                                opt.value = breed;
                                opt.textContent = breed;
                                currentBreedSelect.appendChild(opt);
                            });
                            currentBreedSelect.value = selectedPet.breed || '';
                            
                            currentAgeSelect.value = selectedPet.age || '';
                            currentWeightSelect.value = selectedPet.weight || '';
                            
                            // Lock everything
                            [currentTypeSelect, currentBreedSelect, currentAgeSelect, currentWeightSelect].forEach(select => {
                                if (select) {
                                    select.disabled = true;
                                    select.style.backgroundColor = '#f5f5f5';
                                }
                            });
                        }
                    }
                });
            }
        });
    }

    // ==========================================
    // 3. FORM VALIDATION & SUBMISSION
    // ==========================================
    const submitBtn = document.querySelector('.btn-submit');

    if(submitBtn) {
        submitBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            const activeTab = document.querySelector('.tab-content.active');
            if(!activeTab) return;
            
            const serviceType = activeTab.id;
            const petSelector = activeTab.querySelector('.pet-selector');
            let petId = null;
            let finalPetName = "";
            
            // Read standard inputs
            const formPetType = activeTab.querySelector('.pet-type-input').value.trim();
            const formBreed = activeTab.querySelector('.pet-breed-input').value.trim();
            const formAge = activeTab.querySelector('.pet-age-input').value.trim();
            const formWeight = activeTab.querySelector('.pet-weight-input').value.trim();

            if (userPets.length === 0 || (petSelector && petSelector.value === 'manual')) {
                // Process Manual Entry
                const nameInput = activeTab.querySelector('.new-pet-name-input');
                finalPetName = nameInput ? nameInput.value.trim() : "";
                
                if (!finalPetName || !formPetType || !formBreed || !formAge || !formWeight) {
                    alert('Please fill in all the details for your pet.');
                    return;
                }
            } else {
                // Process Dropdown Selection
                if (!petSelector || !petSelector.value) {
                    alert("Please select a pet from your profile.");
                    return;
                }
                petId = petSelector.value;
                finalPetName = petSelector.options[petSelector.selectedIndex].text;
            }

            // Lock the button to prevent double-booking
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';

            let formData = {
                petName: finalPetName,
                petType: formPetType,
                breed: formBreed,
                age: formAge,
                weight: formWeight,
            };
            
            // Link database ID if a profile pet was selected
            if (petId) {
                formData.pet = petId;
            }

            // Safely grab the Location value by searching for its Label
            let locationVal = "";
            const locLabel = Array.from(activeTab.querySelectorAll('label')).find(l => l.textContent.includes('Location'));
            if (locLabel) {
                const locSelect = locLabel.parentElement.querySelector('select');
                if (locSelect) locationVal = locSelect.value;
            }

            // Gather specific tab data (READING FROM OUR NEW TIME DROPDOWNS)
            if (serviceType === 'pet-clinic') {
                formData.serviceType = 'Pet Clinic';
                formData.location = locationVal;
                formData.date = activeTab.querySelector("input[type='date']")?.value || "";
                formData.time = activeTab.querySelector(".time-dropdown")?.value || "";
            } 
            else if (serviceType === 'pet-care') {
                formData.serviceType = 'Pet Care';
                formData.location = locationVal;
                formData.dateFrom = document.getElementById('care-date-start')?.value || "";
                formData.dateTo = document.getElementById('care-date-end')?.value || "";
                formData.timeFrom = document.getElementById('care-time-start')?.value || "";
                formData.timeTo = document.getElementById('care-time-end')?.value || "";
            } 
            else if (serviceType === 'pet-grooming') {
                formData.serviceType = 'Pet Grooming';
                formData.location = locationVal;
                formData.groomingPackage = document.getElementById('grooming-package')?.value || "";
                formData.date = activeTab.querySelector("input[type='date']")?.value || "";
                formData.time = activeTab.querySelector(".time-dropdown")?.value || "";
            }

            // Validate Date and Time
            if (!formData.date && !formData.dateFrom) {
                alert("Please select a date.");
                resetButton();
                return;
            }
            if (!formData.time && !formData.timeFrom) {
                alert("Please select an available time.");
                resetButton();
                return;
            }

            // Submit Booking
            try {
                const response = await fetch('http://localhost:5001/api/book', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUserToken}`
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if(data.message === 'Step 1 Complete') {
                    window.location.href = `userDetails.html?bookingId=${data.bookingId}`;
                } else {
                    alert("⚠️ Error: " + data.message);
                    resetButton();
                }
            } catch(error) {
                console.error('Booking Error:', error);
                alert("❌ Failed to connect to server.");
                resetButton();
            }
        });

        function resetButton() {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Appointment';
        }
    }
});

// ==========================================
// 4. HELPER FUNCTIONS
// ==========================================
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