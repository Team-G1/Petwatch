/* ../../Frontend/javascript/services.js */

// ==========================================
// 1. TAB SWITCHING LOGIC
// ==========================================
function openTab(tabName, element) {
    // Hide all tab content
    const contents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contents.length; i++) {
        contents[i].classList.remove("active");
    }
    
    // Deactivate all tab buttons
    const tabs = document.getElementsByClassName("tab");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }

    // Activate specific tab and button
    document.getElementById(tabName).classList.add("active");
    element.classList.add("active");
}

// ==========================================
// 2. FORM VALIDATION & SUBMISSION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    
    const submitBtn = document.querySelector('.btn-submit');

    if(submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Stop page reload

            // A. Identify which tab is currently active
            const activeTab = document.querySelector('.tab-content.active');
            if(!activeTab) return;
            
            const serviceType = activeTab.id; // 'pet-clinic', 'pet-care', or 'pet-grooming'
            let formData = {};

            // B. Collect Data based on Service Type
            // We use specific logic for each tab to ensure we get the right inputs
            
            if (serviceType === 'pet-clinic') {
                // Clinic has: Name, Type(select), Breed(select), Age, Weight, Location, Date, Time
                formData = {
                    serviceType: 'Clinic',
                    petName: activeTab.querySelector("input[placeholder='Enter Your Pet’s Name']").value,
                    petType: activeTab.querySelectorAll("select")[0].value, // 1st dropdown
                    breed:   activeTab.querySelectorAll("select")[1].value, // 2nd dropdown
                    age:     activeTab.querySelector("input[placeholder='Age']").value,
                    weight:  activeTab.querySelector("input[placeholder='Weight']").value,
                    location: activeTab.querySelectorAll("select")[2].value, // 3rd dropdown
                    date:    activeTab.querySelector("input[placeholder='DD.MM.YYYY']").value,
                    time:    activeTab.querySelector("input[placeholder='HH.MM']").value
                };
            } 
            else if (serviceType === 'pet-care') {
                // Care has: Name, Type, Breed, Age, Weight, Location... AND Date Range
                formData = {
                    serviceType: 'Pet Care',
                    petName: activeTab.querySelector("input[placeholder='Enter Your Pet’s Name']").value,
                    petType: activeTab.querySelectorAll("select")[0].value,
                    breed:   activeTab.querySelectorAll("select")[1].value,
                    age:     activeTab.querySelector("input[placeholder='Age']").value,
                    weight:  activeTab.querySelector("input[placeholder='Weight']").value,
                    location: activeTab.querySelectorAll("select")[2].value,
                    
                    // Grab inputs by ID (Ensure you added IDs in HTML as discussed)
                    dateFrom: document.getElementById('care-date-start')?.value || "",
                    dateTo:   document.getElementById('care-date-end')?.value || "",
                    timeFrom: document.getElementById('care-time-start')?.value || "",
                    timeTo:   document.getElementById('care-time-end')?.value || ""
                };
            } 
            else if (serviceType === 'pet-grooming') {
                // Grooming has: Name, Type, Breed, Age, Weight, Location... AND Package
                formData = {
                    serviceType: 'Grooming',
                    petName: activeTab.querySelector("input[placeholder='Enter Your Pet’s Name']").value,
                    petType: activeTab.querySelectorAll("select")[0].value,
                    breed:   activeTab.querySelectorAll("select")[1].value,
                    age:     activeTab.querySelector("input[placeholder='Age']").value,
                    weight:  activeTab.querySelector("input[placeholder='Weight']").value,
                    location: document.getElementById('grooming-location')?.value || "",
                    groomingPackage: document.getElementById('grooming-package')?.value || "",
                    
                    date:    activeTab.querySelector("input[placeholder='DD.MM.YYYY']").value,
                    time:    activeTab.querySelector("input[placeholder='HH.MM']").value
                };
            }

            console.log("Sending Data:", formData); // Debugging

            // C. Basic Validation
            if (!formData.petName) {
                alert("Please enter your pet's name.");
                return;
            }
            if (!formData.petType || formData.petType.includes("Select")) {
                alert("Please select a pet type.");
                return;
            }

            // D. Send to Backend
            fetch('http://localhost:5000/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if(data.message === 'Booking successful!') {
                    alert("✅ Appointment Booked Successfully!");
                    location.reload(); // Reload page to clear form
                } else {
                    alert("⚠️ Error: " + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("❌ Failed to connect to server. Is it running?");
            });
        });
    }
});