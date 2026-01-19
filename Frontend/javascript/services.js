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
            if (serviceType === 'pet-clinic') {
                formData = {
                    serviceType: 'Clinic',
                    petName: activeTab.querySelector("input[placeholder='Enter Your Pet’s Name']").value,
                    petType: activeTab.querySelectorAll("select")[0].value,
                    breed:   activeTab.querySelectorAll("select")[1].value,
                    age:     activeTab.querySelector("input[placeholder='Age']").value,
                    weight:  activeTab.querySelector("input[placeholder='Weight']").value,
                    location: activeTab.querySelectorAll("select")[2].value,
                    date:    activeTab.querySelector("input[placeholder='DD.MM.YYYY']").value,
                    time:    activeTab.querySelector("input[placeholder='HH.MM']").value
                };
            } 
            else if (serviceType === 'pet-care') {
                formData = {
                    serviceType: 'Pet Care',
                    petName: activeTab.querySelector("input[placeholder='Enter Your Pet’s Name']").value,
                    petType: activeTab.querySelectorAll("select")[0].value,
                    breed:   activeTab.querySelectorAll("select")[1].value,
                    age:     activeTab.querySelector("input[placeholder='Age']").value,
                    weight:  activeTab.querySelector("input[placeholder='Weight']").value,
                    location: activeTab.querySelectorAll("select")[2].value,
                    dateFrom: document.getElementById('care-date-start')?.value || "",
                    dateTo:   document.getElementById('care-date-end')?.value || "",
                    timeFrom: document.getElementById('care-time-start')?.value || "",
                    timeTo:   document.getElementById('care-time-end')?.value || ""
                };
            } 
            else if (serviceType === 'pet-grooming') {
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

            // C. Basic Validation
            if (!formData.petName) {
                alert("Please enter your pet's name.");
                return;
            }
            if (!formData.petType || formData.petType.includes("Select")) {
                alert("Please select a pet type.");
                return;
            }

            // D. Send to Backend (Port 5001)
            fetch('http://127.0.0.1:5001/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                // --- CRITICAL FIX HERE ---
                // We check for 'Step 1 Complete' because that is what server.js sends now.
                if(data.message === 'Step 1 Complete') {
                    // Redirect to the User Details page with the ID
                    window.location.href = `user_details.html?bookingId=${data.bookingId}`;
                } else {
                    // This handles actual errors
                    alert("⚠️ Error: " + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("❌ Failed to connect to server. Is it running on Port 5001?");
            });
        });
    }
});