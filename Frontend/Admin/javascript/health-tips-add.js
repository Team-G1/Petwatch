
document.addEventListener('DOMContentLoaded', function () {
    const imageUpload = document.getElementById('image-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const currentImage = document.getElementById('current-image');
    const params = new URLSearchParams(window.location.search);
    const tipId = params.get('id');


    uploadBtn.addEventListener('click', function () {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Image size must be under 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            currentImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('save-btn').addEventListener('click', async function () {
        const title = document.getElementById('tip-title').value.trim();
        const category = document.getElementById('category').value;
        const description = document.getElementById('tip-description').value.trim();
        const status = document.getElementById('status').value;
        const publishDate = document.getElementById('publish-date').value;
        const imageFile = document.getElementById('image-upload').files[0];

        if (!title || !category || !description) {
            alert('Title, category, and description are required.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('status', status);
        formData.append('publishDate', publishDate);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

        try {
            const response = await fetch('http://localhost:5001/api/health-tips', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || 'Failed to save health tip');
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-save"></i> Create Health Tip';
                return;
            }

            alert('Health tip created successfully');
            window.location.href = 'health-tips-view.html';

        } catch (error) {
            console.error(error);
            alert('Server error');
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-save"></i> Create Health Tip';
        }
    });

    if (tipId) {
        document.querySelector('h1').textContent = 'Edit Health Tip';

        fetch(`http://localhost:5001/api/health-tips/${tipId}`)
            .then(res => res.json())
            .then(tip => {
                document.getElementById('title').value = tip.title;
                document.getElementById('category').value = tip.category;
                document.getElementById('description').value = tip.description;
                document.getElementById('status').value = tip.status;

                if (tip.publishDate) {
                    document.getElementById('publishDate').value =
                        tip.publishDate.split('T')[0];
                }
            });
    }

    document.getElementById('preview-btn').addEventListener('click', function () {
        alert('Preview would open in a new window.');
    });

    document.getElementById('cancel-btn').addEventListener('click', function () {
        if (confirm('Discard this health tip?')) {
            window.location.href = 'health-tips-view.html';
        }
    });
});
