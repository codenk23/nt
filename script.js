const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const convertBtn = document.getElementById('convertBtn');

let images = [];

// Drag & Drop
uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.style.background = "rgba(255,255,255,0.2)";
});
uploadArea.addEventListener('dragleave', e => {
    e.preventDefault();
    uploadArea.style.background = "transparent";
});
uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.style.background = "transparent";
    handleFiles(e.dataTransfer.files);
});

// Click to select
uploadArea.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', () => handleFiles(imageInput.files));

// Handle selected files
function handleFiles(files) {
    for (let file of files) {
        if (!file.type.startsWith('image/')) continue;
        images.push(file);

        const reader = new FileReader();
        reader.onload = e => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('image-wrapper');

            const img = document.createElement('img');
            img.src = e.target.result;

            const removeBtn = document.createElement('button');
            removeBtn.innerText = '×';
            removeBtn.classList.add('remove-btn');
            removeBtn.onclick = () => {
                const index = images.indexOf(file);
                if (index > -1) images.splice(index, 1);
                wrapper.remove();
            }

            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            preview.appendChild(wrapper);
        }
        reader.readAsDataURL(file);
    }
}

// Convert to PDF with centered images
convertBtn.addEventListener('click', async () => {
    if (!images.length) {
        alert('Please upload at least one image!');
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    for (let i = 0; i < images.length; i++) {
        const img = await loadImage(images[i]);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Scale image to fit page
        let imgWidth = img.width;
        let imgHeight = img.height;
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        imgWidth *= ratio;
        imgHeight *= ratio;

        // Center image on page
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        if (i > 0) pdf.addPage();
        pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
    }

    pdf.save('images.pdf');
});

// Helper to load image as Image object
function loadImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => resolve(img);
        };
        reader.readAsDataURL(file);
    });
}

