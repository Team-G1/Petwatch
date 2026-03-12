
      document.addEventListener("DOMContentLoaded", async () => {
        const params = new URLSearchParams(window.location.search);
        const tipId = params.get("id");
        const uploadBtn = document.getElementById("upload-btn");
        const changeImageBtn = document.getElementById("change-image-btn");

        uploadBtn.addEventListener("click", () => {
          imageInput.click();
        });

        changeImageBtn.addEventListener("click", () => {
          imageInput.click();
        });

        if (!tipId) {
          alert("Invalid tip ID");
          window.location.href = "health-tips-view.html";
          return;
        }

        const titleInput = document.getElementById("tip-title");
        const categoryInput = document.getElementById("category");
        const descInput = document.getElementById("tip-description");
        const statusInput = document.getElementById("status");
        const publishDateInput = document.getElementById("publish-date");
        const imageInput = document.getElementById("image-upload");
        const currentImage = document.getElementById("current-image");

        // 1. FETCH + PREFILL
        try {
          const res = await fetch(
            `http://localhost:5001/api/health-tips/${tipId}`,
          );
          const tip = await res.json();

          titleInput.value = tip.title;
          categoryInput.value = tip.category;
          descInput.value = tip.description;
          statusInput.value = tip.status;

          if (tip.publishDate) {
            publishDateInput.value = tip.publishDate.split("T")[0];
          }

          if (tip.image) {
            currentImage.src = `http://localhost:5001${tip.image}`;
          }
        } catch (err) {
          alert("Failed to load tip");
          return;
        }

        // 2. IMAGE PREVIEW
        imageInput.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;

          if (!file.type.startsWith("image/")) {
            alert("Invalid image");
            return;
          }

          if (file.size > 2 * 1024 * 1024) {
            alert("Max image size 2MB");
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => (currentImage.src = e.target.result);
          reader.readAsDataURL(file);
        });

        // 3. SAVE (UPDATE)
        document
          .getElementById("save-btn")
          .addEventListener("click", async function () {
            if (!titleInput.value.trim()) {
              alert("Title is required");
              return;
            }

            const formData = new FormData();
            formData.append("title", titleInput.value);
            formData.append("category", categoryInput.value);
            formData.append("description", descInput.value);
            formData.append("status", statusInput.value);
            formData.append("publishDate", publishDateInput.value);

            if (imageInput.files[0]) {
              formData.append("image", imageInput.files[0]);
            }

            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            try {
              const res = await fetch(
                `http://localhost:5001/api/health-tips/${tipId}`,
                {
                  method: "PUT",
                  body: formData,
                },
              );

              if (!res.ok) throw new Error();

              alert("Health tip updated");
              window.location.href = "health-tips-view.html";
            } catch {
              alert("Update failed");
              this.disabled = false;
              this.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            }
          });

        // 4. DELETE
        document
          .getElementById("delete-btn")
          .addEventListener("click", async () => {
            if (!confirm("Delete this health tip?")) return;

            await fetch(`http://localhost:5001/api/health-tips/${tipId}`, {
              method: "DELETE",
            });

            window.location.href = "health-tips-view.html";
          });
      });