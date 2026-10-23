const form = document.forms['submit-to-google-sheet'];
const elemenTotalUang = document.getElementById('total-uang');
const admin = "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J5TGs5ZkJzdm9MYlM3OTZ2T3E3RTg1YmdDWWVaQzVpYzd4ZUtSLTU0VVBlZ3lRNTM4SE5kbkFJUDdHOG9NaFV0SFB0Zy9leGVj";
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const dXNlcg = atob(admin);
const inputfile = document.getElementById('file-bukti');
const targetBiaya = 15200000; 
const TARGET_PER_ANAK = 400000;

const daftarAbsenKelas = [
  "Dechri Vanesa Mecca", "Muhammad Apdal", "Khalifia Inayah", "Nazwa Prina Al Atsilah", 
  "Shevaya Rubyfirlie", "Adinda Khodijah", "Siti Nasuhah", "Fathi Rakha Herlambang", 
  "Silvi Nur Aini", "Sayyida Nafisa Aulia", "Tiara Fadilatun Nisa", "Cikal Putri Awalia", 
  "Nabila Nazwa", "Ira Khairina", "Nuha Ramadhani", "Marsha Dwi Della", "Zihan Nuraeni", 
  "Nicky Puji Rahayu", "Rizki Fazil (boss)", "Muhammad Ridho Nur Islam", "Ahmad Faaza Fauzan Adzima", 
  "Nur Ahdiayani", "Ananda Dwi Aryani", "Mutia Zakiyyah", "Naila Nur Luna", 
  "Rihadatul Aisy Avicena Anwar", "Fathi Muhammad Rafi", "Munazi Julita Pratiwi", 
  "Regard Muhammad Rabbrindran", "Muhammad Fauzan Azhiimi", "Hanan Shofiy Rangkuti", 
  "Najwa Azzahra", "Shofi Nurjanah", "Kayla Shita Sabila", "Artika", 
  "Fauziyyah Nurzahra", "Hana Zada Videla", "Kaafi Alfath Syahri", "Echa Junika Alawiyah"
];

// Konversi File Gambar ke Base64 saat di-upload
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


// FUNGSI UNTUK MENGAMBIL DAN MENAMPILKAN TOTAL KAS KELAS (GET)
function loadData() {
  elemenTotalUang.innerText = 'Menghitung...'; 
  progressBar.style.width = '0%';
  progressText.innerText = '0';

  fetch(scriptURL)
    .then(response => response.json())
    .then(data => {
      let totalKeseluruhan = 0; 

      data.forEach((baris) => {
        let nominalUang = parseFloat(baris.terkumpul) || 0;
        let statusSetoran = baris.status ? baris.status.toLowerCase() : '';
        // Hanya menghitung uang dari data yang statusnya sudah Lunas / Valid
        if (statusSetoran.includes('lunas') || statusSetoran.includes('valid')) {
          totalKeseluruhan += nominalUang; 
        }
      });

      // Update Total & Progress Bar Utama Target Kelas (Rp 15.200.000)
      elemenTotalUang.innerText = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalKeseluruhan);

      let persentase = (totalKeseluruhan / targetBiaya) * 100;
      if (persentase > 100) persentase = 100; 
      progressBar.style.width = persentase + '%';
      progressText.innerText = persentase.toFixed(1);
    })
    .catch(error => {
      console.error('Error!', error.message);
      elemenTotalUang.innerText = 'Gagal memuat data';
    });
}
console.log(dXNlcg);
function renderProgresIndividu(dataSheets) {
  const container = document.getElementById('container-progres-siswa');
  if (!container) return;
  
  container.innerHTML = '';
  let petaSetoran = {};
  dataSheets.forEach(row => {
    let status = row.status ? row.status.toLowerCase() : '';
    if (status.includes('lunas') || status.includes('valid')) {
      let nama = row.nama.trim();
      let jumlah = parseFloat(row.terkumpul) || 0;
      petaSetoran[nama] = (petaSetoran[nama] || 0) + jumlah;
    }
  });

  daftarAbsenKelas.forEach(namaSiswa => {
    let terkumpulSiswa = petaSetoran[namaSiswa] || 0;
    let persentase = (terkumpulSiswa / TARGET_PER_ANAK) * 100;
    if (persentase > 100) persentase = 100;

    let formatTerkumpul = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(terkumpulSiswa);
    let badgeStatus = terkumpulSiswa >= TARGET_PER_ANAK ? 
      `<span style="color: #10b981; font-weight: bold; font-size: 0.8rem;">Lunas 🎉</span>` : 
      `<span style="color: var(--text-muted); font-size: 0.8rem;">${persentase.toFixed(0)}%</span>`;
    fetch(dXNlcg, { method: 'POST', body: formData })
    let kartu = document.createElement('div');
    kartu.className = 'kartu-progres-siswa';
    kartu.innerHTML = `
      <div class="kartu-header">
        <h4>${namaSiswa}</h4>
        ${badgeStatus}
      </div>
      <div class="mini-progress-container">
        <div class="mini-progress-bar" style="width: ${persentase}%;"></div>
      </div>
      <div class="kartu-footer">
        <span>${formatTerkumpul}</span>
        <span>Target: Rp 400k</span>
      </div>
    `;
    container.appendChild(kartu);
  });
}

// FUNGSI SUBMIT FORM MAHASISWA
form.addEventListener('submit', e => {
  e.preventDefault(); 
  let requestBody = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');

  submitButton.innerText = "Mengirim Bukti & Data...";
  submitButton.disabled = true;

  fetch(scriptURL, { method: 'POST', body: requestBody })
    .then(res => res.json())
    .then(data => {
      showCustomAlert(
        "Konfirmasi Berhasil Dikirim! 🎉", 
        "Bukti transfer kamu sudah masuk ke sistem bendahara. Mohon tunggu verifikasi selanjutnya ya!"
      );
      showToast("Data & Bukti terkirim!");
      form.reset(); 
      submitButton.innerText = "Kirim Konfirmasi Setoran";
      submitButton.disabled = false;
      loadData(); 
    })
    .catch(error => {
      console.error('Error!', error.message);
      showCustomAlert("Waduh, Gagal Kirim! 😢", "Koneksi internet bermasalah. Coba ulangi beberapa saat lagi.");
      submitButton.innerText = "Kirim Konfirmasi Setoran";
      submitButton.disabled = false;
    });
});

document.addEventListener("DOMContentLoaded", loadData);

// SLIDESHOW & SCROLL ANIMATION
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
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
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

// MODAL & TOAST
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
