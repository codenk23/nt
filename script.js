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
    const files = e.dataTransfer.files;
    handleFiles(files);
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
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        }
        reader.readAsDataURL(file);
    }
}

// Convert to PDF
convertBtn.addEventListener('click', async () => {
    if (!images.length) {
        alert('Please upload at least one image!');
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    for (let i = 0; i < images.length; i++) {
        const img = await loadImage(images[i]);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (img.height * pdfWidth) / img.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight);
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
