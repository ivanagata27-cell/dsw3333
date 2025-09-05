<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Sistem Layout Gudang</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">

<!-- MENU AWAL -->
<div id="menu" class="text-center space-y-4">
  <h1 class="text-2xl font-bold">📦 Sistem Layout</h1>
  <button onclick="showPage('produksi')" class="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600">Produksi</button>
  <button onclick="showPage('pengambilan')" class="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600">Pengambilan</button>
  <button onclick="showPage('monitoring')" class="px-6 py-3 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600">Monitoring</button>
</div>

<!-- PRODUKSI -->
<div id="produksi" class="hidden text-center space-y-4">
  <h2 class="text-xl font-semibold">📥 Produksi - Input Barang</h2>

  <label class="block">Pilih Jenis:
    <select id="jenisProd" class="border px-2 py-1 rounded">
      <option value="cartridge">Cartridge</option>
      <option value="roll">Roll</option>
    </select>
  </label>

  <label class="block">Nomor Kotak (opsional):
    <input type="number" id="boxNumberProd" class="border px-2 py-1 rounded" placeholder="Kosongkan jika penuh">
  </label>

  <label class="block">Isi Barang:
    <input type="number" id="boxValueProd" class="border px-2 py-1 rounded">
  </label>

  <button onclick="addBarang()" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Simpan</button>
  <button onclick="backMenu()" class="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Kembali</button>
</div>

<!-- PENGAMBILAN -->
<div id="pengambilan" class="hidden text-center space-y-4">
  <h2 class="text-xl font-semibold">📤 Pengambilan Barang</h2>

  <label class="block">Pilih Jenis:
    <select id="jenisTake" class="border px-2 py-1 rounded">
      <option value="cartridge">Cartridge</option>
      <option value="roll">Roll</option>
    </select>
  </label>

  <label class="block">Nomor Kotak:
    <input type="number" id="boxNumberTake" class="border px-2 py-1 rounded">
  </label>

  <button onclick="ambilBarang()" class="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Ambil</button>
  <button onclick="backMenu()" class="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Kembali</button>
</div>

<!-- MONITORING -->
<div id="monitoring" class="hidden text-center space-y-4">
  <h2 class="text-xl font-semibold">📊 Monitoring Gudang</h2>

  <h3 class="text-lg font-bold mt-4">Cartridge</h3>
  <div id="gridCartridge" class="grid grid-cols-3 gap-4 max-w-md mx-auto"></div>

  <h3 class="text-lg font-bold mt-6">Roll</h3>
  <div id="gridRoll" class="grid grid-cols-3 gap-4 max-w-md mx-auto"></div>

  <h3 class="text-lg font-bold mt-6">Barang Tidak ada Layout</h3>
  <div id="pending" class="grid grid-cols-2 gap-4 max-w-md mx-auto"></div>

  <button onclick="backMenu()" class="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Kembali</button>
</div>

<script>
  // Data penyimpanan
  let boxesCartridge = Array(23).fill(null);
  let boxesRoll = Array(13).fill(null);

  // Pending (barang tanpa kotak)
  let pendingCartridge = [];
  let pendingRoll = [];

  function showPage(page) {
    document.getElementById("menu").classList.add("hidden");
    ["produksi", "pengambilan", "monitoring"].forEach(id => {
      document.getElementById(id).classList.add("hidden");
    });
    document.getElementById(page).classList.remove("hidden");
    if (page === "monitoring") renderGrid();
  }

  function backMenu() {
    ["produksi", "pengambilan", "monitoring"].forEach(id => {
      document.getElementById(id).classList.add("hidden");
    });
    document.getElementById("menu").classList.remove("hidden");
  }

  function renderGrid() {
    renderGridFor("gridCartridge", boxesCartridge, "Cartridge");
    renderGridFor("gridRoll", boxesRoll, "Roll");
    renderPending();
  }

  function renderGridFor(gridId, arr, label) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = "";
    arr.forEach((val, i) => {
      const box = document.createElement("div");
      box.className = `p-6 rounded-lg shadow text-white font-bold text-lg ${
        val ? "bg-green-500" : "bg-red-500"
      }`;
      box.innerText = `${label} ${i + 1}\n${val ? val : "Kosong"}`;
      grid.appendChild(box);
    });
  }

  function renderPending() {
    const div = document.getElementById("pending");
    div.innerHTML = `
      <div class="p-6 rounded-lg shadow border text-left text-sm font-bold">
        <p>Cartridge Pending:</p>
        ${pendingCartridge.length > 0 ? pendingCartridge.map((val, i) => `<p>- Barang ${i+1}: ${val}</p>`).join("") : "<p>Tidak ada</p>"}
      </div>
      <div class="p-6 rounded-lg shadow border text-left text-sm font-bold">
        <p>Roll Pending:</p>
        ${pendingRoll.length > 0 ? pendingRoll.map((val, i) => `<p>- Barang ${i+1}: ${val}</p>`).join("") : "<p>Tidak ada</p>"}
      </div>
    `;
  }

  function addBarang() {
    const jenis = document.getElementById("jenisProd").value;
    const boxNoInput = document.getElementById("boxNumberProd").value;
    const value = parseInt(document.getElementById("boxValueProd").value);

    let arr = jenis === "cartridge" ? boxesCartridge : boxesRoll;
    let pendingArr = jenis === "cartridge" ? pendingCartridge : pendingRoll;

    if (boxNoInput) {
      // Kalau user isi nomor kotak
      const boxNo = parseInt(boxNoInput) - 1;
      if (boxNo >= 0 && boxNo < arr.length) {
        if (!arr[boxNo]) {
          arr[boxNo] = value;
          alert(`Barang dimasukkan ke ${jenis} Box ${boxNo + 1} (${value})`);
        } else {
          alert("Kotak sudah terisi!");
        }
      } else {
        alert("Nomor box tidak valid!");
      }
    } else {
      // Kalau user tidak isi nomor kotak → otomatis pending
      pendingArr.push(value);
      alert(`Semua kotak penuh! Barang disimpan di Pending ${jenis}`);
    }
  }

  function ambilBarang() {
    const jenis = document.getElementById("jenisTake").value;
    const boxNo = parseInt(document.getElementById("boxNumberTake").value) - 1;

    let arr = jenis === "cartridge" ? boxesCartridge : boxesRoll;

    if (boxNo >= 0 && boxNo < arr.length && arr[boxNo]) {
      arr[boxNo] = null;
      alert(`Barang di ${jenis} Box ${boxNo + 1} berhasil diambil`);
    } else {
      alert("Box kosong atau nomor tidak valid!");
    }
  }
</script>
</body>
</html>
