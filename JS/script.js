    // 0. Helper Function - Toast Notification
    function showToast(title, message, type = 'success', duration = 8000) {
        const toastElement = document.getElementById('toastNotification');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');
        
        if (!toastElement) return;

        // Set content
        toastTitle.textContent = title;
        toastMessage.textContent = message;

        // Set style berdasarkan type
        toastElement.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
        switch(type) {
            case 'error':
                toastElement.classList.add('bg-danger');
                toastIcon.className = 'fa-solid fa-circle-xmark me-2';
                break;
            case 'warning':
                toastElement.classList.add('bg-warning');
                toastIcon.className = 'fa-solid fa-triangle-exclamation me-2';
                toastElement.querySelector('.toast-header').style.color = '#000';
                break;
            case 'info':
                toastElement.classList.add('bg-info');
                toastIcon.className = 'fa-solid fa-circle-info me-2';
                break;
            default: // success
                toastElement.classList.add('bg-success');
                toastIcon.className = 'fa-solid fa-circle-check me-2';
        }

        // Pastikan text color putih untuk dark backgrounds
        if (type !== 'warning') {
            toastElement.querySelector('.toast-header').style.color = '#fff';
        }

        // Show toast
        const toast = new bootstrap.Toast(toastElement, { delay: duration });
        toast.show();
    }

    // 1. Inisialisasi AOS
    AOS.init({
        once: true,
        offset: 50,
        duration: 800,
        easing: 'ease-out-cubic',
    });

    // 2. Isi Dropdown Waktu Pemesanan (08:00 - 22:00)
    try {
        const timeSelect = document.getElementById('bookingTime');
        if (timeSelect) {
            for(let i = 8; i <= 22; i++) {
                const hour = i < 10 ? `0${i}` : `${i}`;
                const timeValue = `${hour}:00`;
                const option = document.createElement('option');
                option.value = timeValue;
                option.textContent = `${timeValue} - ${i+1 < 10 ? '0'+(i+1) : i+1}:00`;
                timeSelect.appendChild(option);
            }
        }
    } catch(e) {
        console.log('Gagal membuat dropdown waktu:', e);
    }

    // 3. Tetapkan Tanggal Minimum untuk Pemesanan (Hari Ini)
    try {
        const dateInput = document.getElementById('bookingDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }
    } catch(e) {
        console.log('Gagal set tanggal minimum:', e);
    }

    // 4. Navbar Scroll Effect
    try {
        const navbar = document.querySelector('.navbar');
        const heroSection = document.querySelector('.hero-section');
        
        if (navbar && heroSection) {
            const handleNavbarScroll = () => {
                const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
                if (window.scrollY >= heroBottom - navbar.offsetHeight) {
                    navbar.classList.add('navbar-scrolled');
                } else {
                    navbar.classList.remove('navbar-scrolled');
                }
            };
            window.addEventListener('scroll', handleNavbarScroll);
        }
    } catch(e) {
        console.log('Gagal inisial navbar:', e);
    }

    // 5. Deteksi Hari Libur
    try {
        const dateInput = document.getElementById('bookingDate');
        const holidayAlert = document.getElementById('holidayAlert');
        const submitBtn = document.querySelector('button[type="submit"]');
        
        if (dateInput && holidayAlert && submitBtn) {
            dateInput.addEventListener('change', function() {
                const selectedDate = new Date(this.value);
                const dayOfWeek = selectedDate.getDay();
                const isClosed = dayOfWeek === 0; // 0 = Minggu
                
                if (isClosed) {
                    holidayAlert.classList.remove('d-none');
                    submitBtn.disabled = true;
                } else {
                    holidayAlert.classList.add('d-none');
                    submitBtn.disabled = false;
                }
            });
        }
    } catch(e) {
        console.log('Gagal set holiday check:', e);
    }

    // 6. Tangani Pengajuan Formulir
    try {
        const form = document.getElementById('bookingForm');
        let isSubmitting = false;

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Cegah double submit
                if (isSubmitting) return;
                isSubmitting = true;

                // Ambil data dari form
                const fullName = document.getElementById('fullName')?.value || '';
                const phone = document.getElementById('phone')?.value || '';
                const address = document.getElementById('address')?.value || '';
                const serviceType = document.getElementById('serviceType')?.value || '';
                const packageType = document.getElementById('packageType')?.value || '';
                const bookingDate = document.getElementById('bookingDate')?.value || '';
                const bookingTime = document.getElementById('bookingTime')?.value || '';

                // Validasi input
                if (!fullName || !phone || !bookingDate || !bookingTime) {
                    showToast('Perhatian', 'Harap isi semua field yang wajib!', 'warning');
                    isSubmitting = false;
                    return;
                }

                // Ubah format tanggal
                const [year, month, day] = bookingDate.split('-');
                const formattedDate = `${day}/${month}/${year}`;

                // Buat pesan
                const message = `Halo, saya ingin melakukan pemesanan dengan detail berikut:

*INFORMASI PEMESANAN*
Nama: ${fullName}
Nomor Telepon: ${phone}
Alamat: ${address}

*DETAIL LAYANAN*
Jenis Layanan: ${serviceType}
Paket: ${packageType}
Tanggal: ${formattedDate}
Waktu: ${bookingTime}

Apakah slot waktu ini tersedia? Mohon konfirmasi secepatnya.

Terima kasih!`;

                // Bersihkan nomor telepon
                let cleanPhone = phone.replace(/\D/g, '');
                if (cleanPhone.startsWith('0')) {
                    cleanPhone = '62' + cleanPhone.substring(1);
                } else if (!cleanPhone.startsWith('62')) {
                    cleanPhone = '62' + cleanPhone;
                }

                // Buat URL WhatsApp
                const encodedMessage = encodeURIComponent(message);
                const whatsappURL = `https://wa.me/6283166230510?text=${encodedMessage}`;

                // Tampilkan toast success
                showToast('Berhasil!', 'Permintaan disiapkan. Anda akan diarahkan ke WhatsApp untuk mengirim pesan.', 'success', 3000);
                form.reset();

                // Buka WhatsApp di tab baru
                setTimeout(() => {
                    window.open(whatsappURL, '_blank');
                    isSubmitting = false;
                }, 500);
            });
        }
    } catch(e) {
        console.log('Gagal setup form:', e);
    }
