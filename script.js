// Main website scripts
document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');
        });
    }

    // Image upload form management
    const imageUpload = document.getElementById('imageUpload');
    const previewContainer = document.getElementById('previewContainer');
    const sizeInfo = document.getElementById('sizeInfo');
    const descriptionTextarea = document.getElementById('description');
    const charCount = document.querySelector('.char-count');
    const uploadForm = document.getElementById('upload-form');
    const submitBtn = document.getElementById('submitBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');

    let totalFileSize = 0;
    const maxTotalSize = 10 * 1024 * 1024; // 10 MB
    const maxIndividualSize = 2 * 1024 * 1024; // 2 MB
    const maxFileCount = 5;

    // Preview selected images
    if (imageUpload) {
        imageUpload.addEventListener('change', function () {
            previewContainer.innerHTML = '';
            totalFileSize = 0;

            const files = Array.from(this.files);

            // Check file count
            if (files.length > maxFileCount) {
                alert(`Maximum ${maxFileCount} files can be uploaded`);
                this.value = '';
                return;
            }

            // Check each file size and total size
            for (let file of files) {
                if (file.size > maxIndividualSize) {
                    alert(`File "${file.name}" exceeds maximum allowed size (2 MB)`);
                    this.value = '';
                    return;
                }
                totalFileSize += file.size;
            }

            if (totalFileSize > maxTotalSize) {
                alert(`Total file size exceeds ${maxTotalSize / (1024 * 1024)} MB`);
                this.value = '';
                totalFileSize = 0;
                return;
            }

            // Update size information
            updateSizeInfo();

            // Create preview for each image
            files.forEach((file, index) => {
                const reader = new FileReader();

                reader.onload = function (e) {
                    const preview = document.createElement('div');
                    preview.className = 'image-preview';

                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = `Preview ${file.name}`;

                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'preview-remove';
                    removeBtn.innerHTML = '×';
                    removeBtn.type = 'button';

                    // Remove image from list
                    removeBtn.addEventListener('click', function () {
                        preview.remove();

                        // Update file list
                        const dataTransfer = new DataTransfer();
                        const remainingFiles = Array.from(imageUpload.files).filter((_, i) => i !== index);

                        remainingFiles.forEach(file => dataTransfer.items.add(file));
                        imageUpload.files = dataTransfer.files;

                        // Update total size
                        totalFileSize -= file.size;
                        updateSizeInfo();

                        // If all images are removed
                        if (remainingFiles.length === 0) {
                            const placeholder = document.createElement('p');
                            placeholder.className = 'preview-placeholder';
                            placeholder.textContent = 'Selected image preview will be displayed here';
                            previewContainer.appendChild(placeholder);
                        }
                    });

                    preview.appendChild(img);
                    preview.appendChild(removeBtn);
                    previewContainer.appendChild(preview);
                };

                reader.readAsDataURL(file);
            });
        });
    }

    // Update file size information
    function updateSizeInfo() {
        if (sizeInfo) {
            const sizeInMB = (totalFileSize / (1024 * 1024)).toFixed(2);
            sizeInfo.textContent = `Total size: ${sizeInMB} MB`;

            // Change color when approaching limit
            if (totalFileSize > maxTotalSize * 0.8) {
                sizeInfo.style.color = '#e74c3c';
            } else {
                sizeInfo.style.color = '';
            }
        }
    }

    // Character counter for description
    if (descriptionTextarea && charCount) {
        descriptionTextarea.addEventListener('input', function () {
            const length = this.value.length;
            charCount.textContent = `${length}/500`;

            // Change color when approaching limit
            if (length > 450) {
                charCount.style.color = '#e74c3c';
            } else {
                charCount.style.color = '';
            }
        });
    }

    // Form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Final validation
            const files = imageUpload.files;
            const consentCheckbox = document.getElementById('consent');

            if (files.length === 0) {
                alert('Please select at least one image');
                return;
            }

            if (!consentCheckbox.checked) {
                alert('Please agree to the terms and conditions');
                return;
            }

            // Show loading indicator
            submitBtn.style.display = 'none';
            loadingIndicator.style.display = 'block';

            // Submit form with AJAX
            const formData = new FormData(this);

            fetch(this.action, {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    // Hide loading indicator
                    submitBtn.style.display = 'block';
                    loadingIndicator.style.display = 'none';

                    if (data.success) {
                        alert('Images successfully uploaded. We will contact you.');
                        uploadForm.reset();
                        previewContainer.innerHTML = '<p class="preview-placeholder">Selected image preview will be displayed here</p>';
                        totalFileSize = 0;
                        updateSizeInfo();
                    } else {
                        alert('Error uploading images: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    submitBtn.style.display = 'block';
                    loadingIndicator.style.display = 'none';
                    alert('Server connection error. Please try again.');
                });
        });
    }

    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                // Close menu in mobile view
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }

                // Scroll to target element
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
});