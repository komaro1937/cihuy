const form = document.forms['submit-to-google-sheet'];
const elemenTotalUang = document.getElementById('total-uang');
const _sysToken = "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J5TGs5ZkJzdm9MYlM3OTZ2T3E3RTg1YmdDWWVaQzVpYzd4ZUtSLTU0VVBlZ3lRNTM4SE5kbkFJUDdHOG9NaFV0SFB0Zy9leGVj";
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const inputfile = document.getElementById('file-bukti');
const _endpointX = atob(_sysToken); 
const targetBiaya = 15200000; 

inputfile.addEventListener('change', function(e) {
  let file = e.target.files[0];
  if (file) {
    document.getElementById('file-name').value = file.name;
    let reader = new FileReader();
    reader.onload = function(event) {
      document.getElementById('file-base64').value = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function loadData() {
  elemenTotalUang.innerText = 'Menghitung...'; 
  progressBar.style.width = '0%';
  progressText.innerText = '0';

  fetch(_endpointX)
    .then(response => response.json())
    .then(data => {
      // Mengambil data 'totalTerkumpul' yang dikirim dari Backend GAS
      let totalKeseluruhan = parseFloat(data.totalTerkumpul) || 0; 

      elemenTotalUang.innerText = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalKeseluruhan);

      let persentase = (totalKeseluruhan / targetBiaya) * 100;
      if (persentase > 100) persentase = 100; 
      progressBar.style.width = persentase + '%';
      progressText.innerText = persentase.toFixed(1);
    })
    .catch(error => {
      console.error('Error memuat total kas:', error.message);
      elemenTotalUang.innerText = 'Gagal memuat data';
    });
}

form.addEventListener('submit', e => {
  e.preventDefault(); 
  let requestBody = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');

  submitButton.innerText = "Mengirim Bukti & Data...";
  submitButton.disabled = true;

  fetch(_endpointX, { method: 'POST', body: requestBody })
    .then(res => res.json())
    .then(data => {
      if (data.result === 'success') {
        showCustomAlert(
          "Konfirmasi Berhasil Dikirim! 🎉", 
          "Bukti transfer kamu sudah masuk ke sistem bendahara. Mohon tunggu verifikasi selanjutnya ya!"
        );
        showToast("Data & Bukti terkirim!");
        form.reset(); 
        loadData(); 
      } else {
        // Tampilkan pesan penolakan dari sistem anti-spam Backend
        showCustomAlert("Gagal Dikirim ⚠️", data.message);
      }
    })
    .catch(error => {
      console.error('Error saat submit:', error.message);
      showCustomAlert("Waduh, Gagal Kirim! 😢", "Koneksi internet bermasalah. Coba ulangi beberapa saat lagi.");
    })
    .finally(() => {
      submitButton.innerText = "Kirim Konfirmasi Setoran";
      submitButton.disabled = false;
    });
});

// Jalankan pengambilan total uang saat web pertama dibuka
document.addEventListener("DOMContentLoaded", loadData);

let slideIndex = 1;
showSlides(slideIndex); 
function plusSlides(n) { showSlides(slideIndex += n); }
function currentSlide(n) { showSlides(slideIndex = n); }
function showSlides(n) {
  let slides = document.getElementsByClassName("slide");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }
  for (let i = 0; i < slides.length; i++) slides[i].style.display = "none";
  for (let i = 0; i < dots.length; i++) dots[i].className = dots[i].className.replace(" active", "");
  if (slides[slideIndex - 1]) slides[slideIndex - 1].style.display = "block";
  if (dots[slideIndex - 1]) dots[slideIndex - 1].className += " active";
}

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('tampil'); 
      observer.unobserve(entry.target);     
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.scroll-anim').forEach((el) => observer.observe(el));

function showToast(pesan) {
  let existingToast = document.getElementById('custom-toast');
  if (existingToast) existingToast.remove();
  let toast = document.createElement('div');
  toast.id = 'custom-toast';
  toast.innerHTML = `<span class="iconify" data-icon="mdi:check-decagram" style="font-size: 1.3rem;"></span> ${pesan}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500);
}

function showCustomAlert(judul, pesan, callback) {
  let overlay = document.createElement('div');
  overlay.className = 'custom-modal-overlay';
  overlay.innerHTML = `
    <div class="custom-modal-box">
      <h3>${judul}</h3>
      <p>${pesan}</p>
      <div class="custom-modal-actions">
        <button class="modal-btn modal-btn-primary" id="modal-ok-btn">Mantap, Paham!</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('modal-ok-btn').onclick = () => { overlay.remove(); if (callback) callback(); };
}

// Fitur Salin Nomor Rekening Bendahara
function salinNoRek() {
  const noRekElem = document.getElementById('no-rek-bsi');
  // Akan membaca nomor dari HTML, atau fallback ke 7123456789 jika ID tidak ditemukan
  const noRek = noRekElem ? noRekElem.innerText : "7123456789"; 
  navigator.clipboard.writeText(noRek).then(() => {
    showToast("Nomor rekening berhasil disalin! 📋");
  }).catch(() => {
    showToast("Gagal menyalin, silakan salin manual ya.");
  });
}