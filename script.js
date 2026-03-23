document.addEventListener('DOMContentLoaded', () => {
    // Modal Selectors
    const modalBackdrop = document.getElementById('modal-backdrop');
    const addSubBtn = document.getElementById('add-sub-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelModalBtn = document.getElementById('cancel-modal');
    
    // Open Modal
    if (addSubBtn && modalBackdrop) {
        addSubBtn.addEventListener('click', () => {
            modalBackdrop.classList.add('active');
        });
    }
    
    // Close Functions
    const closeModal = () => {
        if(modalBackdrop) {
            modalBackdrop.classList.remove('active');
        }
    };
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    
    // Close when clicking outside of modal
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                closeModal();
            }
        });
    }
    
    // Prevent form submit for visual demonstration
    const form = document.getElementById('add-sub-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            closeModal();
        });
    }
});
